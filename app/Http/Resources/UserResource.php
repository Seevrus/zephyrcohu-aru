<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * The "data" wrapper that should be applied.
     *
     * @var string|null
     */
    public static $wrap = null;

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
            'userName' => $this->user_name,
            'locked' => $this->attempts > 2 ? 1 : 0,
            'state' => $this->state,
            'name' => $this->name,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'phoneNumber' => $this->phone_number,
            'roles' => new UserRoleCollection($this->roles),
            'storeId' => $this->store?->id,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'lastActive' => is_null($this->last_active) ? null : Carbon::createFromFormat('Y-m-d H:i:s', $this->last_active),
        ];
    }
}
