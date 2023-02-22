<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class Orderpolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any orders.
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
     * Determine whether the user can delete an order
     */
    public function delete(User $user, Order $order)
    {
        return $user->company->id === $order->company->id;
    }
}
