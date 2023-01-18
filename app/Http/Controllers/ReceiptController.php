<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Company;
use App\Filters\ReceiptsFilter;
use App\Http\Resources\ReceiptResource;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
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
            $filter = new ReceiptsFilter();
            $query_items = $filter->transform($request);

            $company_id = $request->user()->company_id;

            if (count($query_items['where_in_query'])) {
                $receipts = Company::find($company_id)
                    ->receipts()
                    ->where($query_items['where_query'])
                    ->whereIn($query_items['where_in_query'][0], $query_items['where_in_query'][1])
                    ->whereNull($query_items['where_null_query'])
                    ->with(['transactions', 'transactions.purchases', 'transactions.order'])
                    ->paginate(100);
            } else {
                $receipts = Company::find($company_id)
                    ->receipts()
                    ->where($query_items['where_query'])
                    ->whereNull($query_items['where_null_query'])
                    ->with(['transactions', 'transactions.purchases', 'transactions.order'])
                    ->paginate(100);
            }

            $row_ids = $receipts->pluck('id')->all();
            Receipt::whereIn('id', $row_ids)->update([]);

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
    public function show($id)
    {
        $receipt = Receipt::with(['transactions', 'transactions.purchases', 'transactions.order'])->findOrFail($id);

        $this->authorize('view', $receipt);

        if (!$receipt) {
            throw new NotFoundHttpException();
        }

        return new ReceiptResource($receipt);
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
