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
    /**
     * IMPORTANT!
     * This endpoint should never be enabled unless it is specifically requested for a specific task. You have been warned.
     */
    // Route::post('/master-token', 'generate_master_token');

    Route::post('/token', 'generate_token')
        ->middleware(['auth:sanctum', 'ability:generate-token']);

    Route::post('/register-device', 'register_device')
        ->middleware(['auth:sanctum', 'ability:check-token']);

    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum', 'ability:check-token']);

    Route::post('/all', 'all')
        ->middleware(['auth:sanctum', 'ability:get-users']);

    Route::delete('/:id', 'delete');
});

Route::controller(ReceiptController::class)->prefix('receipts')->group(function () {
    Route::post('/all', 'all')
        ->middleware(['auth:sanctum', 'ability:get-receipts']);
    Route::get('/{id}', 'show')
        ->middleware(['auth:sanctum', 'ability:get-receipts']);

    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:post-receipt']);
});
