<?php

use App\Http\Controllers\ReceiptController;
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

Route::controller(UserController::class)->prefix('users')->group(function () {
    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum', 'ability:check']);

    /**
     * IMPORTANT!
     * This endpoint should never be enabled unless it is specifically requested for a specific task. It essentially generates all kinds of forever API tokens for free.
     */
    // Route::post('/token', 'generate_token');
});

Route::controller(ReceiptController::class)->prefix('receipts')->group(function () {
    Route::get('/', 'all')
        ->middleware(['auth:sanctum', 'ability:get']);
    Route::get('/{id}', 'show')
        ->middleware(['auth:sanctum', 'ability:get']);

    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:post']);

    Route::delete('/', 'delete')
        ->middleware(['auth:sanctum', 'ability:delete']);
});
