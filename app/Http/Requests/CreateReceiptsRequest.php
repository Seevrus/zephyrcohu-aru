<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateReceiptsRequest extends FormRequest
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
            'data.*.partnerId' => 'required|integer|min:1',
            'data.*.partnerCode' => 'required|string|size:6',
            'data.*.partnerSiteCode' => 'required|string|size:4',
            'data.*.serialNumber' => 'required|integer|min:0|max:16777215|distinct',
            'data.*.yearCode' => 'required|integer|min:0|max:99',
            'data.*.vendor' => 'required',
            'data.*.vendor.name' => 'required|string|max:50',
            'data.*.vendor.country' => 'required|string|size:2',
            'data.*.vendor.postalCode' => 'required|string|max:10',
            'data.*.vendor.city' => 'required|string|max:30',
            'data.*.vendor.address' => 'required|string|max:40',
            'data.*.vendor.felir' => 'required|string|size:9',
            'data.*.vendor.iban' => 'string|size:4',
            'data.*.vendor.bankAccount' => 'string|regex:`^\d{8}-\d{8}(?:(-\d{8}))?$`',
            'data.*.vendor.vatNumber' => 'required|regex:`^\d{8}-\d{1}-\d{2}$`',
            'data.*.buyer.name' => 'required|string|max:50',
            'data.*.buyer.country' => 'required|string|size:2',
            'data.*.buyer.postalCode' => 'required|string|max:10',
            'data.*.buyer.city' => 'required|string|max:30',
            'data.*.buyer.address' => 'required|string|max:40',
            'data.*.buyer.iban' => 'string|size:4',
            'data.*.buyer.bankAccount' => 'string|regex:`^\d{8}-\d{8}(?:(-\d{8}))?$`',
            'data.*.buyer.vatNumber' => 'required|regex:`^\d{8}-\d{1}-\d{2}$`',
            'data.*.buyer.deliveryName' => 'string|max:50',
            'data.*.buyer.deliveryCountry' => 'string|size:2',
            'data.*.buyer.deliveryPostalCode' => 'string|max:10',
            'data.*.buyer.deliveryCity' => 'string|max:30',
            'data.*.buyer.deliveryAddress' => 'string|max:40',
            'data.*.invoiceDate' => 'required|date_format:Y-m-d',
            'data.*.fulfillmentDate' => 'required|date_format:Y-m-d',
            'data.*.invoiceType' => 'required|string|in:E,P',
            'data.*.paidDate' => 'required|date_format:Y-m-d',
            'data.*.items' => 'required|array|bail',
            'data.*.items.*.id' => 'required|integer|min:0',
            'data.*.items.*.CNCode' => 'required|string|size:6',
            'data.*.items.*.articleNumber' => 'required|string|min:1|max:16',
            'data.*.items.*.expiresAt' => 'required|date_format:Y-m',
            'data.*.items.*.name' => 'required|string|max:60',
            'data.*.items.*.quantity' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.items.*.unitName' => 'required|string|max:6',
            'data.*.items.*.discountName' => 'string|max:255',
            'data.*.items.*.netPrice' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.items.*.netAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.items.*.vatRate' => 'required|string|size:2',
            'data.*.items.*.vatAmount' => 'integer|min:-2147483648|max:2147483647',
            'data.*.items.*.grossAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.otherItems' => 'array|bail',
            'data.*.otherItems.*.id' => 'required|integer|min:0',
            'data.*.otherItems.*.articleNumber' => 'required|string|min:1|max:16',
            'data.*.otherItems.*.name' => 'required|string|max:60',
            'data.*.otherItems.*.quantity' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.otherItems.*.unitName' => 'required|string|max:6',
            'data.*.otherItems.*.netPrice' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.otherItems.*.netAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.otherItems.*.vatRate' => 'required|string|size:2',
            'data.*.otherItems.*.vatAmount' => 'integer|min:-2147483648|max:2147483647',
            'data.*.otherItems.*.grossAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.otherItems.*.comment' => 'string|max:255',
            'data.*.quantity' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.netAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.vatAmount' => 'integer|min:-2147483648|max:2147483647',
            'data.*.grossAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.vatAmounts' => 'required|array|bail',
            'data.*.vatAmounts.*.vatRate' => 'required|string|size:2',
            'data.*.vatAmounts.*.netAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.vatAmounts.*.vatAmount' => 'integer|min:-2147483648|max:2147483647',
            'data.*.vatAmounts.*.grossAmount' => 'required|integer|min:-2147483648|max:2147483647',
            'data.*.roundAmount' => 'required|integer|min:-2|max:2',
            'data.*.roundedAmount' => 'required|integer|min:-2147483648|max:2147483647',
        ];
    }
}
