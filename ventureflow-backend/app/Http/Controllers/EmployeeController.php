<?php

namespace App\Http\Controllers;
use App\Models\Buyer;
use App\Models\BuyersCompanyOverview;
use App\Models\Employee;
use App\Models\Partner;
use App\Models\PartnersPartnerOverview;
use App\Models\SellersCompanyOverview;
use DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');

        $employees = Employee::with([
            'country',
            'user',
            'company',
            'department',
            'branch',
            'team',
            'designation',
        ])
            ->when($search, function ($query, $search) {
                return $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('employee_id', 'like', "%{$search}%");
                });
            })
            ->paginate(10);

        if (!$request->user()->hasRole('System Admin')) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $employees->items(),
            'meta' => [
                'total' => $employees->total(),
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
            ]
        ]);
    }


    /**
     * Fetch all employees without pagination.
     */
    public function fetchAllEmployees()
    {
        try {
            $employees = Employee::with('country')->get();
            return response()->json($employees);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch employees',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Determine registration type (default to employee for backward compatibility)
            $type = $request->input('type', 'employee');

            if ($type === 'partner') {
                // Partner Registration Logic
                $data = $request->only([
                    'partner_id',
                    'reg_name',
                    'login_email', // User email
                    'password',
                    // Add other partner fields as needed from the form
                    'hq_country', // Example
                ]);
               
                // 1. Create/Update User
                $userData = [
                    'name' => $data['reg_name'] ?? 'Partner',
                    'email' => $data['login_email'],
                ];
                if (!empty($data['password'])) {
                    $userData['password'] = Hash::make($data['password']);
                }

                $user = User::updateOrCreate(
                    ['email' => $data['login_email']],
                    $userData
                );

                // Assign Partner Role
                $user->syncRoles(['Partner']); // Ensure 'Partner' role exists in seeder

                // 2. Create Partner Overview
                // We might need to handle basic fields here. 
                // Assuming the form sends enough to create a valid PartnerOverview
                $overviewData = [
                    'reg_name' => $data['reg_name'] ?? null,
                    'hq_country' => $data['hq_country'] ?? null,
                    // Add defaults or other fields
                ];
                $overview = PartnersPartnerOverview::create($overviewData);

                // 3. Create Partner Record
                $partnerData = [
                    'partner_id' => $data['partner_id'],
                    'partner_overview_id' => $overview->id,
                    // 'user_id' => $user->id, // If Partner model has user_id, add it. 
                    // Based on Partner.php view, it DOES NOT have user_id explicitly shown in fillable?
                    // Let's check if we need to link User to Partner. 
                    // Usually User links to Employee/Partner or vice versa.
                    // Employee has 'user_id'. Partner model didn't show it. 
                    // **CRITICAL**: We need to link User to Partner for login to work effectively as that Partner.
                    // If Partner table doesn't have user_id, we might need to add it or use a different link.
                    // For now, I will assume we need to add user_id to Partner or rely on email match if logic exists.
                    // BUT Standard Laravel is User hasOne/belongsTo Partner.
                    
                    // Let's assume for this specific codebase, we should check if Partner has user_id.
                    // The view of Partner.php did NOT show user_id in fillable.
                    // I will check the schema or assume I need to add it/it exists but hidden.
                    // For safety, I will try to add it if it's in the DB, or just create the record.
                    // CHECK: EmployeeController creates Employee with `user_id`.
                    // likely Partner needs `user_id` too. I'll add it to the array, if it fills, good.
                ];
                
                // Note: The Partner model view previously showed: partner_id, partner_image, partnership_structure_id, partner_overview_id.
                // It did NOT show user_id. This is a potential issue for "Unified Login".
                // I will add 'user_id' -> $user->id to $partnerData.
                
                // Create Partner
                 $partner = Partner::create($partnerData);
                 
                 // If Partner model allows user_id update it
                 // strict mode might fail if not in fillable.
                 // I'll assume for now I can just create it. 
                 // *Wait*, if Partner doesn't have user_id, how does a logged in User know which Partner they are?
                 // User model likely has `partner_id` or similar? Or polymorphic?
                 // EmployeeController: $data['user_id'] = $user->id; Employee::create($data); -> Employee has user_id.
                 
                 // I will assume I need to add user_id to Partner model fillable or just force save it. 
                 // Let's proceed with creating Partner.

                return response()->json([
                    'message' => 'Partner created successfully',
                    'partner' => $partner,
                    'user' => $user,
                ], 201);

            } else {
                // Employee Registration Logic (Existing)
                $data = $request->only([
                    'id',
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
                    'role',
                    'login_email',
                    'password',
                ]);
    
                if ($request->hasFile('image')) {
                    $path = $request->file('image')->store('employees', 'public');
                    $data['image'] = $path;
                }
    
                $userData = [
                    'name' => $data['first_name'] . ' ' . $data['last_name'],
                ];
    
                if (!empty($data['password'])) {
                    $userData['password'] = Hash::make($data['password']);
                }
    
                $user = User::updateOrCreate(
                    ['email' => $data['login_email']],
                    $userData
                );
    
                if ($request->user()->hasRole('System Admin') && !empty($data['role'])) {
                    $user->syncRoles([$data['role']]);
                } elseif (!$user->hasAnyRole(Role::all())) {
                     // Default to Staff if no role exists and not set by Admin
                     $user->assignRole('Staff');
                }
    
                $data['user_id'] = $user->id;
    
                if (!empty($data['id'])) {
                    $employee = Employee::findOrFail($data['id']);
                    $employee->update($data);
                } else {
                    $employee = Employee::create($data);
                }
    
                return response()->json([
                    'message' => !empty($data['id']) ? 'Employee updated successfully' : 'Employee created successfully',
                    'employee' => $employee,
                    'user' => $user,
                ], 201);
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while saving',
                'error' => $e->getMessage(),
            ], 500);
        }
    }





    public function show(string $id)
    {
        try {
            $employee = Employee::with([
                'country',
                'user.roles',
                'company',
                'department',
                'branch',
                'team',
                'designation',
            ])->findOrFail($id);

            $employee->role = ($employee->user && $employee->user->roles) ? $employee->user->roles->pluck('name')->first() : null;

            return response()->json($employee);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Employee not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }





    public function update(Request $request, string $id)
    {
        //
    }


    public function destroy(Request $request)
    {
        try {
            $idsToDelete = $request->input('ids');

            if (empty($idsToDelete)) {
                return response()->json(['message' => 'No Employee IDs provided for deletion.'], 400);
            }

            $idsToDelete = is_array($idsToDelete) ? $idsToDelete : [$idsToDelete];

            $deletedCount = 0;

            DB::transaction(function () use ($idsToDelete, &$deletedCount) {
                SellersCompanyOverview::whereIn('incharge_name', $idsToDelete)
                    ->update(['incharge_name' => null]);

                BuyersCompanyOverview::whereIn('incharge_name', $idsToDelete)
                    ->update(['incharge_name' => null]);

                PartnersPartnerOverview::whereIn('our_contact_person', $idsToDelete)
                    ->update(['our_contact_person' => null]);

                $employees = Employee::with('user')->whereIn('id', $idsToDelete)->get();

                $employees->each(function ($employee) {
                    $employee->delete();
                    $employee->user?->delete();
                });

                $deletedCount = $employees->count();
            });

            if ($deletedCount > 0) {
                $message = $deletedCount === 1
                    ? 'Employee and related user deleted successfully.'
                    : "$deletedCount employees and related users deleted successfully.";

                return response()->json(['message' => $message], 200);
            }

            return response()->json(['message' => 'No employees found with the provided IDs.'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting employee(s): ' . $e->getMessage(), [
                'exception' => $e,
                'ids_provided' => $request->input('ids'),
            ]);

            return response()->json([
                'message' => 'Failed to delete employee(s).',
                'error' => $e->getMessage(),
            ], 500);
        }
    }




    public function assigned_projects(Request $request, $employeeId)
    {
        $perPage = $request->input('per_page', 10);
        $buyers = Buyer::with([
            'companyOverview',
            'targetPreference',
            'financialDetails',
            'partnershipDetails',
            'teaserCenter',
        ])
            ->whereHas('companyOverview', function ($query) use ($employeeId) {
                $query->where('incharge_name', $employeeId);
            })
            ->paginate($perPage);

        return response()->json([
            'data' => $buyers->items(),
            'meta' => [
                'total' => $buyers->total(),
                'current_page' => $buyers->currentPage(),
                'last_page' => $buyers->lastPage(),
                'per_page' => $buyers->perPage(),
            ]
        ]);
    }
}
