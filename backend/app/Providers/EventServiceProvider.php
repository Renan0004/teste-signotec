<?php

namespace App\Providers;

use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

/**
 * Provedor de serviços para eventos e ouvintes.
 * 
 * Este provedor registra os eventos e seus respectivos ouvintes
 * para a aplicação.
 */
class EventServiceProvider extends ServiceProvider
{
    /**
     * Os mapeamentos de eventos para ouvintes da aplicação.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        // Adicione outros eventos e ouvintes aqui
    ];

    /**
     * Registra os eventos para a aplicação.
     */
    public function boot(): void
    {
        // Registra os eventos definidos na propriedade $listen
    }

    /**
     * Determina se os eventos devem ser descobertos automaticamente.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
} 