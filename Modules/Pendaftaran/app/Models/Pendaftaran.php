<?php

namespace Modules\Pendaftaran\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Pendaftaran\Database\Factories\PendaftaranFactory;

#[UseFactory(PendaftaranFactory::class)]
#[Fillable(['name', 'email', 'phone'])]
class Pendaftaran extends Model
{
    /**
     * @property int $id
     * @property string $name
     * @property string $email
     * @property string $phone
     */

    /** @use HasFactory<PendaftaranFactory> */
    use HasFactory;
}
