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
        $items = [];

        foreach ($this->expirations as $expiration) {
            $item_id = $expiration['stock_item']['item_id'];

            if (array_key_exists($item_id, $items)) {
                array_push($items[$item_id]['expirations'], [
                    'expiresAt' => $expiration['expires_at'],
                    'quantity' => $expiration['pivot']['quantity'],
                    'itemAmount' => $expiration['pivot']['item_amount'],
                ]);
            } else {
                $items[$item_id] = [
                    'articleNumber' => $expiration['stock_item']['item']['article_number'],
                    'expirations' => [[
                        'expiresAt' => $expiration['expires_at'],
                        'quantity' => $expiration['pivot']['quantity'],
                        'itemAmount' => $expiration['pivot']['item_amount'],
                    ]],
                ];
            }
        }

        return [
            'serialNumber' => $this->serial_number,
            'yearCode' => $this->year_code,
            'partnerCode' => $this->partner->code,
            'partnerSiteCode' => $this->partner->site_code,
            'totalAmount' => $this->total_amount,
            'createdAt' => $this->created_at,
            'lastDownloadedAt' => $this->last_downloaded_at,
            'items' => array_values($items),
        ];
    }
}
