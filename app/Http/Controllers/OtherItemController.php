<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateOtherItemsRequest;
use App\Http\Requests\UpdateOtherItemRequest;
use App\Http\Resources\OtherItemCollection;
use App\Http\Resources\OtherItemResource;
use App\Models\Log;
use App\Models\OtherItem;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class OtherItemController extends Controller
{
    public function create_other_items(CreateOtherItemsRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $newItems = [];
            foreach ($request->data as $itemRequest) {
                $existingItem = OtherItem::where([
                    'article_number' => $itemRequest['articleNumber'],
                ])->first();

                if ($existingItem) {
                    continue;
                }

                $item = OtherItem::create([
                    'company_id' => $company->id,
                    'article_number' => $itemRequest['articleNumber'],
                    'name' => $itemRequest['name'],
                    'short_name' => $itemRequest['shortName'],
                    'unit_name' => $itemRequest['unitName'],
                    'vat_rate' => $itemRequest['vatRate'],
                    'net_price' => $itemRequest['netPrice'],
                ]);

                array_push($newItems, $item);
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created '.count($newItems).' other items',
                'occured_at' => Carbon::now(),
            ]);

            return new OtherItemCollection($newItems);
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

            $items = $sender->company->otherItems()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed '.$items->count().' other items',
                'occured_at' => Carbon::now(),
            ]);

            return new OtherItemCollection($items);
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

    public function update_other_item(UpdateOtherItemRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $item = $sender->company->otherItems()->findOrFail($id);
            $this->authorize('update', $item);

            if ($request->data['name'] ?? null) {
                $item->name = $request->data['name'];
            }
            if ($request->data['shortName'] ?? null) {
                $item->short_name = $request->data['shortName'];
            }
            if ($request->data['unitName'] ?? null) {
                $item->unit_name = $request->data['unitName'];
            }
            if ($request->data['vatRate'] ?? null) {
                $item->vat_rate = $request->data['vatRate'];
            }
            if ($request->data['netPrice'] ?? null) {
                $item->net_price = $request->data['netPrice'];
            }

            $item->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated other item '.$item->id,
                'occured_at' => Carbon::now(),
            ]);

            return new OtherItemResource($item->refresh());
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

    public function remove_other_item(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $item = $sender->company->otherItems()->findOrFail($id);
            $this->authorize('remove', $item);

            $item->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed item '.$item->id,
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
