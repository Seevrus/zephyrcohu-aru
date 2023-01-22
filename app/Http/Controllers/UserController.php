<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateMasterTokenRequest;
use App\Http\Requests\GenerateTokenRequest;
use App\Mail\MasterKeyUsed;
use App\Models\Log;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

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
            'check',
            'generate'
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
        $phone_number = $request->post('phoneNumber');
        $user_type = $request->post('userType');

        $sender = $request->user();
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
                'check',
                'get',
                'post',
                'delete',
            ]);
        } else {
            $token = $user->createToken('user-token', [
                'check',
                'post',
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
}
