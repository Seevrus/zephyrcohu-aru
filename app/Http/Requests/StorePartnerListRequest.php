<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorePartnerListRequest extends FormRequest
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
            'data.*.name' => 'required|string|max:255|distinct',
            'data.*.partners' => 'required|array|bail',
            'data.*.partners.*.code' => 'required_with:data.*.partners.*|string|size:6|exists:partners,code',
            'data.*.partners.*.siteCode' => 'required_with:data.*.partners.*|string|size:4|exists:partners,site_code',
        ];
    }
}
