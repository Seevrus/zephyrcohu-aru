<?php

namespace App\Console\Commands;

use App\Models\Log;
use Illuminate\Console\Command;

class DeleteOldLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:delete_old_logs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete logs older than 30 days from the logs table';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        Log::where('occured_at', '<', date('Y-m-d H:i:s', time() - 30 * 24 * 60 * 60))
            ->delete();

        return Command::SUCCESS;
    }
}
