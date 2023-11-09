<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinishRoundRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
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
            'data' => 'required|array',
            'data.roundId' => 'required|integer|min:0|exists:rounds,id',
            'data.lastSerialNumber' => 'required|integer|min:0|max:16777215',
            'data.yearCode' => 'required|integer|min:0|max:32767',
        ];
    }
}
