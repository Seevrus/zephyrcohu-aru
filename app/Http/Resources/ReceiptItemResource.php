<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->item_id,
            'code' => $this->code,
            'CNCode' => $this->cn_code,
            'articleNumber' => $this->article_number,
            'expiresAt' => Carbon::createFromFormat('Y-m-d H:i:s', $this->expires_at),
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unitName' => $this->unit_name,
            'discountName' => $this->discount_name,
            'netPrice' => $this->net_price,
            'netAmount' => $this->net_amount,
            'vatRate' => $this->vat_rate,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
        ];
    }
}
