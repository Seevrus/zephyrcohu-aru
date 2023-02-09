<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
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
            'storeId' => $this->store_id,
            'code' => $this->code,
            'siteCode' => $this->site_code,
            'name' => $this->name,
            'country' => $this->country,
            'postalCode' => $this->postal_code,
            'city' => $this->city,
            'address' => $this->address,
            'vatNumber' => $this->vat_number,
            'iban' => $this->iban,
            'bankAccount' => $this->bank_account,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
            'priceList' => new PriceListResource($this->price_list),
        ];
    }
}
