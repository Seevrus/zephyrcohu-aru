<?php

namespace App\Exceptions;

use App\Http\Traits\ErrorHandling;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\LockedHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\UnsupportedMediaTypeHttpException;

class Handler extends ExceptionHandler
{
    use ErrorHandling;

    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->renderable(function (AccessDeniedHttpException $e) {
            return $this->forbidden();
        });

        $this->renderable(function (BadRequestException $e) {
            return $this->bad_request();
        });

        $this->renderable(function (LockedHttpException $e) {
            return $this->locked();
        });

        $this->renderable(function (MethodNotAllowedHttpException $e) {
            return $this->method_not_allowed();
        });

        $this->renderable(function (NotFoundHttpException $e) {
            return $this->not_found();
        });

        $this->renderable(function (UnauthorizedHttpException $e) {
            return $this->unauthorized();
        });

        $this->renderable(function (UnsupportedMediaTypeHttpException $e) {
            return $this->unsupported_media_type();
        });

        $this->renderable(function (ThrottleRequestsException $e) {
            return $this->too_many_requests();
        });
    }
}
