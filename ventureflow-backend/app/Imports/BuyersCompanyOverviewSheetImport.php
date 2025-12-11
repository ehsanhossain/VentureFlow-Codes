<?php

namespace App\Imports;

use App\Models\BuyersCompanyOverview;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class BuyersCompanyOverviewSheetImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading, WithValidation
{
    private function parseJsonColumn($value): ?array
    {
        if (is_null($value)) {
            return null;
        }

        $trimmedValue = trim((string)$value);

        if ($trimmedValue === '') {
            return null;
        }

        // Prevent decoding the literal string "undefined" or "null" as a string
        if (strtolower($trimmedValue) === 'undefined' || strtolower($trimmedValue) === 'null') {
            Log::warning('Attempted to parse reserved keyword as JSON. Returning null.', ['value' => $value]);
            return null;
        }

        if (is_array($value)) { // If it's already an array (e.g. from WithCalculatedFormulas)
            return $value;
        }

        $decoded = json_decode($trimmedValue, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        Log::warning('Column value was not valid JSON. Returning null.', [
            'value' => $value,
            'json_error' => json_last_error_msg()
        ]);
        return null;
    }

    public function model(array $row)
    {
        $commaSeparatedToArray = function ($value) {
            if (is_null($value) || trim($value) === '') {
                return [];
            }
            if (is_array($value)) {
                return $value;
            }
            return array_map('trim', explode(',', (string) $value));
        };

        $stringToBoolean = function ($value) {
            if (is_null($value)) return null;
            if (is_bool($value)) return $value;
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        };

        if (empty($row['company_registered_name'])) {
            Log::warning('Skipping row due to empty Company Registered Name.', ['row_data' => $row]);
            return null;
        }




        $ebitdaTimesData = $this->parseJsonColumn($row['ebitda_multiples'] ?? null);

        return new BuyersCompanyOverview([
            'reg_name'                 => $row['company_registered_name'] ?? null,
            'hq_country'               => $row['hq_origin_country'] ?? null,
            'company_type'             => $row['company_type'] ?? null,
            'year_founded'             => $row['year_founded'] ?? null,
            'industry_ops'             => $row['broader_industry_operations'] ?? null,
            'main_industry_operations' => $commaSeparatedToArray($row['main_industry_operations'] ?? null),
            'niche_industry'           => $commaSeparatedToArray($row['niche_priority_industry'] ?? null),
            'emp_count'                => $row['current_employee_counts'] ?? null,
            'reason_ma'                => $row['reason_ma'] ?? null,
            'proj_start_date'          => $this->transformDate($row['project_start_date'] ?? null),
            'txn_timeline'             => $row['expected_transaction_timeline'] ?? null,
            'incharge_name'            => $row['our_person_in_charge'] ?? null,
            'no_pic_needed'            => $stringToBoolean($row['no_pic_needed'] ?? false),
            'status'                   => $row['status'] ?? null,
            'details'                  => $row['details'] ?? null,
            'email'                    => $row['company_s_email'] ?? null,
            'phone'                    => $row['company_s_phone_number'] ?? null,
            'hq_address'               => $this->parseAddress($row['hq_address'] ?? null), // Renamed from parseJsonColumn for clarity
            'shareholder_name'         => $commaSeparatedToArray($row['shareholder_name'] ?? null),
            'seller_contact_name'      => $row['seller_side_contact_person_name'] ?? null,
            'seller_designation'       => $row['designation_position'] ?? null,
            'seller_email'             => $row['email_address'] ?? null,
            'seller_phone'             => $commaSeparatedToArray($row['phone_number'] ?? null),
            'website'                  => $row['website_link'] ?? null,
            'linkedin'                 => $row['linkedin_link'] ?? null,
            'twitter'                  => $row['x_twitter_link'] ?? null,
            'facebook'                 => $row['facebook_link'] ?? null,
            'instagram'                => $row['instagram_link'] ?? null,
            'youtube'                  => $row['youtube_link'] ?? null,
            'ebitda_times'             => $ebitdaTimesData, // Assign parsed data
        ]);
    }

    public function batchSize(): int
    {
        return 500;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function rules(): array
    {
        return [
            'company_registered_name'       => 'required|string|max:255',
            'hq_origin_country'             => 'nullable|string|max:100',
            'company_type'                  => 'nullable|string|max:100',
            'year_founded'                  => 'nullable|digits:4|integer|min:1000|max:' . date('Y'),
            'broader_industry_operations'   => 'nullable|string|max:255',
            'main_industry_operations'      => 'nullable|string',
            'niche_priority_industry'       => 'nullable|string',
            'current_employee_counts'       => 'nullable',
            'reason_ma'                     => 'nullable|string',
            'project_start_date'            => 'nullable',
            'expected_transaction_timeline' => 'nullable|string',
            'our_person_in_charge'          => 'nullable|string|max:100',
            'no_pic_needed'                 => 'nullable',
            'status'                        => 'nullable|string|max:50',
            'details'                       => 'nullable|string',
            'company_s_email'               => 'nullable|email|max:150',
            'company_s_phone_number'        => 'nullable|string|max:50',
            'hq_address'                    => 'nullable|string', // Validated as string, parsed in model()
            'shareholder_name'              => 'nullable|string',
            'seller_side_contact_person_name' => 'nullable|string|max:100',
            'designation_position'          => 'nullable|string|max:100',
            'email_address'                 => 'nullable|email|max:150',
            'phone_number'                  => 'nullable|string',
            'website_link'                  => 'nullable|url|max:255',
            'linkedin_link'                 => 'nullable|url|max:255',
            'x_twitter_link'                => 'nullable|url|max:255',
            'facebook_link'                 => 'nullable|url|max:255',
            'instagram_link'                => 'nullable|url|max:255',
            'youtube_link'                  => 'nullable|url|max:255',
            'seller_id'                     => 'nullable',
            'seller_image'                  => 'nullable|string',
            'profile_picture'               => 'nullable|string',
            'ebitda_multiples'              => 'nullable|string', // Add validation for the Excel column
        ];
    }

    public function customValidationMessages()
    {
        return [
            'company_registered_name.required' => 'The "Company Registered Name" is required for each company.',
            'company_s_email.email' => 'The "Company’s Email" is not a valid email address.',
            'email_address.email' => 'The seller "Email Address" is not a valid email address.',
            'year_founded.digits' => 'The "Year Founded" must be a 4-digit year.',
            'website_link.url' => 'The "Website Link" must be a valid URL.',
        ];
    }

    private function transformDate($value): ?string
    {
        if (empty($value)) {
            return null;
        }
        try {
            if (is_numeric($value) && $value > 25569 && $value < 60000) { // Basic check for Excel date numbers
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            return \Carbon\Carbon::parse((string) $value)->format('Y-m-d');
        } catch (\Exception $e) {
            Log::warning("Failed to parse date: " . $value . " - " . $e->getMessage());
            return null;
        }
    }

    private function parseAddress($value): array // Specific for hq_address which expects an array with a fallback
    {
        if (is_null($value) || trim((string)$value) === '') {
            return []; // Return empty array for empty/null input for hq_address
        }

        $trimmedValue = trim((string)$value);
        if (strtolower($trimmedValue) === 'undefined' || strtolower($trimmedValue) === 'null') {
             Log::warning('Attempted to parse reserved keyword as JSON for hq_address. Returning empty array.', ['value' => $value]);
            return [];
        }

        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode($trimmedValue, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        Log::warning('HQ Address was not valid JSON. Storing as string in fallback structure.', ['value' => $value]);
        return ['full_address_string' => $trimmedValue];
    }
}
