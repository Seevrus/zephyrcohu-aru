<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;
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
    Route::post('/register', 'register')
        ->middleware(['auth:sanctum', 'ability:M']);

    Route::post('/login', 'login');

    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum']);

    Route::post('/password', 'change_password')
        ->middleware(['auth:sanctum']);

    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:I']);

    Route::delete('/{id}', 'delete')
        ->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(UserRoleController::class)->prefix('users/roles')->group(function () {
    Route::post('', 'add')->middleware(['auth:sanctum', 'ability:I']);

    Route::delete('', 'delete')->middleware(['auth:sanctum', 'ability:I']);
});

/* Route::controller(AgentController::class)->prefix('users')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
    Route::put('/{id}', 'delete')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(ItemsController::class)->prefix('items')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(OrderController::class)->prefix('orders')->group(function () {
    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);
    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:app']);
    Route::delete('/', 'delete')
        ->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(PartnersController::class)->prefix('partners')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(PartnerListController::class)->prefix('partner-lists')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(StoreController::class)->prefix('/stores')->group(function () {
    Route::get('/', 'viewAll')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::get('/{code}', 'view')->middleware(['auth:sanctum', 'ability:app,integra']);
    Route::put('/', 'store')->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(ReceiptController::class)->prefix('receipts')->group(function () {
    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);
    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:app']);
    Route::delete('/', 'delete')
        ->middleware(['auth:sanctum', 'ability:integra']);
});

Route::controller(RoundController::class)->prefix('rounds')->group(function () {
    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);
    Route::post('/start', 'start')
        ->middleware(['auth:sanctum', 'ability:app']);
    Route::post('/finish', 'finish')
        ->middleware(['auth:sanctum', 'ability:app']);
}); */
