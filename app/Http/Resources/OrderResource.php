<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'partnerId' => $this->partner->id,
            'orderedAt' => Carbon::createFromFormat('Y-m-d H:i:s', $this->ordered_at),
            'items' => new OrderItemCollection($this->orderItems),
        ];
    }
}
