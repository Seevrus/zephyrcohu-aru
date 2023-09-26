<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
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
            'type' => $this->type,
            'firstAvailableSerialNumber' => $this->first_available_serial_number,
            'lastAvailableSerialNumber' => $this->last_available_serial_number,
            'yearCode' => $this->year_code,
            'expirations' => new ExpirationPivotCollection($this->whenLoaded('expirations')),
            'user' => new UserResource($this->user),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
