<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePartnerRequest;

class PartnersController extends Controller
{
    /**
     * Delete previous partners and store the new array in the database
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StorePartnerRequest $request)
    {
        //
    }
}
