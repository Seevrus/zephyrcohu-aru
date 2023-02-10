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
            'createdAt' => $this->created_at,
            'orderItems' => array_map(function ($orderItem) {
                return [
                    'articleNumber' => $orderItem['article_number'],
                    'quantity' => $orderItem['pivot']['quantity'],
                ];
            }, $this->items->toArray()),
        ];
    }
}
