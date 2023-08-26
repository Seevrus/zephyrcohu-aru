<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatePriceListRequest extends FormRequest
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
      'data.name' => 'required|string|max:255|unique:price_lists,name',
      'data.items' => 'array|bail',
      'data.items.*.itemId' => 'required|distinct|exists:items,id',
      'data.items.*.netPrice' => 'required|integer|min:0|max:4294967295',
    ];
  }
}
