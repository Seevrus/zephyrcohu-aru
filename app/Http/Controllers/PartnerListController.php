<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerListRequest;
use App\Http\Resources\PartnerListCollection;
use App\Models\Log;
use App\Models\Partner;
use App\Models\PartnerList;
use Error;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PartnerListController extends Controller
{
    /**
     * View all partner lists
     */
    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', Partner::class);

            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partnerLists = $sender->company->partner_lists()->with('partners')->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $partnerLists->count() . ' partner lists',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerListCollection($partnerLists);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    /**
     * Delete previous partner lists and store the new array in the database
     *
     * @param  \Illuminate\Http\StorePartnerListRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePartnerListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $company = $sender->company;
            $company->partner_lists()->delete();

            foreach ($request->data as $partnerListRequest) {
                $partnerList = PartnerList::create([
                    'company_id' => $company->id,
                    'name' => $partnerListRequest['name'],
                ]);

                foreach ($partnerListRequest['partners'] as $list) {
                    $partner = $company->partners()->firstWhere([
                        'code' => $list['code'],
                        'site_code' => $list['siteCode'],
                    ]);

                    if (!$partner) {
                        throw new Error('Partner could not be found.');
                    }

                    $partnerList->partners()->attach($partner);
                }
            }

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Stored ' . count($request->data) . ' partner lists',
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
