<?php

use App\Http\Controllers\ItemController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OtherItemController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PartnerListController;
use App\Http\Controllers\PriceListController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\RoundController;
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

    Route::get('/check-token', 'check_token')
        ->middleware(['auth:sanctum']);

    Route::post('/password', 'change_password')
        ->middleware(['auth:sanctum']);

    Route::get('/', 'view_all')
        ->middleware(['auth:sanctum', 'ability:AM']);

    Route::post('/delete', 'delete')
        ->middleware(['auth:sanctum', 'ability:AM']);
});

Route::controller(PartnerController::class)->prefix('partners')->group(function () {
    Route::post('/', 'create_partners')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);

    Route::post('/search', 'search')->middleware(['auth:sanctum', 'ability:I,A']);

    Route::get('/{id}', 'view')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_partner')->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_partner')->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(PartnerListController::class)->prefix('partner_lists')->group(function () {
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

Route::controller(PriceListController::class)->prefix('price_lists')->group(function () {
    Route::post('/', 'create_price_list')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::get('/{id}', 'view')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_price_list')->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_price_list')->middleware(['auth:sanctum', 'ability:I']);

    Route::post('/{id}/upsert_items', 'upsert_items')->middleware(['auth:sanctum', 'ability:I']);
    Route::post('/{id}/remove_items', 'remove_items')->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(OtherItemController::class)->prefix('other_items')->group(function () {
    Route::post('/', 'create_other_items')->middleware(['auth:sanctum', 'ability:I']);
    Route::get('/', 'view_all')->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/{id}', 'update_other_item')->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_other_item')->middleware(['auth:sanctum', 'ability:I']);
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
        ->middleware(['auth:sanctum', 'ability:I,A']);

    Route::post('/sell', 'sell_items_from_store')
        ->middleware((['auth:sanctum', 'ability:A']));

    Route::post('/unlock_from_user', 'unlock_from_user')
        ->middleware(['auth:sanctum', 'ability:I,A']);
});

Route::controller(OrderController::class)->prefix('orders')->group(function () {
    Route::post('/', 'create_orders')
        ->middleware(['auth:sanctum', 'ability:I,A']);
    Route::get('/', 'view_all')
        ->middleware(['auth:sanctum', 'ability:I']);
    Route::delete('/{id}', 'remove_order')
        ->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(ReceiptController::class)->prefix('receipts')->group(function () {
    Route::post('/', 'create_receipts')
        ->middleware(['auth:sanctum', 'ability:A']);
    Route::get('/', 'view_all')
        ->middleware(['auth:sanctum', 'ability:I']);
    Route::post('/update_printed_copies', 'update_receipt_original_copies_printed')
        ->middleware(['auth:sanctum', 'ability:A']);
    Route::delete('/{id}', 'remove_receipt')
        ->middleware(['auth:sanctum', 'ability:I']);
});

Route::controller(RoundController::class)->prefix('rounds')->group(function () {
    Route::get('/', 'view_all')
        ->middleware(['auth:sanctum', 'ability:I,A']);
    Route::post('/start', 'start_round')
        ->middleware(['auth:sanctum', 'ability:A']);
    Route::post('/finish', 'finish_round')
        ->middleware(['auth:sanctum', 'ability:A']);
});
