<?php

namespace App\Filters;

class ReceiptsFilter extends ApiFilter
{
    protected $allowed_params = [
        'id' => ['eq', 'in'],
        'driverId' => ['eq', 'in'],
        'driverPhoneNumber' => ['eq', 'in'],
        'clientId' => ['eq', 'in'],
        'roundId' => ['eq', 'in'],
        'receiptNr' => ['eq', 'lte', 'gte', 'in'],
        'createdAt' => ['lte', 'gte'],
    ];

    protected $column_map = [
        'id' => 'receipts.id',
        'driverId' => 'user_id',
        'driverPhoneNumber' => 'phone_number',
        'clientId' => 'client_id',
        'roundId' => 'round_id',
        'receiptNr' => 'receipt_nr',
        'createdAt' => 'receipts.created_at',
    ];

    protected $operator_map = [
        'eq' => '=',
        'ne' => '<>',
        'in' => 'in',
        'lt' => '<',
        'lte' => '<=',
        'gt' => '>',
        'gte' => '>=',
    ];
}
