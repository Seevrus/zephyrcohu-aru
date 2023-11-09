<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReceiptsPrintedCopiesRequest extends FormRequest
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
            'data.*.id' => 'required|integer|min:0', // intentionally not checking if id exists
            'data.*.originalCopiesPrinted' => 'required|integer|min:0|max:999',
        ];
    }
}
