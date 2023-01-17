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
        $company_id = request()->user()->company_id;
        return new ReceiptCollection(
            Company::find($company_id)
                ->receipts()
                ->with(['transactions', 'transactions.purchases', 'transactions.order'])
                ->paginate(100)
        );
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
        // 
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
