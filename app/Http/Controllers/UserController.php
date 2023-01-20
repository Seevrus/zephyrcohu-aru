<?php

namespace App\Http\Controllers;

use App\Mail\MasterKeyUsed;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function check_token()
    {
        request()->user()->last_active = date('Y-m-d H:i:s');
        request()->user()->save();
        return true;
    }

    public function generate_master_token(Request $request)
    {
        $request->validate([
            'companyId' => 'required|exists:companies,id',
            'phoneNumber' => 'required|regex:`^\+36[237]0\d{7}$`'
        ]);

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

        $token = $user->createToken('master-token', ['generate']);

        return [
            'companyId' => $user->company_id,
            'phoneNumber' => $user->phone_number,
            'userType' => $user->type,
            'tokenType' => 'Bearer',
            'accessToken' => $token->plainTextToken,
        ];
    }

    public function generate_token(Request $request)
    {
        $request->validate([
            'phoneNumber' => 'required|regex:`^\+36[237]0\d{7}$`',
            'userType' => 'required|in:A,I',
        ]);

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

        // TODO: update email template with APP Styles once they are available
        Mail::to('tiller2004@gmail.com')->send(new MasterKeyUsed(
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

    // TODO: logokat beállítani adatbázis hozzáférések naplózásához. Ki, melyik végpont, mikor
}
