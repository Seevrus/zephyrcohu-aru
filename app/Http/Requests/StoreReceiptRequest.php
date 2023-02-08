<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class StoreReceiptRequest extends FormRequest
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
            'data' => 'required|array|bail',
            'data.*.userId' => 'required|integer|exists:users,id',
            'data.*.storeCode' => 'required|string|exists:stores,code',
            'data.*.partnerCode' => 'required|string|exists:partners,code',
            'data.*.siteCode' => 'required|string|exists:partners,site_code',
            'data.*.serialNumber' => 'required|integer|distinct|unique:receipts,serial_number',
            'data.*.yearCode' => 'required|integer',
            'data.*.totalAmount' => 'required|integer|min:1|max:4294967295',
            'data.*.createdAt' => 'required|date_format:Y-m-d',
            'data.*.items' => 'required|array|bail',
            'data.*.items.*.articleNumber' => 'required_with:data.*.items|string|exists:items,article_number',
            'data.*.items.*.expirations' => 'required_with:data.*.items|array|bail',
            'data.*.items.*.expirations.*.expiresAt' => 'required_with:data.*.items.*.expirations|date_format:Y-m-d|exists:expirations,expires_at',
            'data.*.items.*.expirations.*.quantity' => 'required_with:data.*.items.*.expirations|integer|min:1|max:65535',
            'data.*.items.*.expirations.*.itemAmount' => 'required_with:data.*.items.*.expirations|integer|min:1|max:4294967295',
            'data.*.orderItems' => 'array|bail',
            'data.*.orderItems.*.articleNumber' => 'required_with:data.*.orderItems|string|exists:items,article_number',
            'data.*.orderItems.*.quantity' => 'required_with:data.*orderItems|integer|min:1|max:65535',
        ];
    }
}
