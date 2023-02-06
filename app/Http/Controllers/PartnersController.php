<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerRequest;
use App\Models\Item;
use App\Models\Partner;
use App\Models\PriceList;
use App\Models\PriceListItem;
use App\Models\Store;

class PartnersController extends Controller
{
    /**
     * Delete previous partners and store the new array in the database
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePartnerRequest $request)
    {
        $sender = $request->user();
        $company = $sender->company;
        $company->partners()->delete();
        $company->price_lists()->delete();

        foreach ($request->data as $partnerRequest) {
            $store = $partnerRequest['storeCode']
                ? Store::firstWhere('code', $partnerRequest['storeCode'])
                : null;

            $price_list = array_key_exists('priceList', $partnerRequest)
                ? new PriceList([
                    'company_id' => $company->id,
                    'code' => $partnerRequest['priceList']['code'],
                ])
                : null;

            if ($price_list) {
                $price_list->save();

                foreach ($partnerRequest['priceList']['items'] as $priceListItemRequest) {
                    $dbItem = Item::firstWhere('article_number', $priceListItemRequest['articleNumber']);

                    PriceListItem::create([
                        'price_list_id' => $price_list->id,
                        'item_id' => $dbItem->id,
                        'price' => $priceListItemRequest['price'],
                    ]);
                }
            }

            Partner::create([
                'company_id' => $company->id,
                'store_id' => $store ? $store->id : null,
                'price_list_id' => $price_list ? $price_list->id : null,
                'code' => $partnerRequest['code'],
                'site_code' => $partnerRequest['siteCode'],
                'name' => $partnerRequest['name'],
                'country' => $partnerRequest['country'],
                'postal_code' => $partnerRequest['postalCode'],
                'city' => $partnerRequest['city'],
                'address' => $partnerRequest['address'],
                'vat_number' => $partnerRequest['vatNumber'],
                'iban' => $partnerRequest['iban'],
                'bank_account' => $partnerRequest['bankAccount'],
                'phone_number' => $partnerRequest['phoneNumber'] ?? null,
                'email' => $partnerRequest['email'] ?? null,
            ]);
        }
    }
}
