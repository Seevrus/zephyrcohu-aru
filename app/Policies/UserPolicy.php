<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can use the check-token endpoint.
     * This essentially allows us to do another validation after the sanctum authorization has passed.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function checkToken(User $user)
    {
        return $user->phone_number === request()->header('X-Phone-Number');
    }
}
