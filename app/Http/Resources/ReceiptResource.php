<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
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
            'companyId' => $this->company_id,
            'companyCode' => $this->company_code,
            'partnerId' => $this->partner_id,
            'partnerCode' => $this->partner_code,
            'partnerSiteCode' => $this->partner_site_code,
            'serialNumber' => $this->serial_number,
            'yearCode' => $this->year_code,
            'originalCopiesPrinted' => $this->original_copies_printed,
            'vendor' => [
                'name' => $this->vendor_name,
                'country' => $this->vendor_country,
                'postalCode' => $this->vendor_postal_code,
                'city' => $this->vendor_city,
                'address' => $this->vendor_address,
                'felir' => $this->vendor_felir,
                'iban' => $this->vendor_iban,
                'bankAccount' => $this->vendor_bank_account,
                'vatNumber' => $this->vendor_vat_number,
            ],
            'buyer' => [
                'name' => $this->buyer_name,
                'country' => $this->buyer_country,
                'postalCode' => $this->buyer_postal_code,
                'city' => $this->buyer_city,
                'address' => $this->buyer_address,
                'iban' => $this->buyer_iban,
                'bankAccount' => $this->buyer_bank_account,
                'vatNumber' => $this->buyer_vat_number,
                'deliveryName' => $this->buyer_delivery_name,
                'deliveryCountry' => $this->buyer_delivery_country,
                'deliveryPostalCode' => $this->buyer_delivery_postal_code,
                'deliveryCity' => $this->buyer_delivery_city,
                'deliveryAddress' => $this->buyer_delivery_address,
            ],
            'invoiceDate' => $this->invoice_date,
            'fulfillmentDate' => $this->fulfillment_date,
            'invoiceType' => $this->invoice_type,
            'paidDate' => $this->paid_date,
            'user' => [
                'id' => $this->user_id,
                'userName' => $this->user_user_name,
                'name' => $this->user_name,
                'phoneNumber' => $this->user_phone_number,
            ],
            'items' => new ReceiptItemCollection($this->items),
            'otherItems' => new ReceiptOtherItemCollection($this->otherItems),
            'quantity' => $this->quantity,
            'netAmount' => $this->net_amount,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
            'vatAmounts' => new VatAmountCollection($this->vatAmounts),
            'roundAmount' => $this->round_amount,
            'roundedAmount' => $this->rounded_amount,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'lastDownloadedAt' => $this->last_downloaded_at ? Carbon::createFromFormat('Y-m-d H:i:s', $this->last_downloaded_at) : null,
        ];
    }
}
