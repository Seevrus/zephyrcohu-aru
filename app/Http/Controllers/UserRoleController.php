<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserRoleRequest;
use App\Http\Requests\RemoveUserRoleRequest;
use App\Http\Resources\UserRoleCollection;
use App\Models\UserRole;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserRoleController extends Controller
{
    public function add_user_role(AddUserRoleRequest $request)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = $sender->company->users()->firstWhere([
                'user_name' => $request->userName,
            ]);

            if (!$user) {
                throw new ModelNotFoundException();
            }

            if ($sender->company_id !== $user->company_id) {
                throw new AuthorizationException();
            }

            $existingRoles = $user->roles->pluck('role')->toArray();

            foreach ($request->roles as $role) {
                if (array_search($role, $existingRoles) === false) {
                    $user->roles()->save(
                        new UserRole(['role' => $role])
                    );
                }
            }

            return new UserRoleCollection($user->fresh()->roles);
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

    public function delete_user_role(RemoveUserRoleRequest $request)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = $sender->company->users()->firstWhere([
                'user_name' => $request->userName,
            ]);

            if (!$user) {
                throw new ModelNotFoundException();
            }

            if ($sender->company_id !== $user->company_id) {
                throw new AuthorizationException();
            }

            UserRole::where(['user_id' => $user->id])->whereIn('role', $request->roles)->delete();

            return new UserRoleCollection($user->fresh()->roles);
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
