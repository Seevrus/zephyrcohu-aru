<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStoresRequest;
use App\Http\Requests\UpdateStoreRequest;
use App\Http\Resources\StoreCollection;
use App\Http\Resources\StoreResource;
use App\Models\Log;
use App\Models\Store;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
                    'first_available_serial_number' => $storeRequest['firstAvailableSerialNumber'] ?? null,
                    'last_available_serial_number' => $storeRequest['lastAvailableSerialNumber'] ?? null,
                    'year_code' => $storeRequest['yearCode'] ?? null,
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

            throw new BadRequestException();
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

    public function update_store(UpdateStoreRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $store = Store::findOrFail($id);

            $this->authorize('update', $store);

            if ($request->data['code'] ?? null) {
                $store->code = $request->data['code'];
            }
            if ($request->data['name'] ?? null) {
                $store->name = $request->data['name'];
            }
            if ($request->data['firstAvailableSerialNumber'] ?? null) {
                $store->first_available_serial_number = $request->data['firstAvailableSerialNumber'];
            }
            if ($request->data['lastAvailableSerialNumber'] ?? null) {
                $store->last_available_serial_number = $request->data['lastAvailableSerialNumber'];
            }
            if ($request->data['yearCode'] ?? null) {
                $store->year_code = $request->data['yearCode'];
            }

            $store->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated store ' . $store->id,
                'occured_at' => Carbon::now(),
            ]);

            return new StoreResource($store);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_store(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $store = Store::findOrFail($id);
            $this->authorize('remove', $store);

            $store->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed store ' . $store->id,
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
