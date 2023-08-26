<?php

namespace App\Policies;

use App\Models\PriceList;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PriceListPolicy
{
    use HandlesAuthorization;

    public function update(User $user, PriceList $priceList)
    {
        return $user->company_id === $priceList->company->id;
    }

    public function remove(User $user, PriceList $priceList)
    {
        return $user->company_id === $priceList->company->id;
    }
}
