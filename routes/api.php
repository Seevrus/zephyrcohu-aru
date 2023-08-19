<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PartnerListController;
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\StorageController;
use App\Http\Controllers\StoreController;
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

Route::controller(UserRoleController::class)->prefix('users/roles')->group(function () {
    Route::post('/', 'add_user_role')->middleware(['auth:sanctum', 'ability:AM']);
    Route::delete('/', 'remove_user_role')->middleware(['auth:sanctum', 'ability:AM']);
});

Route::controller(UserController::class)->prefix('users')->group(function () {
    Route::post('/', 'create_user')
        ->middleware(['auth:sanctum', 'ability:AM']);

    Route::post('/login', 'login');

    // This seems a bad idea
    Route::get('/refresh-token', 'refresh_token')
        ->middleware(['auth:sanctum']);

    Route::post('/password', 'change_password')
        ->middleware(['auth:sanctum']);

    Route::get('/', 'view_all')
        ->middleware(['auth:sanctum', 'ability:AM']);

    Route::delete('/{id}', 'remove')
        ->middleware(['auth:sanctum', 'ability:AM']);
});

Route::controller(PartnerController::class)->prefix('partners')->group(function () {
    Route::post('/', 'create_partners')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_partner')->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_partner')->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(PartnerListController::class)->prefix('partner-lists')->group(function () {
    Route::post('/', 'create_partner_list')->middleware(['auth:sanctum', 'ability:I']);

    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);

    Route::post('/{id}', 'update_partner_list')
        ->middleware(['auth:sanctum', 'ability:I,A']);

    Route::post('/{id}/{partnerId}', 'add_partner')
        ->middleware(['auth:sanctum', 'ability:I']);

    Route::delete('/{id}/{partnerId}', 'remove_partner')
        ->middleware(['auth:sanctum', 'ability:I']);

    Route::delete('/{id}', 'remove_partner_list')
        ->middleware(['auth:sanctum', 'ability:I,A']);
});

Route::controller(ItemController::class)->prefix('items')->group(function () {
    Route::post('/', 'create_items')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_item')->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_item')->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(PriceListController::class)->prefix('price-lists')->group(function () {
    Route::post('/create', 'create_price_list')->middleware(['auth:sanctum', 'ability:I']);
    Route::post('/update', 'update_price_list')->middleware(['auth:sanctum', 'ability:I']);
    Route::post('/remove', 'delete_price_list')->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(StoreController::class)->prefix('/stores')->group(function () {
    Route::post('/', 'create_stores')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::get('/{id}', 'view')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_store')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::delete('/{id}', 'remove_store')->middleware(['auth:sanctum', 'ability:I']);

    Route::post('/{id}/state', 'update_store_state')->middleware(['auth:sanctum', 'ability:I,A']);
});

Route::controller(StorageController::class)->prefix('/storage')->group(function () {
    Route::post('/load_primary', 'load_primary')
        ->middleware(['auth:sanctum', 'ability:I']);

    Route::post('/lock_to_user', 'lock_to_user')
        ->middleware(['auth:sanctum', 'ability:I,A']);

    Route::post('/load', 'load')
        ->middleware(['auth:sanctum', 'ability:I']);

    Route::post('/unlock_from_user', 'unlock_from_user')
        ->middleware(['auth:sanctum', 'ability:I,A']);
});

/* Route::controller(OrderController::class)->prefix('orders')->group(function () {
    Route::get('/', 'viewAll')
        ->middleware(['auth:sanctum', 'ability:integra']);
    Route::post('/', 'store')
        ->middleware(['auth:sanctum', 'ability:app']);
    Route::delete('/', 'delete')
        ->middleware(['auth:sanctum', 'ability:integra']);
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
