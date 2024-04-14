<?php

namespace App\Policies;

use App\Models\StorageReceipt;
use App\Models\User;

class StorageReceiptPolicy
{
    public function remove(User $user, StorageReceipt $storageReceipt)
    {
        return $user->company->id === $storageReceipt->company->id;
    }
}
