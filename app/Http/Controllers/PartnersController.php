<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerRequest;
use App\Http\Resources\PartnerCollection;
use App\Models\Item;
use App\Models\Log;
use App\Models\Partner;
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

            $partners = $sender->company->partners()->with('partner_locations', 'items')->get();

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
     * @param  \Illuminate\Http\StorePartnerRequest  $request
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

            foreach ($request->data as $partnerRequest) {
                $partner = Partner::create([
                    'company_id' => $company->id,
                    'code' => $partnerRequest['code'],
                    'site_code' => $partnerRequest['siteCode'],
                    'vat_number' => $partnerRequest['vatNumber'],
                    'invoice_type' => $partnerRequest['invoiceType'],
                    'invoice_copies' => $partnerRequest['invoiceCopies'],
                    'payment_days' => $partnerRequest['paymentDays'],
                    'iban' => $partnerRequest['iban'],
                    'bank_account' => $partnerRequest['bankAccount'],
                    'phone_number' => $partnerRequest['phoneNumber'] ?? null,
                    'email' => $partnerRequest['email'] ?? null,
                ]);

                $partner->partner_locations()->createMany(array_map(function ($locationRequest) {
                    return [
                        'name' => $locationRequest['name'],
                        'location_type' => $locationRequest['locationType'],
                        'country' => $locationRequest['country'],
                        'postal_code' => $locationRequest['postalCode'],
                        'city' => $locationRequest['city'],
                        'address' => $locationRequest['address'],
                    ];
                }, $partnerRequest['locations']));

                foreach ($partnerRequest['priceList'] ?? [] as $priceRequest) {
                    $item = Item::firstWhere('article_number', $priceRequest['articleNumber']);
                    $partner->items()->attach($item, ['net_price' => $priceRequest['netPrice']]);
                }
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
