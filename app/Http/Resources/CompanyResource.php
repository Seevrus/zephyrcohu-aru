<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CompanyResource extends JsonResource
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
            'code' => $this->code,
            'name' => $this->name,
            'country' => $this->country,
            'postalCode' => $this->postal_code,
            'city' => $this->city,
            'address' => $this->address,
            'felir' => $this->felir,
            'vatNumber' => $this->vat_number,
            'iban' => $this->iban,
            'bankAccount' => $this->bank_account,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
        ];
    }
}
