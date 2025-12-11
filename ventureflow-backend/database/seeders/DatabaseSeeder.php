<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        //     'password' => Hash::make('password123'),
        // ]);

        $this->call(CountrySeeder::class);
        // $this->call(EmployeeSeeder::class);
        $this->call(IndustrySeeder::class);
        $this->call(SubIndustrySeeder::class);
        $this->call(CompanySeeder::class);
        $this->call(DesignationSeeder::class);
        $this->call(BranchSeeder::class);
        $this->call(TeamSeeder::class);
        $this->call(DepartmentSeeder::class);
    }
}
