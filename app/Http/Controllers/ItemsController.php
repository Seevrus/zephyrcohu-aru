<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Models\Item;
use App\Models\Log;

class ItemsController extends Controller
{
    /**
     * Delete previous items and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreItemRequest $request)
    {
        $sender = $request->user();
        $company = $sender->company;
        $company->items()->delete();

        foreach ($request->data as $store) {
            Item::create([
                'company_id' => $company->id,
                'article_number' => $store['articleNumber'],
                'name' => $store['name'],
                'short_name' => $store['shortName'],
                'category' => $store['category'],
                'unit_name' => $store['unitName'],
                'product_catalog_code' => $store['productCatalogCode'],
                'vat_rate' => $store['vatRate'],
                'price' => $store['price'],
            ]);
        }

        Log::insert([
            'company_id' => $sender->company_id,
            'user_id' => $sender->id,
            'token_id' => $sender->currentAccessToken()->id,
            'action' => 'Stored ' . count($request->data) . ' items',
            'occured_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
