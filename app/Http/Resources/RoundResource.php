<?php

namespace App\Http\Resources;

use Carbon\Carbon;
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
            'id' => $this->id,
            'userId' => $this->user_id,
            'storeId' => $this->store_id,
            'partnerListId' => $this->partner_list_id,
            'lastSerialNumber' => $this->last_serial_number,
            'yearCode' => $this->year_code,
            'roundStarted' => Carbon::createFromDate($this->round_started),
            'roundFinished' => $this->round_finished ? Carbon::createFromDate($this->round_finished) : null,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
