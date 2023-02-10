<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determines whether the user can use the check-token endpoint.
     * This essentially allows us to do another validation after the sanctum authorization has passed.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function checkToken(User $user)
    {
        if (!Hash::check(request()->header('X-Device-Id'), $user->device_id)) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

        return true;
    }

    /**
     * Determines whether the user can view other users.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAll(User $user)
    {
        if (!Hash::check(request()->header('X-Device-Id'), $user->device_id)) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

        return true;
    }

    /**
     * Determines whether the user can delete a user
     * 
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $sender, User $user)
    {
        // Device Id is already checked before user is retrieved
        return $sender->company_id === $user->company_id;
    }
}
