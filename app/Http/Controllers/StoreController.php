<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Http\Resources\StoreCollection;
use App\Models\Expiration;
use App\Models\Item;
use App\Models\Log;
use App\Models\Store;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StoreController extends Controller
{
    /**
     * View the list of stores
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Store::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $stores = $sender->company->stores()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . count($stores) . ' stores',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new StoreCollection($stores);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Detailed view of a store
     */
    public function view(string $code)
    {
        try {
            $store = Store::firstWhere('code', $code);
            $this->authorize('view', $store);

            $sender = request()->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $stores_with_items = $store->load('items', 'partners');

            $expirations = DB::select(DB::raw('SELECT i.id as item_id, i.article_number as item_article_number, e.expires_at as item_expires_at, e.quantity as item_quantity FROM stores s JOIN stock_item si ON s.id = si.store_id JOIN items i ON i.id = si.item_id JOIN expirations e ON e.stock_item_id = si.id GROUP BY i.id, i.article_number, e.expires_at, e.quantity, si.item_id, e.expires_at'));

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed store ' . $store->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return [
                'id' => $stores_with_items->id,
                'code' => $stores_with_items->code,
                'name' => $stores_with_items->name,
                'firstAvailableSerialNumber' => $stores_with_items->first_available_serial_number,
                'lastAvailableSerialNumber' => $stores_with_items->last_available_serial_number,
                'yearCode' => $stores_with_items->year_code,
                'items' => array_map(function ($item) use ($expirations) {
                    $item_expirations = array_values(array_filter($expirations, function ($expiration) use ($item) {
                        return $expiration->item_id == $item['id'];
                    }));

                    return [
                        'id' => $item['id'],
                        'code' => $item['article_number'],
                        'expirations' => array_map(function ($expiration) {
                            return [
                                'expiresAt' => $expiration->item_expires_at,
                                'quantity' => $expiration->item_quantity,
                            ];
                        }, $item_expirations),
                    ];
                }, $stores_with_items->items->toArray()),
                'partners' => array_map(function ($partner) {
                    return $partner['id'];
                }, $stores_with_items->partners->toArray())
            ];
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Delete previous stores and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $company = $sender->company;
            $company->stores()->delete();

            foreach ($request->data as $storeRequest) {
                $store = new Store([
                    'company_id' => $company->id,
                    'code' => $storeRequest['code'],
                    'name' => $storeRequest['name'],
                    'first_available_serial_number' => $storeRequest['firstAvailableSerialNumber'],
                    'last_available_serial_number' => $storeRequest['lastAvailableSerialNumber'],
                    'year_code' => $storeRequest['yearCode'],
                ]);

                $store->save();

                foreach ($storeRequest['items'] as $itemRequest) {
                    $item = Item::firstWhere('article_number', $itemRequest['articleNumber']);
                    $store->items()->attach($item->id);

                    $stock_item_id = $store->items()->withPivot('id')->wherePivot('item_id', $item->id)->wherePivot('store_id', $store->id)->first()->pivot->id;

                    foreach ($itemRequest['expirations'] as $expirationRequest) {
                        Expiration::create([
                            'stock_item_id' => $stock_item_id,
                            'expires_at' => date('Y-m-t', strtotime($expirationRequest['expiresAt'])),
                            'quantity' => $expirationRequest['quantity'],
                        ]);
                    }
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Stored ' . count($request->data) . ' stores',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }
}
