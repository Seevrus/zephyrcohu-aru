<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePartnerRequest extends FormRequest
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
      'data.vatNumber' => 'regex:`^\d{8}-\d{1}-\d{2}$`',
      'data.invoiceType' => 'string|in:E,P',
      'data.invoiceCopies' => 'integer|min:0|max:255',
      'data.paymentDays' => 'integer|min:0|max:255',
      'data.iban' => 'string|size:4',
      'data.bankAccount' => 'string|regex:`^\d{8}-\d{8}(?:(-\d{8}))?$`',
      'data.phoneNumber' => 'nullable|regex:`^\+\d{1,19}$`',
      'data.email' => 'nullable|string|max:70|email:rfc,dns',
      'data.locations' => 'array|min:1|max:2|bail',
      'data.locations.*.name' => 'required|string|max:50',
      'data.locations.*.action' => 'required|in:create,update,delete',
      'data.locations.*.locationType' => 'string|in:C,D',
      'data.locations.*.country' => 'string|size:2',
      'data.locations.*.postalCode' => 'string|max:10',
      'data.locations.*.city' => 'string|max:30',
      'data.locations.*.address' => 'string|max:40',
      'data.priceListId' => 'nullable|exists:price_lists,id',
    ];
  }
}
