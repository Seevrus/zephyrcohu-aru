<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class EnsureTokenIsUsedWithId
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('sanctum')->user();
        $userHasAndroidToken = $user && ! is_null($user->device_id);

        if ($userHasAndroidToken) {
            $deviceId = $request->header('X-Device-Id');

            if (! $deviceId || ! Hash::check($deviceId, $user->device_id)) {
                throw new UnauthorizedHttpException(random_bytes(32));
            }
        }

        return $next($request);
    }
}
