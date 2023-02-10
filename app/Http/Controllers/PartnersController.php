<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerRequest;
use App\Http\Resources\PartnerCollection;
use App\Models\Item;
use App\Models\Log;
use App\Models\Partner;
use App\Models\PriceList;
use App\Models\PriceListItem;
use App\Models\Store;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PartnersController extends Controller
{
    /**
     * View the list of partners
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Partner::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partners = $sender->company->partners()->with('price_list.price_list_items')->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $partners->count() . ' partners',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerCollection($partners);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Delete previous partners and store the new array in the database
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePartnerRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

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

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Stored ' . count($request->data) . ' partners',
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
