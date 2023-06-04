<?php

namespace App\Policies;

use App\Models\PartnerList;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PartnerListPolicy
{
    use HandlesAuthorization;

    public function update(User $user, PartnerList $partnerList)
    {
        return $user->company_id === $partnerList->company->id;
    }

    public function add_partner(User $user, PartnerList $partnerList)
    {
        return $user->company_id === $partnerList->company->id;
    }

    public function remove_partner(User $user, PartnerList $partnerList)
    {
        return $user->company_id === $partnerList->company->id;
    }

    public function remove(User $user, PartnerList $partnerList)
    {
        return $user->company_id === $partnerList->company->id;
    }
}
