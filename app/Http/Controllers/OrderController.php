<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateOrderRequest;
use App\Http\Resources\OrderCollection;
use App\Models\Log;
use App\Models\Order;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OrderController extends Controller
{
    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $orders = $sender->company->orders()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $orders->count() . ' orders',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new OrderCollection($orders);
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

    public function create_orders(CreateOrderRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $newOrders = [];
            foreach ($request->data as $orderRequest) {
                $order = Order::create([
                    'company_id' => $company->id,
                    'partner_id' => $orderRequest['partnerId'],
                    'ordered_at' => $orderRequest['orderedAt'],
                ]);

                foreach ($orderRequest['items'] as $orderItem) {
                    $order->orderItems()->create([
                        'article_number' => $orderItem['articleNumber'],
                        'name' => $orderItem['name'],
                        'quantity' => $orderItem['quantity'],
                    ]);
                }

                array_push($newOrders, $order);
            }

            Log::insert([
                'company_id' => $company->id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Uploaded ' . count($request->data) . ' new orders',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new OrderCollection($newOrders);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_order(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $order = $sender->company->orders()->findOrFail($id);
            $this->authorize('remove', $order);

            $order->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed item ' . $order->id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
