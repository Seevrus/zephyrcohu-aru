<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PartnerPolicy
{
    use HandlesAuthorization;

    public function update(User $user, Partner $partner)
    {
        return $user->company_id === $partner->company->id;
    }

    public function remove(User $user, Partner $partner)
    {
        return $user->company_id === $partner->company->id;
    }
}
