<?php

namespace App\Http\Resources;

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
            'companyCode' => $this->company_code,
            'partnerCode' => $this->partner_code,
            'partnerSiteCode' => $this->partner_site_code,
            'CISerialNumber' => $this->ci_serial_number,
            'CIYearCode' => $this->ci_year_code,
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
            'agent' => [
                'code' => $this->agent_code,
                'name' => $this->agent_name,
                'phoneNumber' => $this->agent_phone_number,
            ],
            'items' => new ReceiptItemCollection($this->receipt_items),
            'quantity' => $this->quantity,
            'netAmount' => $this->net_amount,
            'vatAmount' => $this->vat_amount,
            'grossAmount' => $this->gross_amount,
            'vatAmounts' => new VatAmountCollection($this->vat_amounts),
            'roundAmount' => $this->round_amount,
            'roundedAmount' => $this->rounded_amount,
        ];
    }
}
