<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Models\Expiration;
use App\Models\Item;
use App\Models\Log;
use App\Models\Store;

class StoresController extends Controller
{
    /**
     * Delete previous stores and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        $sender = $request->user();
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
    }
}
