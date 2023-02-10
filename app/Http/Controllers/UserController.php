<?php

namespace App\Http\Controllers;

use App\Filters\UsersFilter;
use App\Http\Requests\GenerateMasterTokenRequest;
use App\Http\Requests\GenerateTokenRequest;
use App\Http\Requests\RegisterDeviceRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Mail\MasterKeyUsed;
use App\Models\Company;
use App\Models\Log;
use App\Models\User;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class UserController extends Controller
{
    public function generate_master_token(GenerateMasterTokenRequest $request)
    {
        $company_code = $request->post('companyCode');
        $phone_number = $request->post('phoneNumber');

        $company = Company::firstWhere([
            'code' => $company_code,
        ]);
        $company_id = $company->id;

        $user = User::firstWhere([
            'phone_number' => $phone_number,
            'type' => 'M',
        ]);

        $uuid = Str::uuid();

        if (!$user) {
            $user_id = User::insertGetId([
                'company_id' => $company_id,
                'phone_number' => $phone_number,
                'type' => 'M',
                'device_id' => Hash::make($uuid),
                'created_at' => date('Y-m-d H:i:s'),
            ]);

            $user = User::find($user_id);
        } else {
            $user->device_id = Hash::make($uuid);
            $user->save();
        }

        DB::table('personal_access_tokens')->where([
            'tokenable_id' => $user->id,
            'name' => 'master-token',
        ])->delete();

        $token = $user->createToken('master-token', ['master']);

        return [
            'companyCode' => $user->company->code,
            'phoneNumber' => $user->phone_number,
            'userType' => $user->type,
            'deviceId' => $uuid,
            'tokenType' => 'Bearer',
            'accessToken' => $token->plainTextToken,
        ];
    }

    public function generate_token(GenerateTokenRequest $request)
    {
        $sender = $request->user();
        $sender->last_active = date('Y-m-d H:i:s');
        $sender->save();

        $phone_number = $request->post('phoneNumber');
        $user_type = $request->post('userType');

        $company_id = $sender->company_id;
        $master_token_id = $sender->currentAccessToken()->id;

        $user = User::firstWhere([
            'phone_number' => $phone_number,
            'type' => $user_type,
        ]);

        if (!$user) {
            $user_id = User::insertGetId([
                'company_id' => $company_id,
                'phone_number' => $phone_number,
                'type' => $user_type,
                'created_at' => date('Y-m-d H:i:s'),
            ]);

            $user = User::find($user_id);
        } else {
            $user->device_id = null;
            $user->save();
        }

        DB::table('personal_access_tokens')->where([
            'tokenable_id' => $user->id,
            'name' => 'user-token',
        ])->delete();

        if ($user->type === 'I') {
            $token = $user->createToken('user-token', ['integra']);
        } else {
            $token = $user->createToken('user-token', ['app']);
        }

        Log::insert([
            'company_id' => $sender->company_id,
            'user_id' => $sender->id,
            'token_id' => $master_token_id,
            'action' => 'Created New Access Token',
            'occured_at' => date('Y-m-d H:i:s'),
        ]);

        // TODO: update email template with APP Styles once they are available
        Mail::to(env('MAIL_ADMIN_EMAIL'))->send(new MasterKeyUsed(
            $user->company->code,
            $master_token_id,
            $user->id,
            $user->type,
            $user->phone_number,
            $token->accessToken->id,
        ));

        return [
            'companyCode' => $user->company->code,
            'phoneNumber' => $user->phone_number,
            'userType' => $user->type,
            'tokenType' => 'Bearer',
            'accessToken' => $token->plainTextToken,
        ];
    }

    public function register_device(RegisterDeviceRequest $request)
    {
        $sender = $request->user();

        if (!!$sender->device_id) {
            throw new UnprocessableEntityHttpException();
        }

        $sender->device_id = Hash::make($request->deviceId);
        $sender->last_active = date('Y-m-d H:i:s');
        $sender->save();

        return new UserResource($sender);
    }

    public function check_token(Request $request)
    {
        $sender = $request->user();

        $this->authorize('checkToken', $sender);

        $sender->last_active = date('Y-m-d H:i:s');
        $sender->save();

        return new UserResource($sender->load('company'));
    }

    public function viewAll(Request $request)
    {
        try {
            $this->authorize('viewAll', User::class);

            $user = $request->user();
            $user->last_active = date('Y-m-d H:i:s');
            $user->save();

            $companyUsers = $user->company->users()->get();

            Log::insert([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'token_id' => $user->currentAccessToken()->id,
                'action' => 'Accessed ' . $companyUsers->count() . ' users',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new UserCollection($companyUsers);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new UnprocessableEntityHttpException();
        }
    }

    public function delete(int $id)
    {
        try {
            if (!Gate::allows('check-device-id')) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $sender = request()->user();
            $sender->last_active = date('Y-m-d H:i:s');
            $sender->save();

            $user = User::findOrFail($id);
            $this->authorize('delete', $user);

            $user->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Deleted user ' . $user->id,
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
