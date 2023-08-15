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

            $storeId = $request['data']['storeId'];
            $store = Store::with('expirations')->find($storeId);

            if ($store->type === "P" && !in_array("I", $sender->roleList())) {
                throw new AuthorizationException();
            }

            if ($store->state !== "I") {
                return response([
                    'message' => "Store is currently not idle."
                ], 422);
            }

            $store->state = "L";
            $store->save();

            foreach ($request['data']['changes'] as $storageUpdate) {
                $expirationId = $storageUpdate['expirationId'];
                $existingExpiration = $store->expirations->find($expirationId)->pivot;

                if ($existingExpiration) {
                    $currentQuantity = $existingExpiration->quantity;
                    $newQuantity = $currentQuantity + $storageUpdate['quantityChange'];
                    $existingExpiration->quantity = $newQuantity;
                    $existingExpiration->save();
                } else {
                    $store->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                }
            }

            $store->state = "I";
            $store->save();

            return new StoreResource($store);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
