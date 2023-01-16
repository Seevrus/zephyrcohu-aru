<?php

namespace App\Http\Traits;

trait ErrorHandling
{
    public function unathorized()
    {
        $response = [
            'status' => 401,
            'codeName' => 'Unathorized',
            'message' => 'The client must authenticate itself to get the requested response.'
        ];

        return response($response, 401);
    }

    public function forbidden()
    {
        $response = [
            'status' => 403,
            'codeName' => 'Forbidden',
            'message' => 'The client does not have access rights to the content.'
        ];

        return response($response, 403);
    }

    public function not_found()
    {
        $response = [
            'status' => 404,
            'codeName' => 'Not Found',
            'message' => 'The server cannot find the requested resource.'
        ];

        return response($response, 404);
    }

    public function method_not_allowed()
    {
        $response = [
            'status' => 405,
            'codeName' => 'Method Not Allowed',
            'message' => 'The request method is known by the server but is not supported by the target resource.'
        ];

        return response($response, 405);
    }

    public function unsupported_media_type()
    {
        $response = [
            'status' => 415,
            'codeName' => 'Unsupported Media Type',
            'message' => 'The request is not JSON, or not well formatted.'
        ];

        return response($response, 415);
    }

    public function internal_Server_error()
    {
        $response = [
            'status' => 500,
            'codeName' => 'Internal Server Error',
            'message' => 'The server has encountered a situation it does not know how to handle.'
        ];

        return response($response, 500);
    }
}
