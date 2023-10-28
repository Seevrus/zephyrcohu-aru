<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateReceiptsRequest;
use App\Http\Requests\UpdateReceiptRequest;
use App\Http\Resources\ReceiptCollection;
use App\Http\Resources\ReceiptResource;
use App\Models\Log;
use App\Models\Receipt;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ReceiptController extends Controller
{
    public function create_receipts(CreateReceiptsRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $newReceipts = [];
            foreach ($request->data as $receiptRequest) {
                $existingReceipt = Receipt::firstWhere([
                    'serial_number' => $receiptRequest['serialNumber'],
                    'year_code' => $receiptRequest['yearCode'],
                ]);

                if ($existingReceipt) {
                    continue;
                }

                $receipt = Receipt::create([
                    'company_id' => $company->id,
                    'company_code' => $company->code,
                    'partner_id' => $receiptRequest['partnerCode'],
                    'partner_code' => $receiptRequest['partnerCode'],
                    'partner_site_code' => $receiptRequest['partnerSiteCode'],
                    'serial_number' => $receiptRequest['serialNumber'],
                    'year_code' => $receiptRequest['yearCode'],
                    'original_copies_printed' => $receiptRequest['originalCopiesPrinted'],
                    'vendor_name' => $receiptRequest['vendor']['name'],
                    'vendor_country' => $receiptRequest['vendor']['country'],
                    'vendor_postal_code' => $receiptRequest['vendor']['postalCode'],
                    'vendor_city' => $receiptRequest['vendor']['city'],
                    'vendor_address' => $receiptRequest['vendor']['address'],
                    'vendor_felir' => $receiptRequest['vendor']['felir'],
                    'vendor_iban' => $receiptRequest['vendor']['iban'] ?? null,
                    'vendor_bank_account' => $receiptRequest['vendor']['bankAccount'] ?? null,
                    'vendor_vat_number' => $receiptRequest['vendor']['vatNumber'],
                    'buyer_name' => $receiptRequest['buyer']['name'],
                    'buyer_country' => $receiptRequest['buyer']['country'],
                    'buyer_postal_code' => $receiptRequest['buyer']['postalCode'],
                    'buyer_city' => $receiptRequest['buyer']['city'],
                    'buyer_address' => $receiptRequest['buyer']['address'],
                    'buyer_iban' => $receiptRequest['buyer']['iban'] ?? null,
                    'buyer_bank_account' => $receiptRequest['buyer']['bankAccount'] ?? null,
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
                    'user_id' => $sender->id,
                    'user_code' => $sender->code,
                    'user_name' => $sender->name,
                    'user_phone_number' => $sender->phone_number ?? null,
                    'quantity' => $receiptRequest['quantity'],
                    'net_amount' => $receiptRequest['netAmount'],
                    'vat_amount' => $receiptRequest['vatAmount'] ?? null,
                    'gross_amount' => $receiptRequest['grossAmount'],
                    'round_amount' => $receiptRequest['roundAmount'],
                    'rounded_amount' => $receiptRequest['roundedAmount'],
                ]);

                foreach ($receiptRequest['items'] as $receiptItem) {
                    $receipt->items()->create([
                        'item_id' => $receiptItem['id'],
                        'cn_code' => $receiptItem['CNCode'],
                        'article_number' => $receiptItem['articleNumber'],
                        'expires_at' => Carbon::createFromFormat('Y-m', $receiptItem['expiresAt'])->endOfMonth()->endOfDay(),
                        'name' => $receiptItem['name'],
                        'quantity' => $receiptItem['quantity'],
                        'unit_name' => $receiptItem['unitName'],
                        'discount_name' => $receiptItem['discountName'] ?? null,
                        'net_price' => $receiptItem['netPrice'],
                        'net_amount' => $receiptItem['netAmount'],
                        'vat_rate' => $receiptItem['vatRate'],
                        'vat_amount' => $receiptItem['vatAmount'] ?? null,
                        'gross_amount' => $receiptItem['grossAmount'],
                    ]);
                }

                if (@$receiptRequest['otherItems']) {
                    foreach ($receiptRequest['otherItems'] as $receiptOtherItem) {
                        $receipt->otherItems()->create([
                            'item_id' => $receiptOtherItem['id'],
                            'article_number' => $receiptOtherItem['articleNumber'],
                            'name' => $receiptOtherItem['name'],
                            'quantity' => $receiptOtherItem['quantity'],
                            'unit_name' => $receiptOtherItem['unitName'],
                            'net_price' => $receiptOtherItem['netPrice'],
                            'net_amount' => $receiptOtherItem['netAmount'],
                            'vat_rate' => $receiptOtherItem['vatRate'],
                            'vat_amount' => $receiptOtherItem['vatAmount'] ?? null,
                            'gross_amount' => $receiptOtherItem['grossAmount'],
                            'comment' => $receiptOtherItem['comment'] ?? null,
                        ]);
                    }
                }

                foreach ($receiptRequest['vatAmounts'] as $vatAmount) {
                    $receipt->vatAmounts()->create(
                        [
                            'vat_rate' => $vatAmount['vatRate'],
                            'net_amount' => $vatAmount['netAmount'],
                            'vat_amount' => $vatAmount['vatAmount'],
                            'gross_amount' => $vatAmount['grossAmount'],
                        ]
                    );
                }

                array_push($newReceipts, $receipt);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created '.count($newReceipts).' receipts',
                'occured_at' => Carbon::now(),
            ]);

            return new ReceiptCollection($newReceipts);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            if ($request->downloaded === '1') {
                $receipts = $sender->company->receipts()->whereNull('last_downloaded_at')->with('items', 'otherItems', 'vatAmounts')->get();
            } else {
                $receipts = $sender->company->receipts()->with('items', 'otherItems', 'vatAmounts')->get();
            }

            if (! $receipts->isEmpty()) {
                $receipts->toQuery()->update([
                    'last_downloaded_at' => Carbon::now(),
                ]);

                Log::insert([
                    'company_id' => $sender->company_id,
                    'user_id' => $sender->id,
                    'token_id' => $sender->currentAccessToken()->id,
                    'action' => 'Accessed '.$receipts->count().' receipts',
                    'occured_at' => Carbon::now(),
                ]);
            }

            return new ReceiptCollection($receipts);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function update_receipt_partial(UpdateReceiptRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $receipt = $sender->company->receipts()->findOrFail($id);
            $this->authorize('update', $receipt);

            if ($receipt->invoice_type === 'E') {
                return response([
                    'message' => 'Receipt is Invoice Type E',
                ], 422);
            }

            if (@$request->data['originalCopiesPrinted']) {
                $receipt->original_copies_printed = $request->data['originalCopiesPrinted'];
            }

            $receipt->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated receipt '.$receipt->id,
                'occured_at' => Carbon::now(),
            ]);

            return new ReceiptResource($receipt->refresh());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function remove_receipt(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $receipt = $sender->company->receipts()->findOrFail($id);
            $this->authorize('remove', $receipt);

            $receipt->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed receipt '.$receipt->id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }
}
