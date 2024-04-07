<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determines whether the user can delete a user
     *
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function remove(User $sender, User $user)
    {
        return $sender->company_id === $user->company_id;
    }
}
