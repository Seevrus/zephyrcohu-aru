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
      'data.name' => 'string|max:60|distinct',
      'data.shortName' => 'string|max:10|distinct',
      'data.category' => 'string|max:20',
      'data.unitName' => 'string|max:6',
      'data.productCatalogCode' => 'string|size:11|distinct',
      'data.vatRate' => 'string|size:2',
      'data.netPrice' => 'integer|min:0|max:2147483647',
      'data.expirations' => 'array|min:1|bail',
      'data.expirations.*.action' => 'required|in:create,delete',
      'data.expirations.*.expiresAt' => 'required|date_format:Y-m',
      'data.discouns' => 'array|min:1|bail',
      'data.discounts.*.action' => 'required|in:create,update,delete',
      'data.discounts.*.name' => 'string|min:1',
      'data.discounts.*.type' => 'in:absolute,percentage,freeForm',
      'data.discounts.*.amount' => 'min:0|max:2147483647',
    ];
  }
}
