<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

/**
 * Provedor de serviços para autenticação e autorização.
 * 
 * Este provedor registra as políticas de autorização e configura
 * as funcionalidades de autenticação do Laravel.
 */
class AuthServiceProvider extends ServiceProvider
{
    /**
     * As políticas de autorização da aplicação.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Defina as políticas de autorização aqui
        // Exemplo: 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Registra as políticas de autorização da aplicação.
     */
    public function boot(): void
    {
        // Registra as políticas definidas na propriedade $policies
        $this->registerPolicies();

        // Aqui você pode definir gates de autorização personalizados
        // Exemplo:
        // Gate::define('editar-vaga', function ($user, $job) {
        //     return $user->id === $job->user_id;
        // });
    }
} 