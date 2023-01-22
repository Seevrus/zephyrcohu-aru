<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MasterKeyUsed extends Mailable
{
    use Queueable, SerializesModels;

    public $company_id;
    public $master_key_id;
    public $user_id;
    public $user_type;
    public $user_phone_number;
    public $user_key_id;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(
        $company_id,
        $master_key_id,
        $user_id,
        $user_type,
        $user_phone_number,
        $user_key_id
    ) {
        $this->company_id = $company_id;
        $this->master_key_id = $master_key_id;
        $this->user_id = $user_id;
        $this->user_type = $user_type === 'I' ? 'Integra' : 'App';
        $this->user_phone_number = $user_phone_number;
        $this->user_key_id = $user_key_id;
    }

    /**
     * Get the message envelope.
     *
     * @return \Illuminate\Mail\Mailables\Envelope
     */
    public function envelope()
    {
        return new Envelope(
            from: new Address('till.zoltan90@gmail.com', 'Dr. Till Zoltán'),
            subject: '[Zephyr Bt.] ÁA mesterkulcsa használatban',
        );
    }

    /**
     * Get the message content definition.
     *
     * @return \Illuminate\Mail\Mailables\Content
     */
    public function content()
    {
        return new Content(
            view: 'emails.masterKeyUsed',
            text: 'emails.masterKeyUsed-text',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array
     */
    public function attachments()
    {
        return [];
    }
}
