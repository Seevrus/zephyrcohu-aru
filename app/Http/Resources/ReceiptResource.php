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
            'driverId' => $this->user_id,
            'driverPhoneNumber' => $this->user->phone_number,
            'roundId' => $this->round_id,
            'clientId' => $this->client_id,
            'receiptNr' => $this->receipt_nr,
            'transactions' => TransactionResource::collection($this->transactions),
            'createdAt' => $this->created_at?->format('Y-m-d H:i:s'),
            'updatedAt' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
