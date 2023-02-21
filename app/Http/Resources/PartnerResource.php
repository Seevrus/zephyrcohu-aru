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
            'code' => $this->code,
            'siteCode' => $this->site_code,
            'vatNumber' => $this->vat_number,
            'invoiceType' => $this->invoice_type,
            'invoiceCopies' => $this->invoice_copies,
            'paymentDays' => $this->payment_days,
            'iban' => $this->iban,
            'bankAccount' => $this->bank_account,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
            'locations' => new PartnerLocationCollection($this->partner_locations),
            'priceList' => new PriceListItemCollection($this->items),
            'createdAt' => $this->created_at->toDateTimeString(),
            'updatedAt' => $this->updated_at->toDateTimeString(),
        ];

        return $partner;
    }
}
