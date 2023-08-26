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

    public function upsert_items(User $user, PriceList $priceList)
    {
        return $user->company_id === $priceList->company->id;
    }

    public function remove_items(User $user, PriceList $priceList)
    {
        return $user->company_id === $priceList->company->id;
    }
}
