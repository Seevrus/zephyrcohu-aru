<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrdersRequest extends FormRequest
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
            'data.*.partnerId' => 'required|exists:partners,id',
            'data.*.orderedAt' => 'required|date_format:Y-m-d H:i:s',
            'data.*.items' => 'required|array|bail',
            'data.*.items.*.articleNumber' => 'required|string|min:1|max:16',
            'data.*.items.*.name' => 'required|string|max:60',
            'data.*.items.*.quantity' => 'required|integer|min:0|max:32767',
        ];
    }
}
