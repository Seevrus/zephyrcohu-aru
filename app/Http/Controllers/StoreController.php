<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStoresRequest;
use App\Http\Resources\StoreCollection;
use App\Models\Log;
use App\Models\Store;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StoreController extends Controller
{
    public function create_stores(CreateStoresRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            // additional validations
            $existingMainStore = Store::firstWhere(['type' => 'P']);
            $numberOfPrimaryStoresInRequest = 0;
            foreach ($request->data as $storeRequest) {
                if ($storeRequest['type'] === 'P') {
                    if ($existingMainStore) {
                        return response([
                            'message' => "Primary Store already exists (" . $existingMainStore->id . ").",
                        ], 422);
                    }

                    $numberOfPrimaryStoresInRequest += 1;
                    if ($numberOfPrimaryStoresInRequest > 1) {
                        return response([
                            'message' => "Request can contain only one primary store.",
                        ], 422);
                    }
                }
            }

            $newStores = [];
            foreach ($request->data as $storeRequest) {
                $existingStore = Store::where([
                    'code' => $storeRequest['code'],
                ])->first();

                if ($existingStore) continue;

                $store = Store::create([
                    'company_id' => $company->id,
                    'code' => $storeRequest['code'],
                    'name' => $storeRequest['name'],
                    'type' => $storeRequest['type'],
                    'state' => 'I',
                    'first_available_serial_number' => $storeRequest['firstAvailableSerialNumber'],
                    'last_available_serial_number' => $storeRequest['lastAvailableSerialNumber'],
                    'year_code' => $storeRequest['yearCode'],
                ]);

                array_push($newStores, $store);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created ' . count($newStores) . ' stores',
                'occured_at' => Carbon::now(),
            ]);

            return new StoreCollection($newStores);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw $e; // new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $stores = $sender->company->stores()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $stores->count() . ' items',
                'occured_at' => Carbon::now(),
            ]);

            return new StoreCollection($stores);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
