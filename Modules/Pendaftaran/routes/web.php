<?php

use Illuminate\Support\Facades\Route;
use Modules\Pendaftaran\Http\Controllers\PendaftaranController;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('pendaftarans')
    ->name('pendaftaran.')
    ->controller(PendaftaranController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/data', 'data')->name('data');
        Route::post('/data', 'store')->name('store');
        Route::put('/data/{pendaftaran}', 'update')->name('update');
        Route::delete('/data/{pendaftaran}', 'destroy')->name('destroy');
    });
