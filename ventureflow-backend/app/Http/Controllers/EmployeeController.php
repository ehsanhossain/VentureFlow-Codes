<?php

namespace App\Http\Controllers;
use App\Models\Buyer;
use App\Models\BuyersCompanyOverview;
use App\Models\Employee;
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

            if (!empty($data['role'])) {
                $user->syncRoles([$data['role']]);
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while saving the employee',
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
