<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StartRoundRequest extends FormRequest
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
            'agentCode' => 'required|string|size:2',
            'agentName' => 'required|string|max:50',
            'storeCode' => 'required|string|size:4',
            'storeName' => 'required|string|max:255',
            'partnerListId' => 'required|integer|min:0',
            'partnerListName' => 'required|string|max:255',
            'roundAt' => 'required|date_format:Y-m-d',
        ];
    }
}
