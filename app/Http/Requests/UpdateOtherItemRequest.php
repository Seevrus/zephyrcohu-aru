<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOtherItemRequest extends FormRequest
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
      'data.name' => 'string|max:60',
      'data.shortName' => 'string|max:10',
      'data.unitName' => 'string|max:6',
      'data.vatRate' => 'string|size:2',
      'data.netPrice' => 'integer|min:-2147483648|max:2147483647',
    ];
  }
}
