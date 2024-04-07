<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determines whether the user has an Android ID or not and if yes, the sender uses their token appropiately
     */
    public function androidId(User $sender)
    {
        $userHasAndroidToken = !is_null($sender->android_id);

        if ($userHasAndroidToken) {
            $androidId = request()->header('X-Android-Id');

            if (!$androidId) {
                return false;
            }

            return Hash::check($androidId, $sender->android_id);
        }

        // If they do not have one, we just accept the Sanctum result and don't validate anything else here
        return true;
    }

    /**
     * Determines whether the user can delete a user
     *
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function remove(User $sender, User $user)
    {
        return $sender->company_id === $user->company_id;
    }
}
