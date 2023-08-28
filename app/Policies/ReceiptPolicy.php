<?php

namespace App\Policies;

use App\Models\Receipt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ReceiptPolicy
{
    use HandlesAuthorization;

    public function update(User $user, Receipt $receipt)
    {
        return $user->company->id === $receipt->company->id;
    }

    public function remove(User $user, Receipt $receipt)
    {
        return $user->company->id === $receipt->company->id;
    }
}
