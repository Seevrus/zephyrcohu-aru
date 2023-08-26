<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePriceListRequest;
use App\Http\Resources\PriceListCollection;
use App\Http\Resources\PriceListResource;
use App\Models\Log;
use App\Models\PriceList;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PriceListController extends Controller
{
    public function create_price_list(CreatePriceListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;

            $priceListName = $request->data['name'];
            $priceList = PriceList::create([
                'company_id' => $company->id,
                'name' => $priceListName,
            ]);

            if (@$request->data['items']) {
                foreach ($request->data['items'] as $priceListItem) {
                    $priceList->items()->attach(
                        $priceListItem['itemId'],
                        ['net_price' => $priceListItem['netPrice']]
                    );
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created price list ' . $priceListName,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList->with('items')->first());
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $priceLists = $sender->company->priceLists()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $priceLists->count() . ' price lists',
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListCollection($priceLists);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function view(Request $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $priceList = $sender->company->priceLists()->with('items')->findOrFail($id);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed price list ' . $id,
                'occured_at' => Carbon::now(),
            ]);

            return new PriceListResource($priceList);
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
