<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderCollection;
use App\Models\Log;
use App\Models\Order;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OrderController extends Controller
{
    /**
     * Display all orders.
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

            $orders = $sender->company->orders()->with('order_items')->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $orders->count() . ' receipts',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new OrderCollection($orders);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Upload an array of new orders.
     *
     * @param  \App\Http\Requests\StoreOrderRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreOrderRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            foreach ($request->data as $orderRequest) {
                $order = Order::create([
                    'company_id' => $sender->company->id,
                    'order_date' => $orderRequest['orderDate'],
                ]);

                foreach ($orderRequest['items'] as $orderItem) {
                    $order->order_items()->create([
                        'article_number' => $orderItem['articleNumber'],
                        'quantity' => $orderItem['quantity'],
                    ]);
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Uploaded ' . count($request->data) . ' new orders',
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

        $order_ids = json_decode($request->ids);

        if (!is_array($order_ids) || !count($order_ids)) {
            throw new UnprocessableEntityHttpException();
        }

        foreach ($order_ids as $id) {
            $receipt = Order::findOrFail($id);
            $this->authorize('delete', $receipt);
        }

        Order::destroy($order_ids);
    }
}
