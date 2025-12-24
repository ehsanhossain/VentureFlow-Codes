<?php

namespace App\Http\Controllers;
use App\Models\Buyer;
use Carbon\Carbon;
use App\Models\Seller;
use App\Models\Partner;
use App\Models\FileFolder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PartnersPartnerOverview;
use Illuminate\Support\Facades\Validator;
use App\Models\PartnersPartnershipStructure;
class PartnerController extends Controller
{



    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $country = $request->input('country');
        $registeredAfter = $request->input('registered_after');
        $structure = $request->input('structure');
        $status = $request->input('status');

        $statusValue = null;
        if ($status !== null) {
            $statusValue = $status == 1 ? '1' : '0';
        }

        $partners = Partner::with(['partnerOverview', 'partnershipStructure'])
            ->when($search, function ($query) use ($search) {
                $query->whereHas('partnerOverview', function ($q) use ($search) {
                    $q->where('reg_name', 'like', "%{$search}%");
                });
            })
            ->when($country, function ($query) use ($country) {
                $query->whereHas('partnerOverview', function ($q) use ($country) {
                    $q->where('hq_country', $country);
                });
            })
            ->when($registeredAfter, function ($query) use ($registeredAfter) {
                $date = Carbon::createFromFormat('Y-m-d', $registeredAfter, 'Asia/Dhaka')
                    ->endOfDay()
                    ->setTimezone('UTC');

                $query->where('created_at', '<=', $date);
            })
            ->when($structure || $statusValue !== null, function ($query) use ($structure, $statusValue) {
                $query->whereHas('partnershipStructure', function ($q) use ($structure, $statusValue) {
                    if ($structure) {
                        $q->where('partnership_structure', $structure);
                    }
                    if ($statusValue !== null) {
                        $q->where('status', $statusValue);
                    }
                });
            })
            ->paginate(10);

        return response()->json([
            'data' => $partners->items(),
            'meta' => [
                'total' => $partners->total(),
                'current_page' => $partners->currentPage(),
                'last_page' => $partners->lastPage(),
                'per_page' => $partners->perPage(),
            ],
        ]);
    }





    public function fetchPartner(Request $request)
    {
        $partners = Partner::with('partnerOverview') // Ensure the relationship is loaded
            ->get()
            ->map(function ($partner) {
                return [
                    'id' => $partner->id,
                    'name' => $partner->partnerOverview->reg_name, // Access reg_name from partnerOverview
                    'logo_url' => $partner->partner_image,
                ];
            });

        return response()->json($partners);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    public function partnerOverviewsStore(Request $request)
    {
        $partner = Partner::find($request->partner);
        $data = $request->all();

        // Decode JSON strings for array/object fields
        $jsonFields = [
            'hq_address',
            'contact_person_phone',
            'main_countries',
            'niche_industry',
            'shareholder_name',
        ];

        foreach ($jsonFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $decodedData = json_decode($data[$field], true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $data[$field] = $decodedData;
                } else {
                    Log::error("Failed to decode JSON for field: {$field}", ['value' => $data[$field]]);
                }
            }
        }

        // Parse the year_founded string into a year
        if (isset($data['year_founded']) && is_string($data['year_founded'])) {
            try {
                $data['year_founded'] = Carbon::createFromFormat('D M d Y H:i:s e+', $data['year_founded'])->year;
            } catch (\Exception $e) {
                Log::error("Failed to parse year_founded", ['value' => $data['year_founded'], 'error' => $e->getMessage()]);
                $data['year_founded'] = null;
            }
        } else {
            $data['year_founded'] = null;
        }

        // Handle partner image
        if ($request->hasFile('partner_image')) {
            $file = $request->file('partner_image');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('partners', $filename, 'public');
            $data['partner_image'] = '/storage/' . $path;
        }

        try {
            // Check if partner exists
            if ($partner) {
                // Update or create overview
                if ($partner->partner_overview_id) {
                    $overview = PartnersPartnerOverview::find($partner->partner_overview_id);
                    $overview->update($data);
                    $partner->partner_id = $data['partner_id'] ?? $partner->partner_id;
                    $partner->partner_image = $data['partner_image'] ?? $partner->partner_image;
                } else {
                    $overview = PartnersPartnerOverview::create($data);
                    $partner->partner_overview_id = $overview->id;
                    $partner->partner_id = $data['partner_id'] ?? $partner->partner_id;
                    $partner->partner_image = $data['partner_image'] ?? $partner->partner_image;
                }

                // Update partner fields
                $partner->partner_image = $data['partner_image'] ?? $partner->partner_image;
                $partner->save();
            } else {
                // Create new overview and partner
                $overview = PartnersPartnerOverview::create($data);
                $partner = Partner::create([
                    'partner_id' => $data['partner_id'],
                    'partner_image' => $data['partner_image'] ?? null,
                    'partner_overview_id' => $overview->id,
                ]);
            }

            return response()->json([
                'message' => 'Partner overview saved successfully',
                'data' => $partner->id,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error storing/updating partner overview: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'Failed to save partner overview',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function partnerOverviewShow($id)
    {
        $partner = Partner::findOrFail($id);

        $overview = PartnersPartnerOverview::findOrFail($partner->partner_overview_id);
        $overview->partner_id = $partner->partner_id;

        return response()->json([
            'success' => true,
            'data' => $overview,
        ]);
    }

    public function partnerStructureShow($id)
    {
        $partner = Partner::findOrFail($id);

        $structure = PartnersPartnershipStructure::findOrFail($partner->partnership_structure_id);
        $structure->partner_id = $partner->partner_id;

        return response()->json([
            'success' => true,
            'data' => $structure,
        ]);
    }

    public function partnerPartnershipStructuresStore(Request $request)
    {
        try {
            $partner = Partner::find($request->input('partner_id'));

            if (!$partner) {
                return response()->json(['message' => 'Partner not found'], 404);
            }

            // Determine if we are updating or creating
            if ($partner->partnership_structure_id) {
                $partnershipStructure = PartnersPartnershipStructure::find($partner->partnership_structure_id);

                if (!$partnershipStructure) {
                    // If ID exists but record doesn't, create new
                    $partnershipStructure = new PartnersPartnershipStructure();
                }
            } else {
                $partnershipStructure = new PartnersPartnershipStructure();
            }

            // Fill data
            $partnershipStructure->partnership_structure = $request->input('partnership_structure');
            $partnershipStructure->commission_criteria = $request->input('commission_criteria');
            $partnershipStructure->status = $request->input('status');
            $partnershipStructure->mou_status = $request->input('mou_status');
            $partnershipStructure->partnership_coverage_range = $request->input('partnership_coverage_range');
            $partnershipStructure->save();

            // Link to partner if new
            if (!$partner->partnership_structure_id) {
                $partner->partnership_structure_id = $partnershipStructure->id;
                $partner->save();
            }

            return response()->json([
                'message' => 'Partner Partnership Structure saved successfully',
                'data' => $partner->id,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error saving partner partnership structure: ' . $e->getMessage(), ['exception' => $e]);

            return response()->json([
                'message' => 'Failed to save Partner Partnership Structure',
                'error' => 'An unexpected error occurred.',
            ], 500);
        }
    }


    /**
     * Display the specified resource.
     */

    public function show(Partner $partner)
    {
        $partner->load(['partnerOverview', 'partnershipStructure']);
        return response()->json([
            'success' => true,
            'data' => $partner,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */

    public function edit(Partner $partner)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, Partner $partner)
    {
        //
    }

    public function destroy(Request $request)
    {
        try {
            $idsToDelete = $request->input('ids');

            if (empty($idsToDelete)) {
                return response()->json([
                    'message' => 'No Partner IDs provided for deletion.'
                ], 400);
            }

            if (!is_array($idsToDelete)) {
                $idsToDelete = [$idsToDelete];
            }

            $deletedCount = 0;

            DB::transaction(function () use ($idsToDelete, &$deletedCount) {
                FileFolder::whereIn('partner_id', $idsToDelete)->delete();
                $deletedCount = Partner::destroy($idsToDelete);
            });

            if ($deletedCount > 0) {
                $message = $deletedCount === 1
                    ? 'Partner and related associations deleted successfully.'
                    : $deletedCount . ' partners and related associations deleted successfully.';

                return response()->json([
                    'message' => $message
                ], 200);
            }

            return response()->json([
                'message' => 'No partners found with the provided IDs.'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting partner(s): ' . $e->getMessage(), [
                'exception' => $e,
                'ids_provided' => $request->input('ids')
            ]);

            return response()->json([
                'message' => 'Failed to delete partner(s).',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function getLastSequence(Request $request)
    {
        $countryAlpha = strtoupper($request->input('country'));
        $prefix = $countryAlpha . '-P-';

        try {
            $lastPartner = Partner::where('partner_id', 'LIKE', $prefix . '%')
                ->select('partner_id')
                ->get()
                ->map(function ($item) use ($prefix) {
                    $numericPart = str_replace($prefix, '', $item->partner_id);
                    return (int) $numericPart;
                })
                ->max();

            $lastSequence = $lastPartner ? $lastPartner : 0;

            return response()->json(['lastSequence' => $lastSequence]);
        } catch (\Exception $e) {
            \Log::error("Error fetching last sequence for partner in country {$countryAlpha}: " . $e->getMessage());
            return response()->json(['error' => 'Could not retrieve sequence number for partner.'], 500);
        }
    }

    public function sharedSellers(Partner $partner): JsonResponse
    {
        $sellers = Seller::with([
            'companyOverview',
            'financialDetails',
            'partnershipDetails',
            'teaserCenter',
        ])
            ->whereHas('partnershipDetails', function ($query) use ($partner) {
                $query->where('partner', $partner->id);
            })
            ->get()
            ->map(function ($seller) {
                $overview = $seller->companyOverview;
                return [
                    'id' => $seller->id,
                    // return safe teaser data
                    'teaser_overview' => [
                        'hq_country' => $overview->hq_country ?? null,
                        'industry_ops' => $overview->industry_ops ?? null,
                        'niche_industry' => $overview->niche_industry ?? null,
                        'year_founded' => $overview->year_founded ?? null,
                        'emp_total' => $overview->emp_total ?? null,
                        'reason_ma' => $overview->reason_ma ?? null,
                        'txn_timeline' => $overview->txn_timeline ?? null,
                        'status' => $overview->status ?? null,
                        // HIDDEN: reg_name, contact info, etc.
                    ],
                    'financial_details' => $seller->financialDetails, // Assuming safe
                    'teaser_center' => $seller->teaserCenter,
                    // 'partnership_details' => $seller->partnershipDetails, // Maybe needed?
                ];
            });

        return response()->json([
            'data' => $sellers,
            'count' => $sellers->count(),
        ]);
    }

    public function sharedBuyers(Partner $partner): JsonResponse
    {
        $buyers = Buyer::with([
            'companyOverview',
            'targetPreference',
            'financialDetails',
            'partnershipDetails',
            'teaserCenter',
        ])
            ->whereHas('partnershipDetails', function ($query) use ($partner) {
                $query->where('partner', $partner->id);
            })
            ->get()
            ->map(function ($buyer) {
                $overview = $buyer->companyOverview;
                return [
                    'id' => $buyer->id,
                    'teaser_overview' => [
                        'hq_country' => $overview->hq_country ?? null,
                         // Buyer overview fields might differ slightly
                        'company_type' => $overview->company_type ?? null,
                        'year_founded' => $overview->year_founded ?? null,
                        'main_industry_operations' => $overview->main_industry_operations ?? null,
                        'emp_count' => $overview->emp_count ?? null,
                        'reason_ma' => $overview->reason_ma ?? null,
                        'txn_timeline' => $overview->txn_timeline ?? null,
                    ],
                    'target_preference' => $buyer->targetPreference,
                    'financial_details' => $buyer->financialDetails,
                    'teaser_center' => $buyer->teaserCenter,
                ];
            });

        return response()->json([
            'data' => $buyers,
            'count' => $buyers->count(),
        ]);
    }
}
