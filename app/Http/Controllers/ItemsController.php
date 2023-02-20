<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreItemRequest;
use App\Http\Resources\ItemCollection;
use App\Models\Item;
use App\Models\Log;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ItemsController extends Controller
{
    /**
     * View the list of items
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Item::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $items = $sender->company->items()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $items->count() . ' items',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new ItemCollection($items);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Delete previous items and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreItemRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $company = $sender->company;
            $company->items()->delete();

            foreach ($request->data as $item) {
                Item::create([
                    'company_id' => $company->id,
                    'cn_code' => $item['CNCode'],
                    'article_number' => $item['articleNumber'],
                    'name' => $item['name'],
                    'short_name' => $item['shortName'],
                    'category' => $item['category'],
                    'unit_name' => $item['unitName'],
                    'product_catalog_code' => $item['productCatalogCode'],
                    'vat_rate' => $item['vatRate'],
                    'net_price' => $item['netPrice'],
                ]);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Stored ' . count($request->data) . ' items',
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
