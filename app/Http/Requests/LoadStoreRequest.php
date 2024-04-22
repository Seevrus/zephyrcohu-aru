<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoadStoreRequest extends FormRequest
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
            'data' => 'required',
            'data.primaryStoreId' => 'required|integer|min:1|exists:stores,id',
            'data.changes' => 'required|array|bail',
            'data.changes.*.expirationId' => 'required|integer|min:1|exists:expirations,id',
            'data.changes.*.startingQuantity' => 'required|integer|min:-2147483648|max:2147483647',
            'data.changes.*.quantityChange' => 'required|integer|min:-2147483648|max:2147483647',
            'data.changes.*.finalQuantity' => 'required|integer|min:-2147483648|max:2147483647',
        ];
    }
}
