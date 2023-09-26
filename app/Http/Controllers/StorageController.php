<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoadPrimaryStoreRequest;
use App\Http\Requests\LoadStoreRequest;
use App\Http\Requests\LockStoreToUserRequest;
use App\Http\Resources\StoreResource;
use App\Http\Resources\UserResource;
use App\Models\Store;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorageController extends Controller
{
    public function load_primary(LoadPrimaryStoreRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $storeId = $request['data']['storeId'];
            $store = $sender->company->stores()->findOrFail($storeId);

            if ($store->type !== 'P') {
                return response([
                    'message' => 'Store ID is invalid.',
                ], 422);
            }

            // load store - validation
            if (!in_array('I', $sender->roleList())) {
                throw new AuthorizationException();
            }

            for ($i = 0; $i < 5; $i++) {
                $store->refresh();

                if ($store->state === 'I') {
                    break;
                }

                if ($i < 4) {
                    sleep(1);
                }

                return response([
                    'message' => 'Store is currently not idle.',
                ], 507);
            }

            $store = Store::with('expirations')->find($storeId);
            $store->state = 'L';
            $store->save();

            // load store
            foreach ($request['data']['changes'] as $storageUpdate) {
                $expirationId = $storageUpdate['expirationId'];
                $existingExpiration = $store->expirations->find($expirationId);

                if ($existingExpiration) {
                    $currentQuantity = $existingExpiration->pivot->quantity;
                    $newQuantity = $currentQuantity + $storageUpdate['quantityChange'];
                    $store->expirations()->updateExistingPivot($existingExpiration->id, [
                        'quantity' => $newQuantity,
                    ]);
                } else {
                    $store->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                }
            }

            $store->state = 'I';
            $store->save();

            return new StoreResource($store->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function lock_to_user(LockStoreToUserRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $storeId = $request['data']['storeId'];
            $store = $sender->company->stores()->findOrFail($storeId);

            if ($sender->store) {
                return response([
                    'message' => 'User already has a store locked.',
                    'storeId' => $sender->store->id,
                ], 507);
            }

            if ($store->type === 'P' && !in_array('I', $sender->roleList())) {
                return response([
                    'message' => 'Cannot lock primary store.',
                ], 422);
            }

            if ($store->user) {
                return response([
                    'message' => 'Store is already locked.',
                    'userId' => $store->user->id,
                ], 507);
            }

            $sender->state = 'L';
            $sender->save();
            $sender->store()->save($store);

            return new UserResource($sender->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function load(LoadStoreRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $primaryStoreId = $request['data']['primaryStoreId'];
            $primaryStore = $sender->company->stores()->findOrFail($primaryStoreId);

            if ($primaryStore->type !== 'P') {
                return response([
                    'message' => 'Primary store ID does not belong to a primary store.',
                ], 422);
            }

            // loading store - validation
            $store = $sender->store;

            if (!$store) {
                return response([
                    'message' => 'User has no store associated.',
                ], 404);
            }

            if ($store->type !== 'S') {
                return response([
                    'message' => 'Store ID is invalid.',
                ], 422);
            }

            for ($i = 0; $i < 5; $i++) {
                $primaryStore = $primaryStore->refresh();

                if ($primaryStore->state === 'I') {
                    break;
                }

                if ($i < 4) {
                    sleep(1);
                }

                return response([
                    'message' => 'Primary store is currently not idle.',
                ], 507);
            }

            // loading store
            $primaryStore->state = 'L';
            $primaryStore->save();
            $store->state = 'L';
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
                } elseif ($primaryExistingExpiration && !$existingExpiration) {
                    $primaryCurrentQuantity = $primaryExistingExpiration->pivot->quantity;
                    $primaryNewQuantity = $primaryCurrentQuantity - $storageUpdate['quantityChange'];

                    $primaryStore->expirations()->updateExistingPivot($primaryExistingExpiration->id, [
                        'quantity' => $primaryNewQuantity,
                    ]);

                    $store->expirations()->attach($expirationId, ['quantity' => $storageUpdate['quantityChange']]);
                } elseif (!$primaryExistingExpiration && $existingExpiration) {
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

            $primaryStore->state = 'I';
            $primaryStore->save();
            $store->state = 'I';
            $store->save();

            return new StoreResource($store->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function unlock_from_user(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $store = $sender->store;
            $store->user_id = null;
            $store->save();

            $sender->state = 'I';
            $sender->save();

            return new UserResource($sender->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }
}
