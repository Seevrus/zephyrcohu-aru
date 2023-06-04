<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePartnerListRequest extends FormRequest
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
            'data' => 'required|bail',
            'data.name' => 'required|string|max:255|unique:partner_lists,name',
            'data.partners' => 'nullable|array|bail',
            'data.partners.*' => 'exists:partners,id',
        ];
    }
}
