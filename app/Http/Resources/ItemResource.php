<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
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
            'id' => $this->id,
            'CNCode' => $this->cn_code,
            'articleNumber' => $this->article_number,
            'name' => $this->name,
            'shortName' => $this->short_name,
            'category' => $this->category,
            'unitName' => $this->unit_name,
            'productCatalogCode' => $this->product_catalog_code,
            'vatRate' => $this->vat_rate,
            'netPrice' => $this->net_price,
            'expirations' => new ExpirationCollection($this->expirations),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
