<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateItemsRequest extends FormRequest
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
            'data.*.CNCode' => 'required|string|size:6',
            'data.*.articleNumber' => 'required|string|min:1|max:16|distinct|unique:items,article_number',
            'data.*.barcode' => 'string|min:1|max:255',
            'data.*.name' => 'required|string|max:60|distinct',
            'data.*.shortName' => 'required|string|max:10|distinct',
            'data.*.category' => 'required|string|max:20',
            'data.*.unitName' => 'required|string|max:6',
            'data.*.productCatalogCode' => 'required|string|size:11|distinct',
            'data.*.vatRate' => 'required|string|size:2',
            'data.*.netPrice' => 'required|integer|min:0|max:4294967295',
            'data.*.expirations' => 'required|array|min:1|bail',
            'data.*.expirations.barcode' => 'string|min:1|max:255',
            'data.*.expirations.*.expiresAt' => 'required|date_format:Y-m|distinct',
            'data.*.discounts' => 'array|min:1|bail',
            'data.*.discounts.*.name' => 'required|string|min:1|distinct',
            'data.*.discounts.*.type' => 'required|in:absolute,percentage,freeForm',
            'data.*.discounts.*.amount' => 'integer|min:0|max:4294967295',
        ];
    }
}
