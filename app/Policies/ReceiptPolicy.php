<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;

class ReceiptPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any receipts.
     *
     * @param  \App\Models\User  $user
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function viewAny(User $user)
    {
        return Hash::check(request()->header('X-Device-Id'), $user->device_id);
    }

    /**
     * Determine whether the user can view the receipt.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Receipt $receipt)
    {
        if (!Hash::check(request()->header('X-Device-Id'), $user->device_id)) {
            return false;
        }

        return Company::find($user->company_id)
            ->receipts
            ->contains($receipt->id);
    }

    /**
     * Determine whether the user can store the receipt.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function store(User $user)
    {
        return Hash::check(request()->header('X-Device-Id'), $user->device_id);
    }

    /**
     * Determine whether the user can delete a receipt.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function delete(User $user, Receipt $receipt)
    {
        if (!Hash::check(request()->header('X-Device-Id'), $user->device_id)) {
            return false;
        }

        return Company::find($user->company_id)
            ->receipts
            ->contains($receipt->id);
    }
}
