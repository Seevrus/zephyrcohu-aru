<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;
use App\Filters\ReceiptsFilter;
use App\Http\Resources\ReceiptResource;
use App\Models\Log;
use App\Models\Purchase;
use App\Models\Transaction;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
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
     * Upload a new receipt.
     *
     * @param  \App\Http\Requests\StoreReceiptRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreReceiptRequest $request)
    {
        $this->authorize('store', Receipt::class);

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

        Log::insert([
            'company_id' => $user->company_id,
            'user_id' => $user->id,
            'token_id' => $user->currentAccessToken()->id,
            'action' => 'Uploaded a new receipt',
            'occured_at' => date('Y-m-d H:i:s'),
        ]);

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
