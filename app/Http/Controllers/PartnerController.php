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
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
                'action' => 'Created ' . count($newPartners) . ' partners',
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

            $partner = Partner::findOrFail($id);

            $this->authorize('update', $partner);

            $locationUpdates = $request->data['locations'] ?? null;
            if ($locationUpdates) {
                $currentLocations = $partner->locations();

                // Additional validations for location
                foreach ($locationUpdates as $locationUpdate) {
                    $locationName = $locationUpdate['name'];
                    $currentNames = array_map(
                        fn ($cl) => $cl['name'],
                        $currentLocations->get()->toArray()
                    );

                    // For the sake of simplicity, this fails on the first malformed item
                    $action = $locationUpdate['action'];
                    switch ($action) {
                        case 'update':
                            if (array_search($locationName, $currentNames) === false) {
                                return response([
                                    'message' => "Invalid location to update: " . $locationName
                                ], 422);
                            }
                            break;
                        case 'delete':
                            if (array_search($locationName, $currentNames) === false) {
                                return response([
                                    'message' => "Invalid location to delete: " . $locationName
                                ], 422);
                            }
                            break;
                        case 'create':
                        default:
                            if (
                                array_search($locationName, $currentNames) !== false
                                || !($locationUpdate['locationType'] ?? null)
                                || !($locationUpdate['country'] ?? null)
                                || !($locationUpdate['postalCode'] ?? null)
                                || !($locationUpdate['city'] ?? null)
                                || !($locationUpdate['address'] ?? null)
                            ) {
                                return response([
                                    'message' => "Invalid location to create: " . $locationName
                                ], 422);
                            }
                    }
                }

                // Actual updates
                foreach ($locationUpdates as $locationUpdate) {
                    $locationName = $locationUpdate['name'];

                    $action = $locationUpdate['action'];
                    switch ($action) {
                        case 'update':
                            $currentLocation = $currentLocations->firstWhere(['name' => $locationName]);

                            if ($locationUpdate['locationType'] ?? null) {
                                $currentLocation->location_type = $locationUpdate['locationType'];
                            }
                            if ($locationUpdate['country'] ?? null) {
                                $currentLocation->country = $locationUpdate['country'];
                            }
                            if ($locationUpdate['postalCode'] ?? null) {
                                $currentLocation->postal_code = $locationUpdate['postalCode'];
                            }
                            if ($locationUpdate['city'] ?? null) {
                                $currentLocation->city = $locationUpdate['city'];
                            }
                            if ($locationUpdate['address'] ?? null) {
                                $currentLocation->address = $locationUpdate['address'];
                            }

                            $currentLocation->save();
                            break;
                        case 'delete':
                            $currentLocation = $currentLocations->firstWhere(['name' => $locationName]);
                            $currentLocation->delete();
                            break;
                        case 'create':
                        default:
                            $partner->locations()->create([
                                'name' => $locationName,
                                'location_type' => $locationUpdate['locationType'],
                                'country' => $locationUpdate['country'],
                                'postal_code' => $locationUpdate['postalCode'],
                                'city' => $locationUpdate['city'],
                                'address' => $locationUpdate['address'],
                            ]);
                    }
                }
            }


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
            if (($request->data['phoneNumber'] ?? 0) !== 0) {
                $partner->phone_number = $request->data['phoneNumber'];
            }
            if (($request->data['email'] ?? 0) !== 0) {
                $partner->email = $request->data['email'];
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
                || $e instanceof ModelNotFoundException
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
                || $e instanceof ModelNotFoundException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}