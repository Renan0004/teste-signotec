<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;
use App\Models\Candidate;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuário admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        // Criar 10 vagas
        $jobs = Job::factory(10)->create();

        // Criar 20 candidatos
        $candidates = Candidate::factory(20)->create();

        // Criar um currículo de exemplo e associar a alguns candidatos
        $samplePdfPath = storage_path('app/public/sample_resume.pdf');
        if (!File::exists($samplePdfPath)) {
            // Criar diretório se não existir
            File::makeDirectory(storage_path('app/public'), 0755, true, true);
            
            // Criar um PDF simples com FPDF
            require_once base_path('vendor/setasign/fpdf/fpdf.php');
            $pdf = new \FPDF();
            $pdf->AddPage();
            $pdf->SetFont('Arial', 'B', 16);
            $pdf->Cell(40, 10, 'Curriculo de Exemplo');
            $pdf->Ln();
            $pdf->SetFont('Arial', '', 12);
            $pdf->MultiCell(0, 10, 'Este é um currículo de exemplo para teste do sistema.');
            $pdf->Output('F', $samplePdfPath);
        }

        // Associar o currículo a alguns candidatos
        foreach ($candidates as $candidate) {
            if (rand(0, 1)) { // 50% de chance de ter currículo
                $newPath = 'resumes/' . uniqid() . '.pdf';
                Storage::disk('public')->copy('sample_resume.pdf', $newPath);
                $candidate->update(['resume_path' => $newPath]);
            }

            // Associar candidatos a algumas vagas aleatoriamente
            $randomJobs = $jobs->random(rand(1, 3));
            foreach ($randomJobs as $job) {
                $candidate->jobs()->attach($job->id, [
                    'status' => ['pending', 'reviewing', 'approved', 'rejected'][rand(0, 3)],
                    'notes' => rand(0, 1) ? 'Algumas observações sobre o candidato...' : null
                ]);
            }
        }
    }
}
