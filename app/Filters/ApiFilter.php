<?php

namespace App\Filters;

use Exception;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ApiFilter
{
    protected $allowed_params = [];
    protected $column_map = [];
    protected $operator_map = [];

    public function transform(Request $request)
    {
        $where_query = [];
        $where_in_query = [];
        $where_null_query = [];
        $nr_in_queries = 0;

        try {
            foreach ($this->allowed_params as $param => $operators) {
                $query = $request->query($param);

                if (!$query) continue;

                $column = $this->column_map[$param] ?? $param;

                foreach ($operators as $operator) {
                    if (isset($query[$operator])) {
                        if ($operator === 'in') {
                            $nr_in_queries++;

                            if ($nr_in_queries > 1) {
                                throw new UnprocessableEntityHttpException();
                            }

                            $where_in_query = [
                                $column,
                                json_decode($query[$operator]),
                            ];
                        } else if ($operator === 'is_null') {
                            $where_null_query[] = $column;
                        } else {
                            $where_query[] = [
                                $column,
                                $this->operator_map[$operator],
                                $query[$operator],
                            ];
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
