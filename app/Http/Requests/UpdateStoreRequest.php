<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'data' => 'required|array|bail',
            'data.*.code' => 'string|size:4|unique:stores,code',
            'data.*.name' => 'string|max:255',
            'data.*.type' => 'string|in:P,S',
            'data.*.firstAvailableSerialNumber' => 'integer|min:1|max:16777215',
            'data.*.lastAvailableSerialNumber' => 'integer|min:1|max:16777215|gt:data.*.firstAvailableSerialNumber',
            'data.*.yearCode' => 'integer|min:1|max:32767',
        ];
    }
}
