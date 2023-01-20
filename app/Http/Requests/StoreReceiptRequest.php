<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReceiptRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // User needs to be authenticated by sanctum to reach this point, so no other authorization needed
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
            'roundId' => 'required|integer|min:1',
            'clientId' => 'required|integer|min:1',
            'receiptNr' => 'required|regex:`^\d{5}[/]\d{2}$`|unique:receipts,receipt_nr',
            'transactions' => 'required|array',
            'transactions.*.productId' => 'required|regex:`\d{13}`',
            'transactions.*.purchases' => 'required|array',
            'transactions.*.purchases.*.expiresAt' => 'required|date_format:Y-m-d',
            'transactions.*.purchases.*.quantity' => 'required|integer',
            'transactions.*.purchases.*.itemAmount' => 'required|integer',
            'totalAmount' => 'required|integer|min:1',
            'createdAt' => 'required|date_format:Y-m-d H:i:s',
        ];
    }
}
