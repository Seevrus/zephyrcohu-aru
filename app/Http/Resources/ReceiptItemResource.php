<?php

namespace App\Http\Resources;

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
            'code' => $this->code,
            'CNCode' => $this->cn_code,
            'articleNumber' => $this->article_number,
            'expiresAt' => date('Y-m', strtotime($this->expires_at)),
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unitName' => $this->unit_name,
            'netPrice' => $this->net_price,
            'netAmount' => $this->net_amount,
            'vatRate' => $this->vat_rate,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
        ];
    }
}
