<?php

namespace App\Console\Commands;

use App\Models\Log;
use App\Models\Round;
use Illuminate\Console\Command;

class DeleteOldRounds extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:delete_old_rounds';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete rounds older than 30 days from the rounds table';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        Log::where('occured_at', '<', date('Y-m-d H:i:s', time() - 30 * 24 * 60 * 60))
            ->delete();

        Round::where('round_finished', '<', date('Y-m-d H:i:s', time() - 30 * 24 * 60 * 60))->delete();

        return Command::SUCCESS;
    }
}
