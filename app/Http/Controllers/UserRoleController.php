<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddUserRoleRequest;
use App\Http\Requests\RemoveUserRoleRequest;
use App\Models\User;
use App\Models\UserRole;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Log;
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

            $user = User::firstWhere([
                'user_name' => $request->userName
            ]);

            if ($sender->company_id !== $user->company_id) {
                throw new AuthorizationException();
            }

            $existingRoles = $user->roles->pluck('role')->toArray();

            foreach ($request->roles as $role) {
                if (!array_search($role, $existingRoles)) {
                    $user->roles()->save(
                        new UserRole(['role' => $role])
                    );
                }
            }
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }

    public function remove_user_role(RemoveUserRoleRequest $request)
    {
        try {
            $sender = request()->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $user = User::firstWhere([
                'user_name' => $request->userName
            ]);

            if ($sender->company_id !== $user->company_id) {
                throw new AuthorizationException();
            }

            UserRole::where(['user_id' => $user->id])->whereIn('role', $request->roles)->delete();
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
            ) throw $e;

            throw new BadRequestException();
        }
    }
}
