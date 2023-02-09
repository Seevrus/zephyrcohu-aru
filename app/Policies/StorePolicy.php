<?php

namespace App\Policies;

use App\Models\Store;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
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
     * Determine whether the user can view a specific model.
     * 
     * @param  \App\Models\User  $user
     * @param  \App\Models\Store  $store
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Store $store)
    {
        if (!Hash::check(request()->header('X-Device-Id'), $user->device_id)) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

        return !!$user->company->stores()->firstWhere('id', $store->id);
    }
}
