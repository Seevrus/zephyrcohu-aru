<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Models\Log;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ReceiptController extends Controller
{
    /**
     * Display all receipts.
     *
     * @return \Illuminate\Http\Response
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Receipt::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            if ($request->downloaded === '0') {
                $receipts = $sender->company->receipts()->whereNull('last_downloaded_at')->with('receipt_items', 'vat_amounts')->get();
            } else {
                $receipts = $sender->company->receipts()->with('receipt_items', 'vat_amounts')->get();
            }

            if (!$receipts->isEmpty()) {
                $receipts->toQuery()->update([
                    'last_downloaded_at' => date('Y-m-d H:i:s'),
                ]);

                Log::insert([
                    'company_id' => $sender->company_id,
                    'user_id' => $sender->id,
                    'token_id' => $sender->currentAccessToken()->id,
                    'action' => 'Accessed ' . $receipts->count() . ' receipts',
                    'occured_at' => date('Y-m-d H:i:s'),
                ]);
            }

            return new ReceiptCollection($receipts);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

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
                $receipt = Receipt::updateOrCreate(
                    [
                        'serial_number' => $receiptRequest['serialNumber'],
                        'year_code' => $receiptRequest['yearCode'],
                    ],
                    [
                        'company_id' => $sender->company->id,
                        'company_code' => $receiptRequest['companyCode'],
                        'partner_code' => $receiptRequest['partnerCode'],
                        'partner_site_code' => $receiptRequest['partnerSiteCode'],
                        'ci_serial_number' => $receiptRequest['CISerialNumber'] ?? null,
                        'ci_year_code' => $receiptRequest['CIYearCode'] ?? null,
                        'serial_number' => $receiptRequest['serialNumber'],
                        'year_code' => $receiptRequest['yearCode'],
                        'original_copies_printed' => $receiptRequest['originalCopiesPrinted'],
                        'vendor_name' => $receiptRequest['vendor']['name'],
                        'vendor_country' => $receiptRequest['vendor']['country'],
                        'vendor_postal_code' => $receiptRequest['vendor']['postalCode'],
                        'vendor_city' => $receiptRequest['vendor']['city'],
                        'vendor_address' => $receiptRequest['vendor']['address'],
                        'vendor_felir' => $receiptRequest['vendor']['felir'],
                        'vendor_iban' => $receiptRequest['vendor']['iban'],
                        'vendor_bank_account' => $receiptRequest['vendor']['bankAccount'],
                        'vendor_vat_number' => $receiptRequest['vendor']['vatNumber'],
                        'buyer_name' => $receiptRequest['buyer']['name'],
                        'buyer_country' => $receiptRequest['buyer']['country'],
                        'buyer_postal_code' => $receiptRequest['buyer']['postalCode'],
                        'buyer_city' => $receiptRequest['buyer']['city'],
                        'buyer_address' => $receiptRequest['buyer']['address'],
                        'buyer_iban' => $receiptRequest['buyer']['iban'],
                        'buyer_bank_account' => $receiptRequest['buyer']['bankAccount'],
                        'buyer_vat_number' => $receiptRequest['buyer']['vatNumber'],
                        'buyer_delivery_name' => $receiptRequest['buyer']['deliveryName'] ?? null,
                        'buyer_delivery_country' => $receiptRequest['buyer']['deliveryCountry'] ?? null,
                        'buyer_delivery_postal_code' => $receiptRequest['buyer']['deliveryPostalCode'] ?? null,
                        'buyer_delivery_city' => $receiptRequest['buyer']['deliveryCity'] ?? null,
                        'buyer_delivery_address' => $receiptRequest['buyer']['deliveryAddress'] ?? null,
                        'invoice_date' => $receiptRequest['invoiceDate'],
                        'fulfillment_date' => $receiptRequest['fulfillmentDate'],
                        'invoice_type' => $receiptRequest['invoiceType'],
                        'paid_date' => $receiptRequest['paidDate'],
                        'agent_code' => $receiptRequest['agent']['code'],
                        'agent_name' => $receiptRequest['agent']['name'],
                        'agent_phone_number' => $receiptRequest['agent']['phoneNumber'],
                        'quantity' => $receiptRequest['quantity'],
                        'net_amount' => $receiptRequest['netAmount'],
                        'vat_amount' => $receiptRequest['vatAmount'] ?? null,
                        'gross_amount' => $receiptRequest['grossAmount'],
                        'round_amount' => $receiptRequest['roundAmount'],
                        'rounded_amount' => $receiptRequest['roundedAmount'],
                    ]
                );

                foreach ($receiptRequest['items'] as $receiptItem) {
                    $receipt->receipt_items()->updateOrCreate(
                        [
                            'code' => $receiptItem['code'],
                        ],
                        [
                            'code' => $receiptItem['code'],
                            'cn_code' => $receiptItem['CNCode'],
                            'article_number' => $receiptItem['articleNumber'],
                            'expires_at' => date('Y-m-t', strtotime($receiptItem['expiresAt'])),
                            'name' => $receiptItem['name'],
                            'quantity' => $receiptItem['quantity'],
                            'unit_name' => $receiptItem['unitName'],
                            'net_price' => $receiptItem['netPrice'],
                            'net_amount' => $receiptItem['netAmount'],
                            'vat_rate' => $receiptItem['vatRate'],
                            'vat_amount' => $receiptItem['vatAmount'] ?? null,
                            'gross_amount' => $receiptItem['grossAmount'],
                        ]
                    );
                }

                foreach ($receiptRequest['vatAmounts'] as $vatAmount) {
                    $receipt->vat_amounts()->updateOrCreate(
                        [
                            'vat_rate' => $vatAmount['vatRate'],
                        ],
                        [
                            'vat_rate' => $vatAmount['vatRate'],
                            'net_amount' => $vatAmount['netAmount'],
                            'vat_amount' => $vatAmount['vatAmount'],
                            'gross_amount' => $vatAmount['grossAmount'],
                        ]
                    );
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
     * Delete an array of receipts
     * 
     */
    public function delete(Request $request)
    {
        if (!Gate::allows('check-device-id')) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

        $sender = $request->user();
        $sender->last_active = date('Y-m-d H:i:s');
        $sender->save();

        $receipt_ids = json_decode($request->ids);

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
