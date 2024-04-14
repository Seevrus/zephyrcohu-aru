<?php

namespace App\Http\Controllers;

use App\Http\Resources\StorageReceiptCollection;
use App\Http\Resources\StorageReceiptResource;
use App\Models\Log;
use Carbon\Carbon;
use Exception;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\BadRequestException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

class StorageReceiptController extends Controller
{
    public function view(Request $request, int $id)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $storageReceipt = $sender->company->storageReceipts()->findOrFail($id);

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed storage receipt id ' . $id,
                'occured_at' => Carbon::now(),
            ]);

            return new StorageReceiptResource($storageReceipt);
        } catch (Exception $e) {
            if (
                $e instanceof UnauthorizedHttpException
                || $e instanceof AuthorizationException
                || $e instanceof ModelNotFoundException
            ) {
                throw $e;
            }

            throw new BadRequestException();
        }
    }

    public function view_all(Request $request)
    {
        try {
            $sender = $request->user();
            $sender->last_active = Carbon::now();
            $sender->save();

            $storageReceipts = $sender->company->storageReceipts;

            Log::insert([
                'company_id' => $sender->company_id,
                'user_id' => $sender->id,
                'token_id' => $sender->currentAccessToken()->id,
                'action' => 'Accessed ' . $storageReceipts->count() . ' storage receipts',
                'occured_at' => Carbon::now(),
            ]);

            return new StorageReceiptCollection($storageReceipts);
        } catch (Exception $e) {
            throw new BadRequestException();
        }
    }

    public function remove(Request $request, int $id)
    {
        $sender = $request->user();
        $sender->last_active = Carbon::now();
        $sender->save();

        $storageReceipt = $sender->company->storageReceipts()->findOrFail($id);
        $this->authorize('remove', $storageReceipt);

        $storageReceipt->delete();

        Log::insert([
            'company_id' => $sender->company_id,
            'user_id' => $sender->id,
            'token_id' => $sender->currentAccessToken()->id,
            'action' => 'Removed storage receipt ' . $storageReceipt->id,
            'occured_at' => Carbon::now(),
        ]);
    }
}
