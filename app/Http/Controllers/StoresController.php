<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStoreRequest;
use App\Models\Log;
use App\Models\Store;

class StoresController extends Controller
{
    /**
     * Delete previous stores and saves the new data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreStoreRequest $request)
    {
        $sender = $request->user();
        $company = $sender->company;
        $company->stores()->delete();

        foreach ($request->data as $store) {
            Store::create([
                'company_id' => $company->id,
                'code' => $store['code'],
                'name' => $store['name'],
                'first_available_serial_number' => $store['firstAvailableSerialNumber'],
                'last_available_serial_number' => $store['lastAvailableSerialNumber'],
                'year_code' => $store['yearCode'],
            ]);
        }

        Log::insert([
            'company_id' => $sender->company_id,
            'user_id' => $sender->id,
            'token_id' => $sender->currentAccessToken()->id,
            'action' => 'Stored ' . count($request->data) . ' stores',
            'occured_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
