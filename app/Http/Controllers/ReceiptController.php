<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use App\Http\Requests\StoreReceiptRequest;
use App\Http\Resources\ReceiptCollection;
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
                $receipts = $sender->company->receipts()->whereNull('last_downloaded_at')->with('partner', 'expirations.stock_item.item')->get();
            } else {
                $receipts = $sender->company->receipts()->with('partner', 'expirations.stock_item.item')->get();
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
}
