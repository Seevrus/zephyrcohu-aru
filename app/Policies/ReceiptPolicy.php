<?php

namespace App\Policies;

use App\Models\Receipt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class ReceiptPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any receipts.
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
     * Determine whether the user can delete a receipt
     */
    public function delete(User $user, Receipt $receipt)
    {
        return $user->company->id === $receipt->company->id;
    }
}
