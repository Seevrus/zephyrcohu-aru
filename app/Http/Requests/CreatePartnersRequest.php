<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePartnersRequest extends FormRequest
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
            'data.*.code' => 'required|string|size:6',
            'data.*.siteCode' => 'required|string|size:4',
            'data.*.vatNumber' => 'required|regex:`^\d{8}-\d{1}-\d{2}$`',
            'data.*.invoiceType' => 'required|string|in:E,P',
            'data.*.invoiceCopies' => 'required|integer|min:0|max:255',
            'data.*.paymentDays' => 'required|integer|min:0|max:255',
            'data.*.iban' => 'required|string|size:4',
            'data.*.bankAccount' => 'required|string|regex:`^\d{8}-\d{8}(?:(-\d{8}))?$`',
            'data.*.phoneNumber' => 'regex:`^\+\d{1,19}$`',
            'data.*.email' => 'string|max:70|email:rfc,dns',
            'data.*.locations' => 'required|array|min:1|max:2|bail',
            'data.*.locations.*.name' => 'required|string|max:50',
            'data.*.locations.*.locationType' => 'required_with:data.*.locations.*|string|in:C,D',
            'data.*.locations.*.country' => 'required_with:data.*.locations.*|string|size:2',
            'data.*.locations.*.postalCode' => 'required_with:data.*.locations.*|string|max:10',
            'data.*.locations.*.city' => 'required_with:data.*.locations.*|string|max:30',
            'data.*.locations.*.address' => 'required_with:data.*.locations.*|string|max:40',
        ];
    }
}
