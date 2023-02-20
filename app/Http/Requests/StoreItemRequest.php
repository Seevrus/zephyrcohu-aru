<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StoreItemRequest extends FormRequest
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
            'data.*.CNCode' => 'required|string|size:6',
            'data.*.articleNumber' => 'required|string|size:16|distinct',
            'data.*.name' => 'required|string|max:60|distinct',
            'data.*.shortName' => 'required|string|max:10|distinct',
            'data.*.category' => 'required|string|max:20',
            'data.*.unitName' => 'required|string|max:6',
            'data.*.productCatalogCode' => 'required|string|size:11|distinct',
            'data.*.vatRate' => 'required|string|size:2',
            'data.*.netPrice' => 'required|numeric|min:0',
        ];
    }
}
