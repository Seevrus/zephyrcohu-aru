<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateMasterTokenRequest;
use App\Http\Requests\GenerateTokenRequest;
use App\Http\Resources\UserCollection;
use App\Mail\MasterKeyUsed;
use App\Models\Company;
use App\Models\Log;
use App\Models\User;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class UserController extends Controller
{
    public function check_token()
    {
        $this->authorize('checkToken', User::class);
        request()->user()->last_active = date('Y-m-d H:i:s');
        request()->user()->save();
    }

    public function generate_master_token(GenerateMasterTokenRequest $request)
    {
        $company_id = $request->post('companyId');
        $phone_number = $request->post('phoneNumber');

        User::upsert(
            [
                'company_id' => $company_id,
                'phone_number' => $phone_number,
                'type' => 'M',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'company_id',
                'phone_number',
                'type',
            ]
        );

        $user = User::firstWhere([
            'phone_number' => $phone_number,
            'type' => 'M',
        ]);

        DB::table('personal_access_tokens')->where([
            'tokenable_id' => $user->id,
            'name' => 'master-token',
        ])->delete();

        $token = $user->createToken('master-token', [
            'check-token',
            'generate-token',
        ]);

        return [
            'companyId' => $user->company_id,
            'phoneNumber' => $user->phone_number,
            'userType' => $user->type,
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

        User::upsert(
            [
                'company_id' => $company_id,
                'phone_number' => $phone_number,
                'type' => $user_type,
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'company_id',
                'phone_number',
                'type',
            ]
        );

        $user = User::firstWhere([
            'phone_number' => $phone_number,
            'type' => $user_type,
        ]);

        DB::table('personal_access_tokens')->where([
            'tokenable_id' => $user->id,
            'name' => 'user-token',
        ])->delete();

        if ($user->type === 'I') {
            $token = $user->createToken('user-token', [
                'check-token',
                'get-users',
                'get-receipts',
                'post-receipt',
                'delete-receipt',
            ]);
        } else {
            $token = $user->createToken('user-token', [
                'check-token',
                'post-receipt',
            ]);
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
            $company_id,
            $master_token_id,
            $user->id,
            $user->phone_number,
            $token->accessToken->id,
        ));

        return [
            'companyId' => $user->company_id,
            'phoneNumber' => $user->phone_number,
            'userType' => $user->type,
            'tokenType' => 'Bearer',
            'accessToken' => $token->plainTextToken,
        ];
    }

    public function all(Request $request)
    {
        try {
            $this->authorize('viewAny', User::class);

            $user = $request->user();
            $user->last_active = date('Y-m-d H:i:s');
            $user->save();

            $company_id = $user->company_id;

            $users = Company::find($company_id)->users()->paginate(100);

            Log::insert([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'token_id' => $user->currentAccessToken()->id,
                'action' => 'Accessed ' . $users->count() . ' users',
                'occured_at' => date('Y-m-d H:i:s'),
            ]);

            return new UserCollection($users);
        } catch (Exception $e) {
            if ($e instanceof AuthorizationException) throw $e;
            throw new UnprocessableEntityHttpException();
        }
    }
}
