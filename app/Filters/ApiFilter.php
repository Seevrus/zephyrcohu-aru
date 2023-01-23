<?php

namespace App\Filters;

use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ApiFilter
{
    protected $operator_map = [
        'eq' => '=',
        'is' => 'is',
        'ne' => '<>',
        'in' => 'in',
        'lte' => '<=',
        'gte' => '>=',
    ];

    protected $allowed_params = [];
    protected $column_map = [];

    public function transform(Request $request)
    {
        $where_query = [];
        $where_in_query = [];
        $where_null_query = [];
        $nr_in_queries = 0;

        try {
            $filters = $request->filters ?? [];

            foreach ($filters as $filter) {
                if (array_key_exists($filter['key'], $this->allowed_params)) {
                    foreach ($this->allowed_params[$filter['key']] as $operator) {
                        if ($filter['operator'] === $operator) {
                            if ($filter['operator'] === 'in') {
                                $nr_in_queries++;

                                if ($nr_in_queries > 1) {
                                    throw new UnprocessableEntityHttpException();
                                }

                                $where_in_query = [
                                    $this->column_map[$filter['key']],
                                    $filter['value'],
                                ];
                            } else if ($filter['operator'] === 'is' && $filter['value'] === null) {
                                $where_null_query[] = $this->column_map[$filter['key']];
                            } else {
                                $where_query[] = [
                                    $this->column_map[$filter['key']],
                                    $this->operator_map[$filter['operator']],
                                    $filter['value'],
                                ];
                            }
                        }
                    }
                }
            }

            return [
                'where_query' => $where_query,
                'where_in_query' => $where_in_query,
                'where_null_query' => $where_null_query,
            ];
        } catch (Exception $e) {
            throw new UnprocessableEntityHttpException();
        }
    }
}
