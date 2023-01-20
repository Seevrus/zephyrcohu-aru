<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;
use App\Filters\ReceiptsFilter;
use App\Http\Resources\ReceiptResource;
use App\Models\Purchase;
use App\Models\Transaction;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ReceiptController extends Controller
{
    /**
     * Display all receipts.
     *
     * @return \Illuminate\Http\Response
     */
    public function all(Request $request)
    {
        try {
            $user = $request->user();
            $user->last_active = date('Y-m-d H:i:s');
            $user->save();

            $filter = new ReceiptsFilter();
            $query_items = $filter->transform($request);
            $limit = $request->limit['eq'] ?? 100;

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

            $receipts->toQuery()->update([
                'last_downloaded_at' => date('Y-m-d H:i:s'),
            ]);

            return new ReceiptCollection($receipts->appends($request->query()));
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Upload a new receipt.
     *
     * @param  \App\Http\Requests\StoreReceiptRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreReceiptRequest $request)
    {
        $user = $request->user();
        $user->last_active = date('Y-m-d H:i:s');
        $user->save();

        $receiptId = Receipt::insertGetId([
            'user_id' => $user->id,
            'round_id' => $request->roundId,
            'client_id' => $request->clientId,
            'receipt_nr' => $request->receiptNr,
            'total_amount' => $request->totalAmount,
            'created_at' => $request->createdAt,
        ]);

        foreach ($request->transactions as $transaction) {
            $transactionId = Transaction::insertGetId([
                'receipt_id' => $receiptId,
                'product_id' => $transaction['productId'],
            ]);

            foreach ($transaction['purchases'] as $purchase) {
                Purchase::insert([
                    'transaction_id' => $transactionId,
                    'expires_at' => $purchase['expiresAt'],
                    'quantity' => $purchase['quantity'],
                    'item_amount' => $purchase['itemAmount'],
                ]);
            }
        }

        return new ReceiptResource(Receipt::find($receiptId));
    }

    /**
     * Display a receipt.
     *
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $user = request()->user();
        $user->last_active = date('Y-m-d H:i:s');
        $user->save();

        $receipt = Receipt::with(['transactions', 'transactions.purchases', 'transactions.order'])->findOrFail($id);

        $this->authorize('view', $receipt);

        return new ReceiptResource($receipt);
    }

    /**
     * Delete multiple receipts.
     *
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        $user = $request->user();
        $user->last_active = date('Y-m-d H:i:s');
        $user->save();

        $receipt_ids = json_decode($request->ids['eq'] ?? '');

        if (!is_array($receipt_ids) || !count($receipt_ids)) {
            throw new UnprocessableEntityHttpException();
        }

        foreach ($receipt_ids as $id) {
            $receipt = Receipt::findOrFail($id);
            $this->authorize('delete', $receipt);
        }

        Receipt::destroy($receipt_ids);
    }
}
