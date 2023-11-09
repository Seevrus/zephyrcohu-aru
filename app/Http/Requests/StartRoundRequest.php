<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StartRoundRequest extends FormRequest
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
            'data' => 'required|array',
            'data.storeId' => 'required|integer|min:0|exists:stores,id',
            'data.partnerListId' => 'required|integer|min:0|exists:partner_lists,id',
            'data.roundStarted' => 'required|date_format:Y-m-d',
        ];
    }
}
