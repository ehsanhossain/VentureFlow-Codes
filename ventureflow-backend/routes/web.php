<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return [
        'app' => env('APP_NAME', 'Ventureflow'),
        'version' => env('APP_VERSION', '1.0.0'),
        'developer' => env('APP_DEVELOPER', 'Acquaint Technologies'),
        'laravel' => app()->version(),
    ];
});

require __DIR__.'/auth.php';
