<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class VatAmountResource extends JsonResource
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
            'vatRate' => $this->vat_rate,
            'netAmount' => $this->net_amount,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
        ];
    }
}
