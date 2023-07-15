<?php

namespace App\Policies;

use App\Models\Item;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ItemPolicy
{
    use HandlesAuthorization;

    public function update(User $user, Item $item)
    {
        return $user->company_id === $item->company->id;
    }

    public function remove(User $user, Item $item)
    {
        return $user->company_id === $item->company->id;
    }
}
