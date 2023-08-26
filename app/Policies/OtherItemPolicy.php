<?php

namespace App\Policies;

use App\Models\OtherItem;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class OtherItemPolicy
{
    use HandlesAuthorization;

    public function update(User $user, OtherItem $otherItem)
    {
        return $user->company_id === $otherItem->company->id;
    }

    public function remove(User $user, OtherItem $otherItem)
    {
        return $user->company_id === $otherItem->company->id;
    }
}
