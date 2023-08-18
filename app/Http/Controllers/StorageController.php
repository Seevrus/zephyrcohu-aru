<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStorageRequest;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorageController extends Controller
{
    public function update_storage(UpdateStorageRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $primaryStoreId = $request['data']['primaryStoreId'];
            $storeId = $request['data']['storeId'] ?? null;

            $primaryStore = Store::find($primaryStoreId);

            if ($primaryStore->type !== "P") {
                return response([
                    'message' => "Primary store ID is invalid."
                ], 422);
            }

            // updating primary store -validation
            if (!$storeId) {
                if (!in_array("I", $sender->roleList())) {
                    throw new AuthorizationException();
                }

                for ($i = 0; $i < 5; $i++) {
                    $primaryStore = Store::find($primaryStoreId);

                    if ($primaryStore->state === "I") break;

                    if ($i < 4) sleep(1);

                    return response([
                        'message' => "Primary Store is currently not idle."
                    ], 507);
                }
            } else { // updating normal store - validation
                $store = Store::find($storeId);

                if ($store->type !== "S") {
                    return response([
                        'message' => "Store ID is invalid."
                    ], 422);
                }

                for ($i = 0; $i < 5; $i++) {
                    $primaryStore = Store::find($primaryStoreId);
                    $store = Store::find($storeId);

                    if ($primaryStore->state === "I" && $store->state === "I") break;

                    if ($i < 4) sleep(1);

                    return response([
                        'message' => "Store is currently not idle."
                    ], 507);
                }
            }

            $primaryStore = Store::with('expirations')->find($primaryStoreId);
            $primaryStore->state = "L";
            $primaryStore->save();

            // updating primary store
            if (!$storeId) {
                foreach ($request['data']['changes'] as $storageUpdate) {
                    $expirationId = $storageUpdate['expirationId'];
                    $existingExpiration = $primaryStore->expirations->find($expirationId);

                    if ($existingExpiration) {
                        $currentQuantity = $existingExpiration->pivot->quantity;
                        $newQuantity = $currentQuantity + $storageUpdate['quantityChange'];
                        $primaryStore->expirations()->updateExistingPivot($existingExpiration->id, [
                            'quantity' => $newQuantity,
                        ]);
                    } else {
                        $primaryStore->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                    }
                }

                $primaryStore->state = "I";
                $primaryStore->save();

                return new StoreResource($primaryStore->refresh());
            }

            // updating normal store
            $store = Store::with('expirations')->find($storeId);
            $store->state = "L";
            $store->save();

            foreach ($request['data']['changes'] as $storageUpdate) {
                $expirationId = $storageUpdate['expirationId'];

                $primaryExistingExpiration = $primaryStore->expirations->find($expirationId);
                $existingExpiration = $store->expirations->find($expirationId);

                if ($primaryExistingExpiration && $existingExpiration) {
                    $primaryCurrentQuantity = $primaryExistingExpiration->pivot->quantity;
                    $currentQuantity = $existingExpiration->pivot->quantity;

                    $primaryNewQuantity = $primaryCurrentQuantity - $storageUpdate['quantityChange'];
                    $newQuantity = $currentQuantity + $storageUpdate['quantityChange'];

                    $primaryStore->expirations()->updateExistingPivot($primaryExistingExpiration->id, [
                        'quantity' => $primaryNewQuantity,
                    ]);

                    $store->expirations()->updateExistingPivot($existingExpiration->id, [
                        'quantity' => $newQuantity,
                    ]);
                } else if ($primaryExistingExpiration && !$existingExpiration) {
                    $primaryCurrentQuantity = $primaryExistingExpiration->pivot->quantity;
                    $primaryNewQuantity = $primaryCurrentQuantity - $storageUpdate['quantityChange'];

                    $primaryStore->expirations()->updateExistingPivot($primaryExistingExpiration->id, [
                        'quantity' => $primaryNewQuantity,
                    ]);

                    $store->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                } else if (!$primaryExistingExpiration && $existingExpiration) {
                    $currentQuantity = $existingExpiration->pivot->quantity;
                    $newQuantity = $currentQuantity + $storageUpdate['quantityChange'];

                    $primaryStore->expirations()->attach($expirationId, ['quantity' => -$storageUpdate['quantityChange']]);

                    $store->expirations()->updateExistingPivot($existingExpiration->id, [
                        'quantity' => $newQuantity,
                    ]);
                } else {
                    $primaryStore->expirations()->attach($expirationId, ['quantity' => -$storageUpdate['quantityChange']]);

                    $store->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                }
            }

            $primaryStore->state = "I";
            $primaryStore->save();
            $store->state = "I";
            $store->save();

            return new StoreResource($store->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
