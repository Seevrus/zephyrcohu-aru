<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'phoneNumber' => $this->phone_number,
            'type' => $this->type === 'I' ? 'Integra' : 'App',
            'createdAt' => $this->created_at,
            'lastActive' => $this->last_active,
        ];
    }
}
