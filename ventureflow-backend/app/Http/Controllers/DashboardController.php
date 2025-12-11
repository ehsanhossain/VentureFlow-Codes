<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use App\Models\Seller;
use App\Models\Buyer;
use Illuminate\Support\Arr;
use App\Models\Partner;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{

    public function getSellerBuyerData()
    {
        $sellers = Seller::with('companyOverview')
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($seller) {
                return [
                    'id' => $seller->id,
                    'image' => $seller->image ?? null,
                    'reg_name' => $seller->companyOverview->reg_name ?? null,
                    'status' => $seller->companyOverview->status ?? null,
                    'type' => 1,
                    'created_at' => $seller->created_at,
                ];
            });

        $buyers = Buyer::with('companyOverview')
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($buyer) {
                return [
                    'id' => $buyer->id,
                    'image' => $buyer->image ?? null,
                    'reg_name' => $buyer->companyOverview->reg_name ?? null,
                    'status' => $buyer->companyOverview->status ?? null,
                    'type' => 2, // Buyer
                    'created_at' => $buyer->created_at,
                ];
            });

        $combined = collect([])
            ->merge($sellers)
            ->merge($buyers)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->map(function ($item) {
                return Arr::except($item, ['created_at']);
            });

        return response()->json($combined);
    }

    public function getCounts()
    {
        $now = Carbon::now();

        $total = [
            'sellers' => Seller::where('status', 1)->count(),
            'buyers' => Buyer::where('status', 1)->count(),
            'partners' => Partner::where('status', 1)->count(),
        ];

        $monthly = [
            'sellers' => Seller::where('status', 1)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count(),

            'buyers' => Buyer::where('status', 1)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count(),

            'partners' => Partner::where('status', 1)
                ->whereYear('created_at', $now->year)
                ->whereMonth('created_at', $now->month)
                ->count(),
        ];

        return response()->json([
            'total' => $total,
            'current_month' => $monthly,
        ]);
    }
}
