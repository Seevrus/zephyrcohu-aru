<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;
use App\Filters\ReceiptsFilter;
use App\Http\Resources\ReceiptResource;
use App\Models\Expiration;
use App\Models\Item;
use App\Models\Log;
use App\Models\Order;
use App\Models\Partner;
use App\Models\Store;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ReceiptController extends Controller
{
    /**
     * Display all receipts.
     *
     * @return \Illuminate\Http\Response
     */
    public function search(Request $request)
    {
        try {
            $this->authorize('viewAny', Receipt::class);

            $user = $request->user();
            $user->last_active = date('Y-m-d H:i:s');
            $user->save();

            $filter = new ReceiptsFilter();
            $query_items = $filter->transform($request);
            $limit = $request->limit ?? 100;

            $company_id = $user->company_id;

            if (count($query_items['where_in_query'])) {
                $receipts = Company::find($company_id)
                    ->receipts()
                    ->where($query_items['where_query'])
                    ->whereIn($query_items['where_in_query'][0], $query_items['where_in_query'][1])
                    ->whereNull($query_items['where_null_query'])
                    ->with(['transactions', 'transactions.purchases'])
                    ->orderBy('id')
                    ->paginate($limit);
            } else {
                $receipts = Company::find($company_id)
                    ->receipts()
                    ->where($query_items['where_query'])
                    ->whereNull($query_items['where_null_query'])
                    ->with(['transactions', 'transactions.purchases'])
                    ->orderBy('id')
                    ->paginate($limit);
            }

            if ($receipts->isNotEmpty()) {
                $receipts->toQuery()->update([
                    'last_downloaded_at' => date('Y-m-d H:i:s'),
                ]);
            }

            Log::insert([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'token_id' => $user->currentAccessToken()->id,
                'action' => 'Accessed ' . $receipts->count() . ' receipts',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new ReceiptCollection($receipts);
        } catch (Exception $e) {
            if ($e instanceof AuthorizationException) throw $e;
            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Upload an array of new receipts.
     *
     * @param  \App\Http\Requests\StoreReceiptRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreReceiptRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            foreach ($request->data as $receiptRequest) {
                $dbReceipt = Receipt::where('serial_number', $receiptRequest['serialNumber'])->where('year_code', $receiptRequest['yearCode'])->first();

                if ($dbReceipt) continue;

                $partner = Partner::where('code', $receiptRequest['partnerCode'])->where('site_code', $receiptRequest['siteCode'])->first();
                $store = Store::firstWhere('code', $receiptRequest['storeCode']);

                $receipt = new Receipt([
                    'partner_id' => $partner->id,
                    'user_id' => $sender->id,
                    'serial_number' => $receiptRequest['serialNumber'],
                    'year_code' => $receiptRequest['yearCode'],
                    'total_amount' => $receiptRequest['totalAmount'],
                    'created_at' => $receiptRequest['createdAt'],
                ]);
                $receipt->save();

                foreach ($receiptRequest['items'] as $receiptItem) {
                    $dbItem = Item::firstWhere('article_number', $receiptItem['articleNumber']);
                    $stock_item = $store->items()->firstWhere('item_id', $dbItem->id)->pivot;

                    foreach ($receiptItem['expirations'] as $receiptItemExpiration) {
                        $dbItemExpiration = Expiration::where('stock_item_id', $stock_item->id)
                            ->where('expires_at', $receiptItemExpiration['expiresAt'])
                            ->first();

                        $receipt->expirations()->attach($dbItemExpiration->id, [
                            'quantity' => $receiptItemExpiration['quantity'],
                            'item_amount' => $receiptItemExpiration['itemAmount'],
                        ]);
                    }
                }

                $order = new Order([
                    'partner_id' => $partner->id,
                    'user_id' => $sender->id,
                    'created_at' => $receiptRequest['createdAt'],
                ]);
                $order->save();

                foreach ($receiptRequest['orderItems'] as $orderItem) {
                    $dbItem = Item::firstWhere('article_number', $orderItem['articleNumber']);
                    $order->items()->attach($dbItem->id, ['quantity' => $orderItem['quantity']]);
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Uploaded ' . count($request->data) . ' new receipts',
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

    /**
     * Display a receipt.
     *
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        // Have to do this here before using the policy because I do not want to return with 404 is the receipt does not exist but the user does not even have access right to the endpoint
        if (!Gate::allows('show-receipt')) {
            throw new AccessDeniedHttpException();
        }

        $user = request()->user();
        $user->last_active = date('Y-m-d H:i:s');
        $user->save();

        $receipt = Receipt::with(['transactions', 'transactions.purchases'])->findOrFail($id);

        $this->authorize('view', $receipt);

        Log::insert([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'token_id' => $user->currentAccessToken()->id,
            'action' => 'Accessed 1 receipt',
            'occured_at' => date('Y-m-d H:i:s'),
        ]);

        return new ReceiptResource($receipt);
    }
}
