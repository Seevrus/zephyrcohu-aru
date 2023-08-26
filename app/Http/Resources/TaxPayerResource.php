<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxPayerResource extends JsonResource
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
            'infoDate' => @$this->infoDate,
            'validity' => @$this->taxpayerValidity === 'true',
            'name' => @$this->taxpayerData?->taxpayerName,
            'shortName' => @$this->taxpayerData?->taxpayerShortName,
            'taxNumber' => @$this->taxpayerData?->vatGroupMembership
                ? @$this->taxpayerData?->vatGroupMembership.'-'. 5 .'-'.@$this->taxpayerData?->taxNumberDetail->countyCode
                : implode('-', array_values((array) @$this->taxpayerData?->taxNumberDetail)),
            'addressList' => @$this->taxpayerData?->taxpayerAddressList?->taxpayerAddressItem,
        ];
    }
}
