<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinishRoundRequest;
use App\Http\Requests\StartRoundRequest;
use App\Http\Resources\RoundCollection;
use App\Http\Resources\RoundResource;
use App\Models\Log;
use App\Models\Round;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

function deleteOldRounds()
{
    DB::table('rounds')->where(
        'round_at',
        '<',
        date('Y-m-d H:i:s', time() - 7 * 24 * 60 * 60)
    )->delete();
}

class RoundController extends Controller
{
    /**
     * View the list of rounds
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Round::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();
            deleteOldRounds();

            $rounds = $sender->company->rounds;

            return new RoundCollection($rounds);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Start a new round
     */
    public function start(StartRoundRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();
            deleteOldRounds();

            $company_id = $sender->company_id;

            $round = Round::updateOrCreate(
                [
                    'company_id' => $company_id,
                    'agent_code' => $request->agentCode,
                    'store_code' => $request->storeCode,
                    'partner_list_id' => $request->partnerListId,
                    'round_at' => $request->roundAt,
                ],
                [
                    'agent_name' => $request->agentName,
                    'store_name' => $request->storeName,
                    'partner_list_name' => $request->partnerListName,
                ]
            );

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Started round ' . $round->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new RoundResource($round);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Finish a round
     */
    public function finish(FinishRoundRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();
            deleteOldRounds();

            $round = $sender->company->rounds->find($request->id);

            $round->update([
                'last_serial_number' => $request->lastSerialNumber,
                'year_code' => $request->yearCode,
            ]);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Finished round ' . $request->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new RoundResource($round);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }
}
