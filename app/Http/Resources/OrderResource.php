<?php

namespace App\Http\Resources;

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
            'partnerCode' => $this->partner->code,
            'partnerSiteCode' => $this->partner->site_code,
            'orderDate' => $this->order_date,
            'items' => new OrderItemCollection($this->order_items),
        ];
    }
}
