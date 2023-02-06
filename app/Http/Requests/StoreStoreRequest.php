<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StoreStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        if (!Hash::check(request()->header('X-Device-Id'), $this->user()->device_id)) {
            throw new UnauthorizedHttpException(random_bytes(32));
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'data' => 'required|array|bail',
            'data.*.code' => 'required|string|size:4|distinct',
            'data.*.name' => 'required|string|max:255|distinct',
            'data.*.firstAvailableSerialNumber' => 'required|integer|min:1|max:16777215',
            'data.*.lastAvailableSerialNumber' => 'required|integer|min:1|max:16777215|gt:data.*.firstAvailableSerialNumber',
            'data.*.yearCode' => 'required|integer|min:1|max:32767',
            'data.*.items' => 'required|array|bail',
            'data.*.items.*.articleNumber' => 'required|string|exists:items,article_number',
            'data.*.items.*.expirations' => 'required|array|bail',
            'data.*.items.*.expirations.*.expiresAt' => 'required|date_format:Y-m',
            'data.*.items.*.expirations.*.quantity' => 'required|integer|min:1|max:32767',
        ];
    }
}
