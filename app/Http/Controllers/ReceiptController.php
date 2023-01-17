<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;

class ReceiptController extends Controller
{
    /**
     * Display all receipts.
     *
     * @return \Illuminate\Http\Response
     */
    public function all()
    {
        // driverId, driverPhoneNumber, roundId, clientId, productId, createdAt, lastDownloadedAt
        $company_id = request()->user()->company_id;
        $receipts = Company::find($company_id)
            ->receipts()
            ->with(['transactions', 'transactions.purchases', 'transactions.order'])
            ->paginate(100);

        $row_ids = $receipts->pluck('id')->all();
        Receipt::whereIn('id', $row_ids)->update([]);

        return new ReceiptCollection($receipts);
    }

    /**
     * Upload a new receipt.
     *
     * @param  \App\Http\Requests\StoreReceiptRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function create(StoreReceiptRequest $request)
    {
        //
    }

    /**
     * Display a receipt.
     *
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Http\Response
     */
    public function show(Receipt $receipt)
    {
        // authorization
        // id, receiptNr
    }

    /**
     * Delete a receipt.
     *
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Http\Response
     */
    public function delete(Receipt $receipt)
    {
        //
    }
}
