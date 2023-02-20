<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PartnerLocationResource extends JsonResource
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
            'locationType' => $this->location_type,
            'country' => $this->country,
            'postalCode' => $this->postal_code,
            'city' => $this->city,
            'address' => $this->address,
        ];
    }
}
