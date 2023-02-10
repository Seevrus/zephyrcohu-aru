<?php

use App\Http\Controllers\ItemsController;
use App\Http\Controllers\PartnersController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\StoreController;
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
        ->middleware(['auth:sanctum', 'ability:master']);

    Route::post('/register-device', 'register_device')
        ->middleware(['auth:sanctum', 'ability:app,integra']);

    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum', 'ability:master,app,integra']);

    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);

    Route::delete('/{id}', 'delete')
        ->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(ItemsController::class)->prefix('items')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(StoreController::class)->prefix('/stores')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::get('/{code}', 'view')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(PartnersController::class)->prefix('partners')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(ReceiptController::class)->prefix('receipts')->group(function () {
    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);
    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:app']);
});
