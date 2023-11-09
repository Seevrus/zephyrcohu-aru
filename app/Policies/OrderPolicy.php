<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class Orderpolicy
{
    use HandlesAuthorization;

    public function remove(User $user, Order $order)
    {
        return $user->company_id === $order->company->id;
    }
}
