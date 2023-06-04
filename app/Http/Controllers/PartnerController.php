<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePartnersRequest;
use App\Http\Requests\UpdatePartnerRequest;
use App\Http\Resources\PartnerCollection;
use App\Http\Resources\PartnerResource;
use App\Models\Log;
use App\Models\Partner;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PartnerController extends Controller
{
    public function create_partners(CreatePartnersRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $company = $sender->company;

            $newPartners = [];
            foreach ($request->data as $partnerRequest) {
                $existingPartner = Partner::where([
                    'code' => $partnerRequest['code'],
                    'site_code' => $partnerRequest['siteCode'],
                ])->first();

                if ($existingPartner) continue;

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

                $partner->locations()->createMany(
                    array_map(
                        fn ($locationRequest) => [
                            'name' => $locationRequest['name'],
                            'location_type' => $locationRequest['locationType'],
                            'country' => $locationRequest['country'],
                            'postal_code' => $locationRequest['postalCode'],
                            'city' => $locationRequest['city'],
                            'address' => $locationRequest['address'],
                        ],
                        $partnerRequest['locations']
                    )
                );

                array_push($newPartners, $partner);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created ' . count($request->data) . ' partners',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerCollection($newPartners);
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
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partners = $sender->company->partners()->with('locations')->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $partners->count() . ' partners',
                'occured_at' => Carbon::now(),
            ]);

            return new PartnerCollection($partners);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function update_partner(UpdatePartnerRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partner = Partner::find($id);

            if (!$partner) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner.',
                ], 404);
            }

            $this->authorize('update', $partner);

            if ($request->data['vatNumber'] ?? null) {
                $partner->vat_number = $request->data['vatNumber'];
            }
            if ($request->data['invoiceType'] ?? null) {
                $partner->invoice_type = $request->data['invoiceType'];
            }
            if ($request->data['invoiceCopies'] ?? null) {
                $partner->invoice_copies = $request->data['invoiceCopies'];
            }
            if ($request->data['paymentDays'] ?? null) {
                $partner->payment_days = $request->data['paymentDays'];
            }
            if ($request->data['iban'] ?? null) {
                $partner->iban = $request->data['iban'];
            }
            if ($request->data['bankAccount'] ?? null) {
                $partner->bank_account = $request->data['bankAccount'];
            }
            if (!!$request->data['phoneNumber'] ?? null || $request->data['phoneNumber'] === null) {
                $partner->phone_number = $request->data['phoneNumber'];
            }
            if (!!$request->data['email'] ?? null || $request->data['email'] === null) {
                $partner->email = $request->data['email'];
            }

            $newLocations = $request->data['locations'] ?? null;
            if ($newLocations) {
                $partner->locations()->delete();

                $partner->locations()->createMany(
                    array_map(
                        fn ($locationRequest) => [
                            'name' => $locationRequest['name'],
                            'location_type' => $locationRequest['locationType'],
                            'country' => $locationRequest['country'],
                            'postal_code' => $locationRequest['postalCode'],
                            'city' => $locationRequest['city'],
                            'address' => $locationRequest['address'],
                        ],
                        $request->data['locations']
                    )
                );
            }

            $partner->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated partner ' . $partner->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerResource($partner);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_partner(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $partner = Partner::findOrFail($id);
            $this->authorize('remove', $partner);

            $partner->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed partner ' . $partner->id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
