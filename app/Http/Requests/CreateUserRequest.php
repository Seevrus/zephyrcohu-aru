<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
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
            'code' => 'required|string|size:2|unique:users,code',
            'userName' => 'required|string|unique:users,user_name',
            'name' => 'required|string',
            'phoneNumber' => 'regex:/^\+36[237]0\d{7}/',
            'roles' => 'required|array',
            'roles.*' => 'in:AM,I,A',
        ];
    }
}