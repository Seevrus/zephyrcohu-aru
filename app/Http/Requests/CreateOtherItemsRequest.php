<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOtherItemsRequest extends FormRequest
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
      'data.*.articleNumber' => 'required|string|min:1|max:16|distinct|unique:items,article_number',
      'data.*.name' => 'required|string|max:60|distinct',
      'data.*.shortName' => 'required|string|max:10|distinct',
      'data.*.unitName' => 'required|string|max:6',
      'data.*.vatRate' => 'required|string|size:2',
      'data.*.netPrice' => 'required|integer|min:-2147483648|max:2147483647',
    ];
  }
}
