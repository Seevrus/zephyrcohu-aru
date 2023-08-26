<?php

namespace App\Http\Middleware;

use App\Http\Traits\ErrorHandling;
use Closure;
use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnsupportedMediaTypeHttpException;

class EnsureRequestIsJson
{
    use ErrorHandling;

    /**
     * Enforces a valid JSON body for all requests.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            if (! $request->getContent()) {
                return $next($request);
            }

            if ($request->header('Content-Type') == 'application/json') {
                $body = json_encode($request->getContent());
                if ($body === false) {
                    throw new UnsupportedMediaTypeHttpException();
                }

                return $next($request);
            }

            throw new UnsupportedMediaTypeHttpException();
        } catch (Exception $e) {
            return $this->internal_Server_error();
        }
    }
}
