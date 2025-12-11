<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($credentials, true)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'role' => $user->getRoleNames()->first(),
            'token' => $token
        ]);
    }

    public function user(Request $request) {
        $user = $request->user();
        $employee = \App\Models\Employee::where('user_id', $user->id)->first();
        return response()->json([
            'user' => $user,
            'role' => $user->getRoleNames()->first(),
            'employee' => $employee
        ]);
    }

    public function logout(Request $request)
    {

        if ($request->bearerToken()) {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Logged out successfully (Token Revoked)']);
        }


        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully (Session Ended)']);
    }
}
