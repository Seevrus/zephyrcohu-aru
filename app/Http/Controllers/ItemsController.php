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

class ItemsController extends Controller
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
                    'article_number' => $itemRequest['articleNumber'],
                    'name' => $itemRequest['name'],
                    'short_name' => $itemRequest['shortName'],
                    'category' => $itemRequest['category'],
                    'unit_name' => $itemRequest['unitName'],
                    'product_catalog_code' => $itemRequest['productCatalogCode'],
                    'vat_rate' => $itemRequest['vatRate'],
                    'net_price' => $itemRequest['netPrice'],
                ]);

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

            // TODO: add expirations
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

            if ($request->data['CNCode'] ?? null) {
                $item->cn_code = $request->data['CNCode'];
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
                'action' => 'Removed tem ' . $item->id,
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
