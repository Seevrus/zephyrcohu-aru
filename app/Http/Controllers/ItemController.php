<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateItemsRequest;
use App\Http\Requests\UpdateItemRequest;
use App\Http\Resources\ItemCollection;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use App\Models\Log;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ItemController extends Controller
{
    public function create_items(CreateItemsRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $newItems = [];
            foreach ($request->data as $itemRequest) {
                $existingItem = Item::where([
                    'article_number' => $itemRequest['articleNumber'],
                ])->first();

                if ($existingItem) continue;

                $item = Item::create([
                    'company_id' => $company->id,
                    'cn_code' => $itemRequest['CNCode'],
                    'barcode' => $itemRequest['barcode'] ?? null,
                    'article_number' => $itemRequest['articleNumber'],
                    'name' => $itemRequest['name'],
                    'short_name' => $itemRequest['shortName'],
                    'category' => $itemRequest['category'],
                    'unit_name' => $itemRequest['unitName'],
                    'product_catalog_code' => $itemRequest['productCatalogCode'],
                    'vat_rate' => $itemRequest['vatRate'],
                    'net_price' => $itemRequest['netPrice'],
                ]);

                $item->expirations()->createMany(
                    array_map(
                        fn ($expirationRequest) => [
                            'barcode' => $expirationRequest['barcode'] ?? null,
                            'expires_at' => Carbon::createFromFormat("Y-m", $expirationRequest['expiresAt'])->endOfMonth()->endOfDay(),
                        ],
                        $itemRequest['expirations']
                    )
                );

                if ($itemRequest['discounts'] ?? null) {
                    $item->discounts()->createMany(array_map(
                        fn ($discountRequest) => [
                            'name' => $discountRequest['name'],
                            'type' => $discountRequest['type'],
                            'amount' => $discountRequest['amount'] ?? null,
                        ],
                        $itemRequest['discounts']
                    ));
                }

                array_push($newItems, $item);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created ' . count($newItems) . ' items',
                'occured_at' => Carbon::now(),
            ]);

            return new ItemCollection($newItems);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $items = $sender->company->items()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $items->count() . ' items',
                'occured_at' => Carbon::now(),
            ]);

            return new ItemCollection($items);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function update_item(UpdateItemRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $item = Item::findOrFail($id);

            $this->authorize('update', $item);

            $expirationUpdates = $request->data['expirations'] ?? null;
            if ($expirationUpdates) {
                $currentExpirations = $item->expirations();

                // Additional validations for expiration
                foreach ($expirationUpdates as $expirationUpdate) {
                    $expiresAt = $expirationUpdate['expiresAt'];
                    $expiresAtFull = Carbon::createFromFormat("Y-m", $expiresAt)->endOfMonth()->endOfDay();
                    $currentExpiresAts = array_map(
                        fn ($ce) => $ce['expires_at'],
                        $currentExpirations->get()->toArray()
                    );

                    // For the sake of simplicity, this fails on the first malformed item
                    $action = $expirationUpdate['action'];
                    switch ($action) {
                        case 'delete':
                            if (array_search($expiresAtFull, $currentExpiresAts) === false) {
                                return response([
                                    'message' => "Invalid expiration to delete: " . $expiresAt
                                ], 422);
                            }
                            break;
                        case 'create':
                        default:
                            if (array_search($expiresAtFull, $currentExpiresAts) !== false) {
                                return response([
                                    'message' => "Invalid expiration to create: " . $expiresAt
                                ], 422);
                            }
                    }
                }

                // Actual updates
                foreach ($expirationUpdates as $expirationUpdate) {
                    $expiresAt = $expirationUpdate['expiresAt'];
                    $expiresAtFull = Carbon::createFromFormat("Y-m", $expiresAt)->endOfMonth()->endOfDay();

                    $action = $expirationUpdate['action'];
                    switch ($action) {
                        case 'delete':
                            $currentExpiration = $currentExpirations->firstWhere(['expires_at' => $expiresAtFull]);
                            $currentExpiration->delete();
                            break;
                        case 'create':
                        default:
                            $item->expirations()->create([
                                'barcode' => $expirationUpdate['barcode'] ?? null,
                                'expires_at' => $expiresAtFull,
                            ]);
                    }
                }
            }

            $discountUpdates = $request->data['discounts'] ?? null;
            if ($discountUpdates) {
                $currentDiscounts = $item->discounts();

                // Additional validations for discount
                foreach ($discountUpdates as $discountUpdate) {
                    $discountName = $discountUpdate['name'];
                    $currentNames = array_map(
                        fn ($cd) => $cd['name'],
                        $currentDiscounts->get()->toArray()
                    );

                    // For the sake of simplicity, this fails on the first malformed item
                    $action = $discountUpdate['action'];
                    switch ($action) {
                        case 'update':
                            if (array_search($discountName, $currentNames) === false) {
                                return response([
                                    'message' => "Invalid discount to update: " . $discountName
                                ], 422);
                            }
                            break;
                        case 'delete':
                            if (array_search($discountName, $currentNames) === false) {
                                return response([
                                    'message' => "Invalid discount to delete: " . $discountName
                                ], 422);
                            }
                            break;
                        case 'create':
                        default:
                            if (
                                array_search($discountName, $currentNames) !== false
                                || !($discountUpdate['name'] ?? null)
                                || !($discountUpdate['type'] ?? null)
                            ) {
                                return response([
                                    'message' => "Invalid discount to create: " . $discountName
                                ], 422);
                            }
                    }
                }

                // Actual updates
                foreach ($discountUpdates as $discountUpdate) {
                    $discountName = $discountUpdate['name'];

                    $action = $discountUpdate['action'];
                    switch ($action) {
                        case 'update':
                            $currentDiscount = $currentDiscounts->firstWhere(['name' => $discountName]);

                            if ($discountUpdate['type'] ?? null) {
                                $currentDiscount->type = $discountUpdate['type'];
                            }
                            if (($discountUpdate['amount'] ?? -3914) !== -3914) {
                                $currentDiscount->amount = $discountUpdate['amount'];
                            }

                            $currentDiscount->save();
                            break;
                        case 'delete':
                            $currentDiscount = $currentDiscounts->firstWhere(['name' => $discountName]);
                            $currentDiscount->delete();
                            break;
                        case 'create':
                        default:
                            $item->discounts()->create([
                                'name' => $discountName,
                                'type' => $discountUpdate['type'],
                                'amount' => $discountUpdate['amount'] ?? null,
                            ]);
                    }
                }
            }

            if ($request->data['CNCode'] ?? null) {
                $item->cn_code = $request->data['CNCode'];
            }
            if (!!$request->data['barcode'] || $request->data['barcode'] === null) {
                $item->barcode = $request->data['barcode'];
            }
            if ($request->data['name'] ?? null) {
                $item->name = $request->data['name'];
            }
            if ($request->data['shortName'] ?? null) {
                $item->short_name = $request->data['shortName'];
            }
            if ($request->data['category'] ?? null) {
                $item->category = $request->data['category'];
            }
            if ($request->data['unitName'] ?? null) {
                $item->unit_name = $request->data['unitName'];
            }
            if ($request->data['productCatalogCode'] ?? null) {
                $item->product_catalog_code = $request->data['productCatalogCode'];
            }
            if ($request->data['vatRate'] ?? null) {
                $item->vat_rate = $request->data['vatRate'];
            }
            if ($request->data['netPrice'] ?? null) {
                $item->net_price = $request->data['netPrice'];
            }

            $item->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated item ' . $item->id,
                'occured_at' => Carbon::now(),
            ]);

            return new ItemResource($item);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_item(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $item = Item::findOrFail($id);
            $this->authorize('remove', $item);

            $item->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed item ' . $item->id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
