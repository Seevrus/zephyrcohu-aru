<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;
use App\Filters\ReceiptsFilter;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    /**
     * Display all receipts.
     *
     * @return \Illuminate\Http\Response
     */
    public function all(Request $request)
    {
        $filter = new ReceiptsFilter();
        $query_items = $filter->transform($request);

        $company_id = $request->user()->company_id;

        if (count($query_items['where_in_query'])) {
            $receipts = Company::find($company_id)
                ->receipts()
                ->where($query_items['where_query'])
                ->whereIn($query_items['where_in_query'][0], $query_items['where_in_query'][1])
                ->with(['transactions', 'transactions.purchases', 'transactions.order'])
                ->paginate(100);
        } else {
            $receipts = Company::find($company_id)
                ->receipts()
                ->where($query_items['where_query'])
                ->with(['transactions', 'transactions.purchases', 'transactions.order'])
                ->paginate(100);
        }

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
