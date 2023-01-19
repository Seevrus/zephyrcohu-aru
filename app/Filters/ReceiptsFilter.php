<?php

namespace App\Filters;

class ReceiptsFilter extends ApiFilter
{
    protected $allowed_params = [
        'id' => ['eq', 'in'],
        'driverId' => ['eq', 'in'],
        'driverPhoneNumber' => ['eq', 'in'],
        'roundId' => ['eq', 'in'],
        'clientId' => ['eq', 'in'],
        'receiptNr' => ['eq', 'lte', 'gte', 'in'],
        'totalAmount' => ['eq', 'lte', 'gte'],
        'createdAt' => ['lte', 'gte'],
        'lastDownloadedAt' => ['lte', 'gte', 'is_null'],
    ];

    protected $column_map = [
        'id' => 'receipts.id',
        'driverId' => 'user_id',
        'driverPhoneNumber' => 'phone_number',
        'clientId' => 'client_id',
        'roundId' => 'round_id',
        'receiptNr' => 'receipt_nr',
        'totalAmount' => 'total_amount',
        'createdAt' => 'receipts.created_at',
        'lastDownloadedAt' => 'receipts.last_downloaded_at',
    ];

    protected $operator_map = [
        'eq' => '=',
        'ne' => '<>',
        'in' => 'in',
        'lte' => '<=',
        'gte' => '>=',
    ];
}
