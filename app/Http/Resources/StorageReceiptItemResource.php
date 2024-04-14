<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorageReceiptItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'itemId' => $this->item_id,
            'CNCode' => $this->cn_code,
            'articleNumber' => $this->article_number,
            'expiresAt' => Carbon::createFromFormat('Y-m-d H:i:s', $this->expires_at),
            'startingQuantity' => $this->starting_quantity,
            'quantityChange' => $this->quantity_change,
            'finalQuantity' => $this->final_quantity,
        ];
    }
}
