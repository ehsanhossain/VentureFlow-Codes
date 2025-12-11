<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class Employee extends Authenticatable
{
    use HasFactory, HasRoles;

    protected $fillable = [
        'first_name',
        'last_name',
        'gender',
        'employee_id',
        'nationality',
        'employee_status',
        'joining_date',
        'dob',
        'work_email',
        'contact_number',
        'company',
        'department',
        'branch',
        'team',
        'designation',
        'user_id',
        'image',
    ];

    // User relationship
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Country (nationality) relationship
    public function country()
    {
        return $this->belongsTo(Country::class, 'nationality');
    }

    // Company relationship
    public function company()
    {
        return $this->belongsTo(Company::class, 'company');
    }

    // Department relationship
    public function department()
    {
        return $this->belongsTo(Department::class, 'department');
    }

    // Branch relationship
    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch');
    }

    // Team relationship
    public function team()
    {
        return $this->belongsTo(Team::class, 'team');
    }

    // Designation relationship
    public function designation()
    {
        return $this->belongsTo(Designation::class, 'designation');
    }
}
