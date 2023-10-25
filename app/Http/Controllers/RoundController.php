<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinishRoundRequest;
use App\Http\Requests\StartRoundRequest;
use App\Http\Resources\RoundCollection;
use App\Http\Resources\RoundResource;
use App\Models\Log;
use App\Models\Round;
use App\Models\Store;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class RoundController extends Controller
{
    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            if (in_array('I', $sender->roleList())) {
                $rounds = $sender->company->rounds;
            } else {
                $rounds = $sender->company->rounds()->where(['user_id' => $sender->id])->latest()->take(10)->get();
            }

            return new RoundCollection($rounds);
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

    public function start_round(StartRoundRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $company = $sender->company;
            $storeId = $request->data['storeId'];

            if ($sender->rounds()->whereNull('round_finished')->first()) {
                return response([
                    'message' => 'User has already started a round.',
                ], 422);
            }

            $store = Store::findOrFail($storeId);

            if ($store->type === 'P') {
                return response([
                    'message' => 'Cannot start round with the primary store.',
                ], 422);
            }

            if ($store->state !== 'I') {
                return response([
                    'message' => 'Store is not idle.',
                ], 422);
            }

            $store->state = 'R';
            $store->user_id = $sender->id;
            $store->save();

            $sender->state = 'R';
            $sender->save();

            $round = Round::create([
                'company_id' => $company->id,
                'user_id' => $sender->id,
                'store_id' => $storeId,
                'partner_list_id' => $request->data['partnerListId'],
                'round_started' => Carbon::createFromFormat('Y-m-d', $request->data['roundStarted'])->setHour(6)->setMinute(0)->setSecond(0),
            ]);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Started round ' . $round->id,
                'occured_at' => Carbon::now(),
            ]);

            return new RoundResource($round);
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

    public function finish_round(FinishRoundRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $round = $sender->rounds()->findOrFail($request->data['roundId']);

            if ($round->round_finished) {
                return response([
                    'message' => 'Round has already been finished.',
                ], 422);
            }

            $store = $sender->store;
            $store->state = 'I';
            $store->user_id = null;
            $store->save();

            $sender->state = 'I';
            $sender->save();

            $round->update([
                'last_serial_number' => $request->data['lastSerialNumber'],
                'year_code' => $request->data['yearCode'],
                'round_finished' => Carbon::now(),
            ]);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Finished round ' . $round->id,
                'occured_at' => Carbon::now(),
            ]);

            return new RoundResource($round);
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
