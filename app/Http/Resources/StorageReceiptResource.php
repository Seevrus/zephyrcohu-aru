<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StorageReceiptResource extends JsonResource
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
            'user' => [
                'id' => $this->user_id,
                'userName' => $this->user_user_name,
                'name' => $this->user_name,
                'phoneNumber' => $this->user_phone_number,
            ],
            'items' => new StorageReceiptItemCollection($this->items),
        ];
    }
}
