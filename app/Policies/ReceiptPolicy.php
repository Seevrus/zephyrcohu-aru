<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ReceiptPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Receipt  $receipt
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function view(User $user, Receipt $receipt)
    {
        return Company::find($user->company_id)
            ->receipts
            ->contains($receipt->id);
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
        return Company::find($user->company_id)
            ->receipts
            ->contains($receipt->id);
    }
}
