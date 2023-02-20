<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Http\Resources\StoreCollection;
use App\Http\Resources\StoreDetailsResource;
use App\Models\Item;
use App\Models\Log;
use App\Models\Store;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StoreController extends Controller
{
    /**
     * View the list of stores
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Store::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $stores = $sender->company->stores()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $stores->count() . ' stores',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new StoreCollection($stores);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Detailed view of a store
     */
    public function view(string $code)
    {
        try {
            $store = Store::firstWhere('code', $code);
            $this->authorize('view', $store);

            $sender = request()->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $stores_with_items = $store->load('expirations.item');

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed store ' . $store->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new StoreDetailsResource($stores_with_items);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Delete previous stores and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $company = $sender->company;
            $company->stores()->delete();

            foreach ($request->data as $storeRequest) {
                $store = Store::create([
                    'company_id' => $company->id,
                    'code' => $storeRequest['code'],
                    'name' => $storeRequest['name'],
                    'first_available_serial_number' => $storeRequest['firstAvailableSerialNumber'],
                    'last_available_serial_number' => $storeRequest['lastAvailableSerialNumber'],
                    'year_code' => $storeRequest['yearCode'],
                ]);

                foreach ($storeRequest['items'] as $itemRequest) {
                    $item = Item::firstWhere('article_number', $itemRequest['articleNumber']);

                    foreach ($itemRequest['expirations'] as $itemExpirationRequest) {
                        $formattedExpiration = date('Y-m-t', strtotime($itemExpirationRequest['expiresAt']));

                        $expiration = $item->expirations()->where('expires_at', $formattedExpiration)->first();

                        if (!$expiration) {
                            $expiration = $item->expirations()->create([
                                'expires_at' => $formattedExpiration,
                            ]);
                        }

                        $store->expirations()->attach($expiration, ['quantity' => $itemExpirationRequest['quantity']]);
                    }
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Stored ' . count($request->data) . ' stores',
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
