<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateItemRequest extends FormRequest
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
      'data.CNCode' => 'string|size:6',
      'data.barcode' => 'nullable|string|min:1|max:255',
      'data.name' => 'string|max:60',
      'data.shortName' => 'string|max:10',
      'data.category' => 'string|max:20',
      'data.unitName' => 'string|max:6',
      'data.productCatalogCode' => 'string|size:11',
      'data.vatRate' => 'string|size:2',
      'data.netPrice' => 'integer|min:0|max:4294967295',
      'data.expirations' => 'array|min:1|bail',
      'data.expirations.*.action' => 'required|in:create,update,delete',
      'data.expirations.*.id' => 'required_if:data.expirations.*.action,update|required_if:data.expirations.*.action,delete|exists:expirations,id',
      'data.expirations.*.barcode' => 'nullable|string|min:1|max:255',
      'data.expirations.*.expiresAt' => 'date_format:Y-m',
      'data.discounts' => 'array|min:1|bail',
      'data.discounts.*.action' => 'required|in:create,update,delete',
      'data.discounts.*.id' => 'required_if:data.discounts.*.action,update|required_if:data.discounts.*.action,delete|exists:discounts,id',
      'data.discounts.*.name' => 'string|min:1',
      'data.discounts.*.type' => 'in:absolute,percentage,freeForm',
      'data.discounts.*.amount' => 'min:0|max:4294967295',
    ];
  }
}
