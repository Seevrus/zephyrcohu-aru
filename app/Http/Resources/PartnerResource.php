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
        $partner = [
            'id' => $this->id,
            'storeId' => $this->store_id,
            'code' => $this->code,
            'siteCode' => $this->site_code,
            'name' => $this->name,
            'vatNumber' => $this->vat_number,
            'invoiceType' => $this->invoice_type,
            'invoiceCopies' => $this->invoice_copies,
            'payment_days' => $this->payment_days,
            'iban' => $this->iban,
            'bankAccount' => $this->bank_account,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
            'locations' => new PartnerLocationCollection($this->partner_locations),
            'priceList' => new PriceListItemCollection($this->items),
        ];

        return $partner;
    }
}
