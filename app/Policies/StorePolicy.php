<?php

namespace App\Policies;

use App\Models\Store;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class StorePolicy
{
    use HandlesAuthorization;

    public function update(User $user, Store $store)
    {
        if (! in_array('I', $user->roleList()) && $store->type === 'P') {
            return false;
        }

        return $user->company_id === $store->company->id;
    }

    public function remove(User $user, Store $store)
    {
        return $user->company_id === $store->company->id;
    }
}
