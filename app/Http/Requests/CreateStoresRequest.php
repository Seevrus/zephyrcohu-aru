<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateStoresRequest extends FormRequest
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
            'data.*.code' => 'required|string|size:4|distinct|unique:stores,code',
            'data.*.name' => 'required|string|max:255|distinct',
            'data.*.type' => 'required|string|in:P,S',
            'data.*.firstAvailableSerialNumber' => 'required_if:data.*.type,S|integer|min:1|max:16777215',
            'data.*.lastAvailableSerialNumber' => 'required_if:data.*.type,S|integer|min:1|max:16777215|gt:data.*.firstAvailableSerialNumber',
            'data.*.yearCode' => 'required_if:data.*.type,S|integer|min:1|max:32767',
        ];
    }
}
