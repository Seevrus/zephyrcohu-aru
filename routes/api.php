<?php

use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::controller(UserController::class)->group(function () {
    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum', 'ability:check']);

    /**
     * IMPORTANT!
     * This endpoint should never be enabled unless it is specifically requested for a specific task. It essentially generates all kinds of forever API tokens for free.
     */
    // Route::post('/token', 'generate_token');
});
