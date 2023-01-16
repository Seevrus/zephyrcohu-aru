<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserController extends Controller
{
    public function check_token()
    {
        request()->user()->last_active = date('Y-m-d H:i:s');
        request()->user()->save();
        return true;
    }

    public function generate_token(Request $request)
    {
        $phone_number = $request->post('phoneNumber');

        $user = User::firstWhere('phone_number', $phone_number);

        if (!$user) {
            throw new NotFoundHttpException();
        }

        $user->currentAccessToken()?->delete();

        if ($user->type === 'I') {
            $token = $user->createToken('zephyr-token', [
                'check',
                'get',
                'post',
                'delete',
            ]);
        } else {
            $token = $user->createToken('zephyr-token', [
                'check',
                'post',
            ]);
        }

        return [
            'accessToken' => $token->plainTextToken,
            'tokenType' => 'Bearer',
            'phoneNumber' => $phone_number,
        ];
    }
}
