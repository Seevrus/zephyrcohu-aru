<?php

namespace App\Filters;

class UsersFilter extends ApiFilter
{
  protected $allowed_params = [
    'id' => ['eq', 'in'],
    'phoneNumber' => ['eq', 'in'],
    'type' => ['eq', 'in'],
    'createdAt' => ['lte', 'gte'],
    'lastActive' => ['lte', 'gte'],
  ];

  protected $column_map = [
    'id' => 'id',
    'phoneNumber' => 'phone_number',
    'type' => 'type',
    'createdAt' => 'created_at',
    'lastActive' => 'last_active',
  ];
}
