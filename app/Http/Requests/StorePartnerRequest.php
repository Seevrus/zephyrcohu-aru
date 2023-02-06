<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorePartnerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        if (!Hash::check(request()->header('X-Device-Id'), $this->user()->device_id)) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

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
            'data.*.storeCode' => 'string|size:4|exists:stores,code',
            'data.*.code' => 'required|string|size:6',
            'data.*.siteCode' => 'required|string|size:4',
            'data.*.name' => 'required|string|max:50',
            'data.*.country' => 'required|string|size:2',
            'data.*.postalCode' => 'required|string|max:10',
            'data.*.city' => 'required|string|max:30',
            'data.*.address' => 'required|string|max:40',
            'data.*.vatNumber' => 'required|regex:`^\d{8}-\d{1}-\d{2}$`',
            'data.*.iban' => 'required|string|size:4',
            'data.*.bankAccount' => 'required|string|regex:`^\d{8}-\d{8}(?:(-\d{8}))?$`',
            'data.*.phoneNumber' => 'string|max:20',
            'data.*.email' => 'string|max:70|email:rfc,dns',
            'data.*.priceList.code' => 'required_with:data.*.priceList|string|size:4|distinct',
            'data.*.priceList.items' => 'required_with:data.*.priceList|array|bail',
            'data.*.priceList.items.*.articleNumber' => 'required|string|size:16|exists:items,article_number',
            'data.*.priceList.items.*.price' => 'required|numeric|min:0',
        ];
    }
}
