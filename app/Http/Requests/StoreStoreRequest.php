<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class StoreStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return Hash::check(request()->header('X-Device-Id'), $this->user()->device_id);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'data' => 'required|array:companyCode|code|firstAvailableSerialNumber|lastAvailableSerialNumber|yearCode',
            'data.*.companyCode' => 'required|string|size:3|exists:companies,code',
            'data.*.name' => 'required|string|max:255',
            'data.*.firstAvailableSerialNumber' => 'required|integer|min:1|max:16777215',
            'data.*.lastAvailableSerialNumber' => 'required|integer|min:1|max:16777215|gt:firstAvailableSerialNumber',
            'data.*.*yearCode' => 'required|integer|min:1|max:32767',
        ];
    }
}
