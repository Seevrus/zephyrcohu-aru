<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\DeleteUserRequest;
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
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\LockedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserController extends Controller
{
    private $password_min_length = 10;

    private $password_max_lifetime = 90 * 24 * 60 * 60;

    private function generate_code($length)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
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
            $userName = $request->userName;

            if ($sender->company->users()->firstWhere(['user_name' => $userName])) {
                return response([
                    'message' => 'User already exists: '.$userName,
                ], 409);
            }

            $password = $this->generate_code($this->password_min_length);

            $company = Company::findOrFail($company_id);
            $company_id = $company->id;

            $new_user = User::create([
                'company_id' => $company_id,
                'user_name' => $userName,
                'name' => $request->name,
                'state' => 'I',
                'phone_number' => $request->phoneNumber ?? null,
                'created_at' => Carbon::now(),
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
                'action' => 'Created user '.$userName,
                'occured_at' => Carbon::now(),
            ]);

            return new UserResource(
                $new_user->load('company'),
                null,
                null,
                $password
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
            $reguestUserIdentifier = explode('@', $request->userName);
            $userName = $reguestUserIdentifier[0];
            $companyCode = $reguestUserIdentifier[1];

            $company = Company::firstWhere(['code' => $companyCode]);

            if (! $company) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $user = $company->users()->firstWhere([
                'user_name' => $userName,
            ]);

            if (! $user) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $currentAttempts = $user->attempts;
            $user->last_active = Carbon::now();
            $user->save();

            if ($currentAttempts > 2) {
                throw new ThrottleRequestsException();
            }

            $androidId = $request->header('X-Android-Id');

            if (
                (is_null($androidId) && ! is_null($user->android_id)) ||
                (! is_null($androidId) && ! is_null($user->android_id))
            ) {
                Log::insert([
                    'company_id' => $user->company_id,
                    'user_id' => $user->id,
                    'token_id' => 0,
                    'action' => 'Tried to log in from a different device',
                    'occured_at' => Carbon::now(),
                ]);

                $user->attempts = $currentAttempts + 1;
                $user->save();

                throw new LockedHttpException();
            }

            $password = $user->passwords()->orderBy('set_time', 'desc')->first();

            if (! Hash::check($request->password, $password->password)) {
                Log::insert([
                    'company_id' => $user->company_id,
                    'user_id' => $user->id,
                    'token_id' => 0,
                    'action' => 'Tried to log in with a wrong password',
                    'occured_at' => Carbon::now(),
                ]);

                $user->attempts = $currentAttempts + 1;
                $user->save();

                throw new UnauthorizedHttpException(random_bytes(32));
            }

            $isAndroidToken = ! is_null($androidId);
            $tokenExpiration = $isAndroidToken ? null : Carbon::now()->addHour();

            if ($isAndroidToken && is_null($user->android_id)) {
                $user->android_id = Hash::make($androidId);
            }
            $user->attempts = 0;
            $user->tokens()->delete();
            $passwordSetTime = new Carbon($password->set_time);
            $isPasswordExpired = $passwordSetTime->diffInSeconds(Carbon::now()) > $this->password_max_lifetime;

            if ($password->is_generated === 1 || $isPasswordExpired) {
                $token = $user->createToken('boreal', ['password'], $tokenExpiration);
            } else {
                $roles = array_map(
                    fn ($role) => $role['role'],
                    $user->roles->toArray()
                );
                $token = $user->createToken('boreal', $roles, $tokenExpiration);
            }

            Log::insert([
                'company_id' => $user->company_id,
                'user_id' => $user->id,
                'token_id' => $token->accessToken->id,
                'action' => 'Successfully logged in',
                'occured_at' => Carbon::now(),
            ]);

            $user->save();

            return new UserResource(
                $user->load('company', 'rounds'),
                $token,
                $tokenExpiration
            );
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof LockedHttpException
                || $e instanceof ThrottleRequestsException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function check_token(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $isAndroidToken = ! is_null($sender->android_id);

            $token = $sender->currentAccessToken();
            $tokenExpiration = $isAndroidToken
                ? null
                : Carbon::parse($token->created_at)->addHour();

            return new UserResource(
                $sender->load('company', 'rounds'),
                (object) [
                    'plainTextToken' => $request->bearerToken(),
                    'accessToken' => (object) [
                        'abilities' => $token->abilities,
                    ],
                ],
                $tokenExpiration
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

    public function logout(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->android_id = null;
            $sender->last_active = Carbon::now();

            $sender->tokens()->delete();
            $sender->save();
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

            $senderRoles = array_map(
                fn ($role) => $role['role'],
                $sender->roles->toArray()
            );

            $isSenderAdmin = in_array('AM', $senderRoles);

            if ($request->userName && ! $isSenderAdmin) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            if ($isSenderAdmin && $request->userName) {
                $subjectOfChange = User::firstWhere([
                    'user_name' => $request->userName,
                ]);

                if (! $subjectOfChange) {
                    throw new NotFoundHttpException();
                }
            } else {
                $subjectOfChange = $sender;
            }

            $oldPasswordIds = $subjectOfChange->passwords()->limit(100)->offset(10)->pluck('id');
            UserPassword::whereIn('id', $oldPasswordIds)->delete();

            $previousPasswords = $subjectOfChange->passwords;
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

            $subjectOfChange->attempts = 0;
            $subjectOfChange->tokens()->delete();
            $subjectOfChange->passwords()->create([
                'password' => Hash::make($newPassword),
                'is_generated' => 0,
                'set_time' => Carbon::now(),
            ]);
            $subjectOfChange->save();

            $subjectRoles = array_map(
                fn ($role) => $role['role'],
                $subjectOfChange->roles->toArray()
            );
            $token = $subjectOfChange->createToken('boreal', $subjectRoles);
            $tokenExpiration = Carbon::now()->addHours(25)->toDateTimeString();

            Log::insert([
                'company_id' => $subjectOfChange->company_id,
                'user_id' => $subjectOfChange->id,
                'token_id' => 0,
                'action' => 'Changed password',
                'occured_at' => Carbon::now(),
            ]);

            return new UserResource(
                $subjectOfChange->load('company'),
                $token,
                $tokenExpiration
            );
        } catch (Exception $e) {
            if (
                $e instanceof NotFoundHttpException
                || $e instanceof UnauthorizedHttpException
            ) {
                throw $e;
            }

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

    public function view(Request $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = $sender->company->users()->find($id);

            if (! $user) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

            return new UserResource($user->load('company', 'rounds'));
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof NotFoundHttpException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function delete(DeleteUserRequest $request)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = User::firstWhere([
                'user_name' => $request->userName,
            ]);
            $this->authorize('remove', $user);

            if ($sender->id === $user->id) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }

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
