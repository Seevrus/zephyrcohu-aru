<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StoreDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $items = [];

        foreach ($this->expirations->toArray() as $expiration) {
            $item_id = $expiration['item_id'];
            $tmp_key = '_' . $item_id;
            $article_number = $expiration['item']['article_number'];
            $expires_at = $expiration['expires_at'];
            $quantity = $expiration['pivot']['quantity'];

            if (array_key_exists($tmp_key, $items)) {
                $items[$tmp_key]['expirations'][] = [
                    'expiresAt' => $expires_at,
                    'quantity' => $quantity,
                ];
            } else {
                $items[$tmp_key] = [
                    'id' => $item_id,
                    'articleNumber' => $article_number,
                    'expirations' => [[
                        'expiresAt' => $expires_at,
                        'quantity' => $quantity,
                    ]],
                ];
            }
        }

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'firstAvailableSerialNumber' => $this->first_available_serial_number,
            'lastAvailableSerialNumber' => $this->last_available_serial_number,
            'yearCode' => $this->year_code,
            'items' => array_values($items),
        ];
    }
}
