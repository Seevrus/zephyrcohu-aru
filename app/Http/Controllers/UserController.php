<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\Company;
use App\Models\Log;
use App\Models\User;
use App\Models\UserPassword;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserController extends Controller
{
    private $password_min_length = 10;

    private $password_max_lifetime = 90 * 24 * 60 * 60;

    private function generate_code($length)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ._+#%@-';
        $code = '';

        for ($i = 0; $i < $length; $i++) {
            $index = random_int(0, strlen($characters) - 1);
            $code .= $characters[$index];
        }

        return $code;
    }

    public function create_user(CreateUserRequest $request)
    {
        try {
            $sender = $request->user();
            $company_id = $sender->company_id;
            $user_name = $request->userName;
            $password = $this->generate_code($this->password_min_length);

            $company = Company::findOrFail($company_id);
            $company_id = $company->id;

            $new_user = User::create([
                'company_id' => $company_id,
                'code' => $request->code,
                'user_name' => $user_name,
                'name' => $request->name,
                'phone_number' => $request->phoneNumber ?? null,

            ]);

            foreach ($request->roles as $role) {
                $new_user->roles()->create([
                    'role' => $role,
                ]);
            }

            $new_user->passwords()->create([
                'password' => Hash::make($password),
                'is_generated' => 1,
                'set_time' => Carbon::now(),
            ]);

            $new_user->save();

            Log::insert([
                'company_id' => $company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Created user '.$user_name,
                'occured_at' => Carbon::now(),
            ]);

            $newUserResource = new UserResource($new_user->load('company'));

            return array_merge(
                $newUserResource->toArray(0),
                [
                    'password' => $password,
                ]
            );
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

    public function login(LoginRequest $request)
    {
        try {
            $user = User::firstWhere([
                'user_name' => $request->userName,
            ]);

            if (! $user) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $user->last_active = Carbon::now();
            $user->save();

            $password = $user->passwords()->orderBy('set_time', 'desc')->first();

            if (! Hash::check($request->password, $password->password)) {
                Log::insert([
                    'company_id' => $user->company_id,
                    'user_id' => $user->id,
                    'token_id' => 0,
                    'action' => 'Tried to log in with a wrong password',
                    'occured_at' => Carbon::now(),
                ]);

                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $user->tokens()->delete();
            $passwordSetTime = new Carbon($password->set_time);
            $isPasswordExpired = $passwordSetTime->diffInSeconds(Carbon::now()) > $this->password_max_lifetime;

            if ($password->is_generated === 1 || $isPasswordExpired) {
                $token = $user->createToken('boreal', ['password']);
            } else {
                $roles = array_map(
                    fn ($role) => $role['role'],
                    $user->roles->toArray()
                );
                $token = $user->createToken('boreal', $roles);
            }
            $tokenExpiration = Carbon::now()->addHours(25);

            Log::insert([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'token_id' => $token->accessToken->id,
                'action' => 'Successfully logged in',
                'occured_at' => Carbon::now(),
            ]);

            $userResource = new UserResource($user->load('company'));

            return array_merge(
                $userResource->toArray(0),
                [
                    'token' => [
                        'tokenType' => 'Bearer',
                        'accessToken' => $token->plainTextToken,
                        'abilities' => $token->accessToken->abilities,
                        'expiresAt' => $tokenExpiration,
                    ],
                ]
            );
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

    public function refresh_token(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $sender->tokens()->delete();
            $password = $sender->passwords()->orderBy('set_time', 'desc')->first();

            $passwordSetTime = new Carbon($password->set_time);
            $isPasswordExpired = $passwordSetTime->diffInSeconds(Carbon::now()) > $this->password_max_lifetime;

            if ($password->is_generated === 1 || $isPasswordExpired) {
                $token = $sender->createToken('boreal', ['password']);
            } else {
                $roles = array_map(
                    fn ($role) => $role['role'],
                    $sender->roles->toArray()
                );
                $token = $sender->createToken('boreal', $roles);
            }
            $tokenExpiration = Carbon::now()->addHours(25);

            $userResource = new UserResource($sender->load('company'));

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => 0,
                'action' => 'Renewed token',
                'occured_at' => Carbon::now(),
            ]);

            return array_merge(
                $userResource->toArray(0),
                [
                    'token' => [
                        'tokenType' => 'Bearer',
                        'accessToken' => $token->plainTextToken,
                        'abilities' => $token->accessToken->abilities,
                        'expiresAt' => $tokenExpiration,
                    ],
                ]
            );
        } catch (Exception $e) {
            throw new BadRequestException();
        }
    }

    public function change_password(ChangePasswordRequest $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $oldPasswordIds = $sender->passwords()->limit(100)->offset(10)->pluck('id');
            UserPassword::whereIn('id', $oldPasswordIds)->delete();

            $previousPasswords = $sender->passwords;
            $newPassword = $request->password;

            foreach ($previousPasswords as $previousPassword) {
                if (Hash::check($newPassword, $previousPassword->password)) {
                    return response([
                        'status' => 400,
                        'codeName' => 'Bad Request',
                        'message' => 'New password cannot be equivalent to the previous 10 passwords',
                    ], 400);
                }
            }

            $sender->tokens()->delete();
            $sender->passwords()->create([
                'password' => Hash::make($newPassword),
                'is_generated' => 0,
                'set_time' => Carbon::now(),
            ]);
            $sender->save();

            $roles = array_map(
                fn ($role) => $role['role'],
                $sender->roles->toArray()
            );
            $token = $sender->createToken('boreal', $roles);
            $tokenExpiration = Carbon::now()->addHours(25)->toDateTimeString();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => 0,
                'action' => 'Changed password',
                'occured_at' => Carbon::now(),
            ]);

            $userResource = new UserResource($sender->load('company'));

            return array_merge(
                $userResource->toArray(0),
                [
                    'token' => [
                        'tokenType' => 'Bearer',
                        'accessToken' => $token->plainTextToken,
                        'abilities' => $token->accessToken->abilities,
                        'expiresAt' => $tokenExpiration,
                    ],
                ]
            );
        } catch (Exception $e) {
            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $companyUsers = $sender->company->users;

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed '.$companyUsers->count().' users',
                'occured_at' => Carbon::now(),
            ]);

            return new UserCollection($companyUsers);
        } catch (Exception $e) {
            throw new BadRequestException();
        }
    }

    public function remove(int $id)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = $sender->company->users()->findOrFail($id);
            $this->authorize('remove', $user);

            $user->delete();

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Removed user '.$user->id,
                'occured_at' => Carbon::now(),
            ]);
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
