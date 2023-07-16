<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePriceListRequest;
use App\Http\Requests\DeletePriceListRequest;
use App\Http\Requests\UpdatePriceListRequest;
use App\Http\Resources\PriceListCollection;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PriceListController extends Controller
{
    private function validateIds(Request $request)
    {
        $sender = $request->user();
        $company = $sender->company;

        // additional validation
        $uniquePartnerIds = array_unique(array_map(
            fn ($req) => $req['partnerId'],
            $request->data,
        ));
        foreach ($uniquePartnerIds as $partnerId) {
            $partner = $company->partners()->find($partnerId);
            if (!$partner) {
                return response([
                    'message' => "Invalid partner id: " . $partnerId
                ], 422);
            }
        }

        $uniqueItemIds = array_unique(array_map(
            fn ($req) => $req['itemId'],
            $request->data,
        ));
        foreach ($uniqueItemIds as $itemId) {
            $item = $company->items()->find($itemId);
            if (!$item) {
                return response([
                    'message' => "Invalid item id: " . $itemId
                ], 422);
            }
        }
    }

    public function create_price_list(CreatePriceListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;
            $this->validateIds($request);

            $newItems = [];
            foreach ($request->data as $priceListRequest) {
                $partner = $company->partners()->find($priceListRequest['partnerId']);
                $existingItem = $partner->priceList()->find($priceListRequest['itemId']);


                if (!$existingItem) {
                    $partner->priceList()->attach(
                        $priceListRequest['itemId'],
                        ['net_price' => $priceListRequest['netPrice']],
                    );

                    array_push(
                        $newItems,
                        $partner->priceList()->find($priceListRequest['itemId'])
                    );
                }
            }

            return new PriceListCollection($newItems);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function update_price_list(UpdatePriceListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;
            $this->validateIds($request);

            $newItems = [];
            foreach ($request->data as $priceListRequest) {
                $partner = $company->partners()->find($priceListRequest['partnerId']);
                $existingItem = $partner->priceList()->find($priceListRequest['itemId']);

                if ($existingItem) {
                    $partner->priceList()->updateExistingPivot(
                        $priceListRequest['itemId'],
                        ['net_price' => $priceListRequest['netPrice']],
                    );

                    array_push(
                        $newItems,
                        $partner->priceList()->find($priceListRequest['itemId'])
                    );
                }
            }

            return new PriceListCollection($newItems);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function delete_price_list(DeletePriceListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;
            $this->validateIds($request);

            foreach ($request->data as $priceListRequest) {
                $partner = $company->partners()->find($priceListRequest['partnerId']);
                $existingItem = $partner->priceList()->find($priceListRequest['itemId']);

                if ($existingItem) {
                    $partner->priceList()->detach(
                        $priceListRequest['itemId'],
                    );
                }
            }
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
