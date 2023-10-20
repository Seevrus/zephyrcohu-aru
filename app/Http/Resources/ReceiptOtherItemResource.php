<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptOtherItemResource extends JsonResource
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
            'articleNumber' => $this->article_number,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unitName' => $this->unit_name,
            'netPrice' => $this->net_price,
            'netAmount' => $this->net_amount,
            'vatRate' => $this->vat_rate,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
            'comment' => $this->comment,
        ];
    }
}
