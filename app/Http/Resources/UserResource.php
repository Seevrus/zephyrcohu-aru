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
            'code' => $this->code,
            'userName' => $this->user_name,
            'name' => $this->name,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'phoneNumber' => $this->phone_number,
            'roles' => new UserRoleCollection($this->roles),
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'lastActive' => Carbon::createFromFormat("Y-m-d H:i:s", $this->last_active),
        ];
    }
}
