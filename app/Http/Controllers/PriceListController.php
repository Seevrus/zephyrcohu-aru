<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddItemsToPriceListRequest;
use App\Http\Requests\CreatePriceListRequest;
use App\Http\Requests\RemoveItemsFromPriceListRequest;
use App\Http\Requests\UpdatePriceListRequest;
use App\Http\Resources\PriceListCollection;
use App\Http\Resources\PriceListResource;
use App\Models\Log;
use App\Models\PriceList;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PriceListController extends Controller
{
    public function create_price_list(CreatePriceListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $priceListName = $request->data['name'];
            $priceList = PriceList::create([
                'company_id' => $company->id,
                'name' => $priceListName,
            ]);

            if (@$request->data['items']) {
                foreach ($request->data['items'] as $priceListItem) {
                    $priceList->items()->attach(
                        $priceListItem['itemId'],
                        ['net_price' => $priceListItem['netPrice']]
                    );
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created price list ' . $priceListName,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList->with('items')->first());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $priceLists = $sender->company->priceLists()->with('items')->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $priceLists->count() . ' price lists',
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListCollection($priceLists);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function view(Request $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $priceList = $sender->company->priceLists()->with('items')->findOrFail($id);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed price list ' . $id,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function update_price_list(UpdatePriceListRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $priceList = $sender->company->priceLists()->findOrFail($id);
            $this->authorize('update', $priceList);

            if (@$request->data['name']) {
                $priceList->name = $request->data['name'];
            }

            $priceList->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated price list ' . $priceList->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PriceListResource($priceList->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function remove_price_list(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $priceList = $sender->company->priceLists()->findOrFail($id);
            $this->authorize('remove', $priceList);

            $priceList->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed price list ' . $id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function upsert_items(AddItemsToPriceListRequest $request, int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $priceList = $sender->company->priceLists()->findOrFail($id);
            $this->authorize('upsert_items', $priceList);

            $requestItems = $request->data;

            $newItemsCount = 0;
            foreach ($requestItems as $requestItem) {
                $existingItem = $priceList->items()->find($requestItem['itemId']);
                if ($existingItem) {
                    $priceList->items()->syncWithoutDetaching([
                        $requestItem['itemId'] => ['net_price' => $requestItem['netPrice']],
                    ]);
                } else {
                    $newItemsCount += 1;
                    $priceList->items()->attach($requestItem['itemId'], [
                        'net_price' => $requestItem['netPrice'],
                    ]);
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Added ' . $newItemsCount . ' items to pricelist ' . $priceList->id,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList->with('items')->first());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function remove_items(RemoveItemsFromPriceListRequest $request, int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $priceList = $sender->company->priceLists()->findOrFail($id);
            $this->authorize('remove_items', $priceList);

            $requestItemIds = $request->data;

            $removedItemsCount = count($requestItemIds);
            foreach ($requestItemIds as $requestItemId) {
                $priceList->items()->detach($requestItemId);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed ' . $removedItemsCount . ' items from pricelist ' . $priceList->id,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList->with('items')->first());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }
}
