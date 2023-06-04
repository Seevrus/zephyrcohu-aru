<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePartnerListRequest;
use App\Http\Requests\UpdatePartnerListRequest;
use App\Http\Resources\PartnerListCollection;
use App\Http\Resources\PartnerListResource;
use App\Models\Log;
use App\Models\Partner;
use App\Models\PartnerList;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class PartnerListController extends Controller
{
    public function create_partner_list(CreatePartnerListRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partnerList = PartnerList::create([
                'company_id' => $sender->company->id,
                'name' => $request->data['name'],
            ]);

            $partnerList->partners()->attach($request->data['partners']);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created partner list ' . $partnerList->id,
                'occured_at' => Carbon::now(),
            ]);

            return new PartnerListResource($partnerList->load('partners'));
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

            $partnerLists = $sender->company->partnerLists()->get();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $partnerLists->count() . ' partners',
                'occured_at' => Carbon::now(),
            ]);

            return new PartnerListCollection($partnerLists->load('partners'));
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function update_partner_list(UpdatePartnerListRequest $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partnerList = PartnerList::find($id);

            if (!$partnerList) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner list.',
                ], 404);
            }

            $this->authorize('update', $partnerList);

            $partnerList->name = $request->data['name'];
            $partnerList->save();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Updated partner list ' . $partnerList->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerListResource($partnerList);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function add_partner(Request $request, int $id, int $partnerId)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partnerList = PartnerList::find($id);
            if (!$partnerList) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner list.',
                ], 404);
            }

            $this->authorize('add_partner', $partnerList);

            $partner = Partner::find($partnerId);
            if (!$partner) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner.',
                ], 404);
            }

            $partnerList->partners()->syncWithoutDetaching($partnerId);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Added partner ' . $partner->id . ' to partner list ' . $partnerList->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerListResource($partnerList->load('partners'));
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_partner(Request $request, int $id, int $partnerId)
    {
        try {
            $sender = $request->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $partnerList = PartnerList::find($id);
            if (!$partnerList) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner list.',
                ], 404);
            }

            $this->authorize('remove_partner', $partnerList);

            $partner = Partner::find($partnerId);
            if (!$partner) {
                return response([
                    'status' => 404,
                    'codeName' => 'Not Found',
                    'message' => 'The server cannot find the requested partner.',
                ], 404);
            }

            $partnerList->partners()->detach($partnerId);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed partner ' . $partner->id . ' from partner list ' . $partnerList->id,
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new PartnerListResource($partnerList->load('partners'));
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_partner_list(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $partnerList = PartnerList::findOrFail($id);
            $this->authorize('remove', $partnerList);

            $partnerList->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed partner list ' . $partnerList->id,
                'occured_at' => Carbon::now(),
            ]);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
