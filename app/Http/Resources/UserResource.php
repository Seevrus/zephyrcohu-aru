<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    private $token;

    private $tokenExpiration;

    private $password;

    public function __construct(
        ?User $user,
        $token = null,
        ?string $tokenExpiration = null,
        ?string $password = null
    ) {
        parent::__construct($user);
        $this->token = $token;
        $this->tokenExpiration = $tokenExpiration;
        $this->password = $password;
    }

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
        $isRoundsLoaded = $this->relationLoaded('rounds');
        $round = $isRoundsLoaded ? $this->rounds->last() : null;

        $resource = [
            'id' => $this->id,
            'userName' => $this->user_name,
            'locked' => $this->attempts > 2 ? 1 : 0,
            'state' => $this->state,
            'name' => $this->name,
            'company' => new CompanyResource($this->whenLoaded('company')),
            'phoneNumber' => $this->phone_number,
            'roles' => new UserRoleCollection($this->roles),
            'lastRound' => $isRoundsLoaded ? new RoundResource($round) : null,
            'storeId' => $this->store?->id,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'lastActive' => is_null($this->last_active) ? null : $this->last_active,
        ];

        $token = $this->token ? [
            'token' => [
                'tokenType' => 'Bearer',
                'accessToken' => $this->token->plainTextToken,
                'abilities' => $this->token->accessToken->abilities,
                'expiresAt' => $this->tokenExpiration,
            ],
        ] : [];

        $password = $this->password ? [
            'password' => $this->password,
        ] : [];

        return array_merge($resource, $password, $token);
    }
}
