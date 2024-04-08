<?php

namespace App\Http\Controllers;

use App\Http\Resources\CompanyCollection;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function view_all(Request $request)
    {
        $companies = Company::all();
        return new CompanyCollection($companies);
    }
}
