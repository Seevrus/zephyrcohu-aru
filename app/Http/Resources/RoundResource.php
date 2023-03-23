<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RoundResource extends JsonResource
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
            'roundId' => $this->id,
            'agentCode' => $this->agent_code,
            'agentName' => $this->agent_name,
            'storeCode' => $this->store_code,
            'storeName' => $this->store_name,
            'roundAt' => $this->round_at,
            'lastSerialNumber' => $this->last_serial_number,
            'yearCode' => $this->year_code,
            'createdAt' => $this->created_at->toDateTimeString(),
            'updatedAt' => $this->updated_at->toDateTimeString(),
        ];
    }
}
