import React, { useState, useEffect } from 'react';
import Label from '../../../components/Label';
import { Input } from '../../../components/Input';
import { useForm, Controller } from 'react-hook-form';
import SelectPicker from '../../../components/SelectPicker';
import DatePicker from '../../../components/DatePicker';
import { Country } from '../components/Dropdown';
import { Dropdown } from '../components/Dropdown';
import { Frontend } from '..//frontend/Frontend';
import { Industry, IndustryDropdown } from '../components/IndustryDropdown';
import { useNavigate, useParams } from 'react-router-dom';
import { useWatch } from 'react-hook-form';
import api from '../../../config/api';
import axios from 'axios';
import { ApproxInput } from '../../../components/ApproxInput';
import { showAlert } from '../../../components/Alert';
import { TextArea } from '../../../components/textarea/TextArea';

type FormValues = {
  originCountry: Country | null;
  teaserHeadingName: string;
  ebitdaValue: string;
  monthlyRevenue: string;
  expectedInvestmentAmount: string;
  localIndustryCode: string[];
  currentEmployeeCounts: string;
  companyYearFounded: Date | null;
  companyRank: string;
  sellingReason: string;
  mnaStructure: string;
  teaser_details: string;
  year_founded: Date | null;
  mainIndustryOperations: Industry[];
  main_industry_operations: string[];
  misp: string;

  toggles: {
    Industry: boolean;
    Rank: boolean;
    TeaserDescription: boolean;
    HQOriginCountry: boolean;
    ExpectedInvestment: boolean;
    YearFounded: boolean;
    EmployeeCounts: boolean;
    SellingReason: boolean;
    MAStructure: boolean;
  };
};

const TeaserCenter: React.FC = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      toggles: {
        Industry: false,
        Rank: false,
        TeaserDescription: false,
        HQOriginCountry: false,
        ExpectedInvestment: false,
        YearFounded: false,
        EmployeeCounts: false,
        SellingReason: false,
        MAStructure: false,
      },
    },
  });

  const empCountOptions = [
    { label: '1-10', value: '1-10' },
    { label: '11-50', value: '11-50' },
    { label: '51-200', value: '51-200' },
    { label: '201-500', value: '201-500' },
    { label: '500+', value: '500+' },
  ];

  const companyRankOptions = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'C', label: 'C' },
  ];

  const sellingReasonOptions = [
    { value: 'Retirement', label: 'Retirement' },
    {
      value: 'Burnout or Loss of Interest',
      label: 'Burnout or Loss of Interest',
    },
    { value: 'No Suitable Successor', label: 'No Suitable Successor' },
    {
      value: 'Attractive Acquisition Offer',
      label: 'Attractive Acquisition Offer',
    },
    {
      value: 'Desire to Pursue Other Opportunities',
      label: 'Desire to Pursue Other Opportunities',
    },
  ];

  const mnaStructureOptions = [{ value: '100% Transfer', label: '100% Transfer' }];

  const toggleFields = [
    { key: 'Industry', label: 'Industry' },
    { key: 'Rank', label: 'Rank' },
    { key: 'TeaserDescription', label: 'Teaser Description' },
    { key: 'HQOriginCountry', label: 'HQ/ Origin Country' },
    { key: 'ExpectedInvestment', label: 'Expected Investment' },
    { key: 'YearFounded', label: 'Year Founded' },
    { key: 'EmployeeCounts', label: 'Employee Counts' },
    { key: 'SellingReason', label: 'Selling Reason' },
    { key: 'MAStructure', label: 'M&A Structure' },
  ] as const;

  const teaserHeading = watch('teaserHeadingName');
  const employeeCountValue = watch('currentEmployeeCounts');
  const year_founded = watch('year_founded');
  const monthlyRevenue = watch('monthlyRevenue');

  type Country = {
    id: number;
    name: string;
    flagSrc?: string;
    status?: string;
  };

  const [countries, setCountries] = useState<Country[]>([]);

  const [industries, setIndustries] = useState<Industry[]>([]);


  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await api.get('/api/industries');

        const formatted = response.data.map((industry: { id: number; name: string; status: string; sub_industries?: [] }) => ({
          id: industry.id,
          name: industry.name,
          status: industry.status,
          sub_industries: industry.sub_industries || [],
        }));
        setIndustries(formatted);
      } catch {
        showAlert({ type: 'error', message: 'Failed to fetch industries' });
      }
    };

    fetchIndustries();
  }, []);

  const selectedIndustries = watch('mainIndustryOperations');



  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get('/api/countries');
        const formatted = response.data.map((country: { id: number; name: string; svg_icon_url?: string }) => ({
          id: country.id,
          name: country.name,
          flagSrc: country.svg_icon_url || '',
          status: 'unregistered',
        }));
        setCountries(formatted);
      } catch {
        showAlert({ type: 'error', message: 'Failed to load countries' });
      }
    };

    fetchCountries();
  }, []);

  const { id: paramId } = useParams();
  const id = paramId || localStorage.getItem('seller_id');
  const isEditMode = !!paramId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [teaserData, setTeaserData] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchTeaserData = async () => {
      try {
        const response = await api.get(`/api/seller/${id}`);
        setTeaserData(response.data.data.teaser_center);
  
      } catch {
        showAlert({ type: 'error', message: 'Failed to fetch partnership structure data' });
      }
    };
    fetchTeaserData();
  }, [id]);

  useEffect(() => {
    if (!teaserData || countries.length === 0) return;
    setValue('teaserHeadingName', teaserData.teaser_heading_name || '');
    setValue('ebitdaValue', teaserData.ebitda_value || '');
    setValue('monthlyRevenue', teaserData.monthly_revenue || '');
    setValue('misp', teaserData.misp || '');
    setValue('expectedInvestmentAmount', teaserData.expected_investment_amount || '');
    // setValue('mainIndustryOperations', teaserData?.industry || []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue('originCountry', (origin as any) ?? null);

    setValue('currentEmployeeCounts', String(teaserData.current_employee_count || null));

    setValue('sellingReason', teaserData.selling_reason || '');
    setValue('teaser_details', teaserData.teaser_details || '');

    if (teaserData.year_founded) {
      setValue('year_founded', new Date(teaserData.year_founded));
      setValue('companyYearFounded', new Date(teaserData.year_founded));
    } else {
      setValue('year_founded', null);
      setValue('companyYearFounded', null);
    }

    setValue('companyRank', teaserData.company_rank || null);

    setValue('mnaStructure', teaserData.ma_structure || null);
    setValue('currentEmployeeCounts', teaserData.current_employee_count || null);

    setValue('toggles.Industry', teaserData.has_industry);
    setValue('toggles.Rank', teaserData.has_rank);
    setValue('toggles.TeaserDescription', teaserData.has_teaser_description);
    setValue('toggles.HQOriginCountry', teaserData.has_hq_origin_country);
    setValue('toggles.ExpectedInvestment', teaserData.has_expected_investment);
    setValue('toggles.YearFounded', teaserData.has_year_founded);
    setValue('toggles.EmployeeCounts', teaserData.has_emp_count);
    setValue('toggles.SellingReason', teaserData.has_selling_reason);
    setValue('toggles.MAStructure', teaserData.has_ma_structure);

    setCheckedItems({
      teaserName: teaserData.has_teaser_name ?? false,
      industry: teaserData.is_industry_checked ?? false,
    });
  }, [teaserData, countries, setValue]);

  const [checkedItems, setCheckedItems] = useState({
    teaserName: false,
    industry: false,
  });

  const handleChange = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data: FormValues) => {
    const sellerId = id;


    const toggleKeyMap: Record<keyof typeof data.toggles, string> = {
      Industry: 'has_industry',
      Rank: 'has_rank',
      TeaserDescription: 'has_teaser_description',
      HQOriginCountry: 'has_hq_origin_country',
      ExpectedInvestment: 'has_expected_investment',
      YearFounded: 'has_year_founded',
      EmployeeCounts: 'has_emp_count',
      SellingReason: 'has_selling_reason',
      MAStructure: 'has_ma_structure',
    };

    const togglePayload = Object.entries(toggleKeyMap).reduce(
      (acc, [toggleKey, dbKey]) => {
        acc[dbKey] = data.toggles[toggleKey as keyof typeof data.toggles] ?? false;
        return acc;
      },
      {} as Record<string, boolean>
    );

    const payload = {
      seller_id: sellerId || '',
      teaser_heading_name: data.teaserHeadingName,
      ebitda_value: data.ebitdaValue,
      monthly_revenue: data.monthlyRevenue,
      expected_investment_amount: data.expectedInvestmentAmount,
      hq_origin_country_id: data.originCountry?.id,

      year_founded:
        data.year_founded instanceof Date
          ? String(data.year_founded.getFullYear())
          : typeof data.year_founded === 'number' || typeof data.year_founded === 'string'
            ? String(data.year_founded)
            : null,
      current_employee_count: data.currentEmployeeCounts,
      company_rank: data.companyRank,
      selling_reason: data.sellingReason,
      teaser_details: data.teaser_details,
      misp: data.misp,
      ma_structure: data.mnaStructure,
      industry: data.mainIndustryOperations,
      has_teaser_name: checkedItems.teaserName,
      is_industry_checked: checkedItems.industry,

      ...togglePayload,
    };

    try {
      const response = await api.post('/api/seller/teaser-center', payload);
      localStorage.setItem('seller_id', response.data.data);
      showAlert({ type: 'success', message: 'Draft Saved' });
      navigate('/seller-portal');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showAlert({ type: 'error', message: 'Submission failed' });
        alert(`Submission failed: ${error.response?.data?.detail || error.message}`);
      } else {
        showAlert({ type: 'error', message: 'Unexpected error occurred' });
        alert('Unexpected error occurred during form submission.');
      }
    }
  };

  const onDraft = async (data: FormValues) => {
    const sellerId = id;


    const payload = {
      seller_id: sellerId || '',
      teaser_heading_name: data.teaserHeadingName,

      ebitda_value: data.ebitdaValue,
      monthly_revenue: data.monthlyRevenue,
      expected_investment_amount: data.expectedInvestmentAmount,
      hq_origin_country_id: data.originCountry?.id,
      year_founded:
        data.year_founded instanceof Date
          ? String(data.year_founded.getFullYear())
          : typeof data.year_founded === 'number' || typeof data.year_founded === 'string'
            ? String(data.year_founded)
            : null,
      current_employee_count: data.currentEmployeeCounts,
      company_rank: data.companyRank,
      selling_reason: data.sellingReason,
      teaser_details: data.teaser_details,
      misp: data.misp,
      ma_structure: data.mnaStructure,
      industry: data.mainIndustryOperations,
      has_industry: String(data.toggles.Industry),
      has_rank: String(data.toggles.Rank),
      has_teaser_description: String(data.toggles.TeaserDescription),
      has_hq_origin_country: String(data.toggles.HQOriginCountry),
      has_expected_investment: String(data.toggles.ExpectedInvestment),
      has_year_founded: String(data.toggles.YearFounded),
      has_emp_count: String(data.toggles.EmployeeCounts),
      has_selling_reason: String(data.toggles.SellingReason),
      has_ma_structure: String(data.toggles.MAStructure),

      has_teaser_name: checkedItems.teaserName,
      is_industry_checked: checkedItems.industry,

      is_draft: '2',
    };

    try {
      const response = await api.post('/api/seller/teaser-center', payload);

   
      localStorage.setItem('seller_id', response.data.data);
      showAlert({ type: 'success', message: 'Draft Saved' });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showAlert({ type: 'error', message: 'Draft saving error' });
        alert(`Failed to save draft: ${error.response?.data?.detail || error.message}`);
      } else {
        showAlert({ type: 'error', message: 'Unexpected error occurred' });
        alert('Unexpected error occurred while saving draft.');
      }
    }
  };

  const onDraftCancel = async (data: FormValues) => {
    const sellerId = id;
    const payload = {
      seller_id: sellerId || '',
      teaser_heading_name: data.teaserHeadingName,

      ebitda_value: data.ebitdaValue,
      monthly_revenue: data.monthlyRevenue,
      expected_investment_amount: data.expectedInvestmentAmount,
      hq_origin_country_id: data.originCountry?.id,
      year_founded:
        data.year_founded instanceof Date
          ? String(data.year_founded.getFullYear())
          : typeof data.year_founded === 'number' || typeof data.year_founded === 'string'
            ? String(data.year_founded)
            : null,
      current_employee_count: data.currentEmployeeCounts,
      company_rank: data.companyRank,
      selling_reason: data.sellingReason,
      teaser_details: data.teaser_details,
      misp: data.misp,
      ma_structure: data.mnaStructure,
      industry: data.mainIndustryOperations,
      has_industry: String(data.toggles.Industry),
      has_rank: String(data.toggles.Rank),
      has_teaser_description: String(data.toggles.TeaserDescription),
      has_hq_origin_country: String(data.toggles.HQOriginCountry),
      has_expected_investment: String(data.toggles.ExpectedInvestment),
      has_year_founded: String(data.toggles.YearFounded),
      has_emp_count: String(data.toggles.EmployeeCounts),
      has_selling_reason: String(data.toggles.SellingReason),
      has_ma_structure: String(data.toggles.MAStructure),
      has_teaser_name: checkedItems.teaserName,
      is_industry_checked: checkedItems.industry,

      is_draft: '2',
    };

    try {
      const response = await api.post('/api/seller/teaser-center', payload);

   
      localStorage.setItem('seller_id', response.data.data);
      showAlert({ type: 'success', message: 'Draft Saved' });
      navigate('/seller-portal');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showAlert({ type: 'error', message: 'Draft saving error' });
        alert(`Failed to save draft: ${error.response?.data?.detail || error.message}`);
      } else {
        showAlert({ type: 'error', message: 'Unexpected error occurred' });
        alert('Unexpected error occurred while saving draft.');
      }
    }
  };

  const selectedCountry = useWatch({
    control,
    name: 'originCountry',
  });

  const companyRank = useWatch({
    control,
    name: 'companyRank',
  });

  useWatch({
    control,
    name: 'mainIndustryOperations',
  });

  const industryString = selectedIndustries?.map((i) => i.name).join(', ') || 'N/A';
  const selectedRankObj = companyRankOptions.find((option) => option.value === companyRank);
  const sellerRank = selectedRankObj ? selectedRankObj.label : 'Not Disclosed';

  const selectedSellingReason = useWatch({
    control,
    name: 'sellingReason',
  });

  const sellingReasonValue = selectedSellingReason || '';

  const selectedMnaStructure = useWatch({
    control,
    name: 'mnaStructure',
  });

  const mnaStructureValue = selectedMnaStructure || '';

  const teaserDetails = watch('teaser_details') || '';

  const businessFeatures = teaserDetails ? [teaserDetails] : [];
  const mispValue = useWatch({
    control,
    name: 'misp',
  });
  const expectedInvestment = useWatch({
    control,
    name: 'expectedInvestmentAmount',
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className=" font-poppins pl-[15px] ">
        <div className="flex gap-[70px] ">
          <div className="flex flex-col items-start gap-4 p-0 pt-7 pl-7 rounded-none w-[791px] ">
            <div className="flex justify-start items-center flex-row gap-1.5">
              <svg
                width="26"
                height="27"
                viewBox="0 0 26 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.7895 22.6763H10.3012C9.89191 22.6763 9.56206 22.3441 9.56206 21.9372V21.4177C9.56692 20.9712 9.54504 20.6575 9.49803 20.4825C9.24598 19.5593 8.57898 18.7854 7.93305 18.0349C7.7199 17.7893 7.51891 17.5551 7.33412 17.3193C6.40453 16.1368 5.91016 14.7201 5.91016 13.2176C5.91016 9.54944 8.89587 6.56616 12.564 6.56616C16.2313 6.56616 19.2162 9.54944 19.2162 13.2176C19.2162 14.7209 18.7242 16.1392 17.7922 17.3209C17.6293 17.53 17.4413 17.7488 17.2452 17.9798C16.5838 18.7578 15.8455 19.6258 15.591 20.5424C15.5464 20.7061 15.5246 21.0003 15.5278 21.412V21.9356C15.5278 22.3441 15.1979 22.6763 14.7895 22.6763ZM11.0419 21.1965H14.0503C14.0585 20.621 14.1144 20.3374 14.1654 20.1526C14.5083 18.9183 15.3576 17.9157 16.1073 17.0356C16.3042 16.8038 16.4768 16.6012 16.63 16.4083C17.3538 15.4876 17.7371 14.3862 17.7371 13.2184C17.7371 10.3656 15.4176 8.04443 12.5648 8.04443C9.71199 8.04443 7.39085 10.3656 7.39085 13.2184C7.39085 14.3838 7.77339 15.486 8.49793 16.4067C8.66894 16.6255 8.85615 16.8403 9.05471 17.0696C9.73793 17.8631 10.5848 18.8461 10.9269 20.0951C10.9771 20.2904 11.0355 20.5878 11.0419 21.1965Z"
                  fill="#DD7A01"
                />
                <path
                  d="M14.7899 24.6331H10.3016C9.89235 24.6331 9.5625 24.3017 9.5625 23.8924C9.5625 23.4839 9.89235 23.1541 10.3016 23.1541H14.7899C15.1984 23.1541 15.5282 23.4839 15.5282 23.8924C15.5282 24.3017 15.1984 24.6331 14.7899 24.6331Z"
                  fill="#DD7A01"
                />
                <path
                  d="M13.6685 26.5878H11.4243C11.0151 26.5878 10.6836 26.2563 10.6836 25.8487C10.6836 25.4402 11.0151 25.1079 11.4243 25.1079H13.6685C14.0753 25.1079 14.4076 25.4402 14.4076 25.8487C14.4076 26.2563 14.0753 26.5878 13.6685 26.5878Z"
                  fill="#DD7A01"
                />
                <path
                  d="M24.3887 13.9558H21.4322C21.0237 13.9558 20.6914 13.626 20.6914 13.2167C20.6914 12.8082 21.0237 12.4775 21.4322 12.4775H24.3887C24.7972 12.4775 25.127 12.8082 25.127 13.2167C25.127 13.626 24.7972 13.9558 24.3887 13.9558Z"
                  fill="#DD7A01"
                />
                <path
                  d="M3.69567 13.9558H0.738322C0.329854 13.9558 0 13.626 0 13.2167C0 12.8082 0.329854 12.4775 0.738322 12.4775H3.69485C4.10332 12.4775 4.43561 12.8082 4.43561 13.2167C4.43642 13.626 4.10413 13.9558 3.69567 13.9558Z"
                  fill="#DD7A01"
                />
                <path
                  d="M12.565 5.08901C12.1557 5.08901 11.8242 4.75915 11.8242 4.34987V1.39172C11.8242 0.984063 12.1557 0.652588 12.565 0.652588C12.9743 0.652588 13.3041 0.984063 13.3041 1.39172V4.34906C13.3041 4.75834 12.9743 5.08901 12.565 5.08901Z"
                  fill="#DD7A01"
                />
                <path
                  d="M20.9222 22.3188C20.7342 22.3188 20.5454 22.2467 20.4003 22.1016L18.3101 20.0107C18.0216 19.7229 18.0216 19.2537 18.3101 18.9644C18.5995 18.6758 19.0671 18.6775 19.3556 18.966L21.4458 21.0561C21.7351 21.3455 21.7351 21.8147 21.4458 22.1032C21.3015 22.2483 21.1135 22.3188 20.9222 22.3188Z"
                  fill="#DD7A01"
                />
                <path
                  d="M6.29003 7.68633C6.102 7.68633 5.91236 7.6142 5.76647 7.46913L3.67794 5.37979C3.3886 5.09045 3.3886 4.6212 3.67794 4.33187C3.96727 4.04335 4.4349 4.04335 4.72342 4.33187L6.81358 6.42203C7.10291 6.71055 7.10291 7.18061 6.81358 7.46913C6.66932 7.6142 6.48048 7.68633 6.29003 7.68633Z"
                  fill="#DD7A01"
                />
                <path
                  d="M4.20068 22.3184C4.01184 22.3184 3.82301 22.2479 3.67794 22.1028C3.3886 21.8143 3.3886 21.3451 3.67794 21.0557L5.76972 18.9639C6.05662 18.6754 6.52425 18.6754 6.81358 18.9639C7.10291 19.2533 7.10291 19.7225 6.81358 20.0119L4.72342 22.1028C4.57835 22.2471 4.39032 22.3184 4.20068 22.3184Z"
                  fill="#DD7A01"
                />
                <path
                  d="M18.8364 7.68699C18.6476 7.68699 18.4587 7.61486 18.3128 7.46979C18.0259 7.18127 18.0259 6.71283 18.3128 6.42431L20.403 4.33415C20.6899 4.04563 21.1608 4.044 21.4485 4.33253C21.7378 4.62186 21.7378 5.08949 21.4485 5.37882L19.3599 7.46817C19.2157 7.61324 19.0268 7.68699 18.8364 7.68699Z"
                  fill="#DD7A01"
                />
              </svg>
              <span className="text-[#000000] text-lg font-medium">Hints</span>
            </div>

            <div className="text-[#393939] text-sm">
              <span>All data is sourced from previous sections. </span>
              <span className="font-semibold">
                Any changes made here will automatically update the corresponding fields across all sections.
              </span>
              <span> Use the toggle option to show or hide specific data as needed</span>
            </div>
          </div>
        </div>

        <div className="flex gap-[10px]  w-full   ">
          <div className="flex flex-col items-start gap-4 p-0 pt-7 pl-7 rounded-none">
            <p className="w-full text-left text-[#064771] text-lg font-medium leading-5 font-poppins">
              Basic Information
            </p>
            <svg
              width="394"
              height="2"
              viewBox="0 0 394 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H394" stroke="#BCC2C5" />
            </svg>

            <div className="flex items-center gap-2">
              <Label text="Teaser Heading Name" required />
            </div>

            <div className="flex items-center gap-3 p-[10px_20px_10px_20px]rounded-md w-full sm:w-80 md:w-96 lg:w-[500px]">
              <div className="w-full bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2">
                <Input
                  {...register('teaserHeadingName', {})}
                  placeholder="Enter Teaser Heading Name"
                  className="h-[40px] p-0 pl-4 pr-2 w-[380px]"
                />
              </div>
            </div>

            <Label text="Industry" required />

            <div className="w-[380px]">
              <Controller
                name="mainIndustryOperations"
                control={control}
                render={({ field }) => (
                  <IndustryDropdown
                    industries={industries}
                    multiSelect
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
            </div>

            <Label text="HQ / Origin Country" required />

            <div className="w-[380px]">
              <Controller
                name="originCountry"
                control={control}
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    countries={countries as any}
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                )}
              />
            </div>

            <Label text="Year Founded" />

            <div className="flex items-center gap-3 p-[10px_20px_10px_20px]rounded-md w-[380px] sm:w-80 md:w-96 lg:w-[500px]">
              <div className=" bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2 w-[380px]">
                <Controller
                  control={control}
                  name="year_founded"
                  render={({ field }) => (
                    <DatePicker
                      value={
                        field.value && typeof field.value === 'string'
                          ? new Date(parseInt(field.value), 0, 1)
                          : field.value instanceof Date
                            ? field.value
                            : null
                      }
                      onChange={(value) => {
                        field.onChange(value ? new Date(value) : null);
                      }}
                      placeholder="Select Year"
                      yearPicker={true}
                      icon={
                        <svg
                          width="18"
                          height="16"
                          viewBox="0 0 18 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.3897 6.70475C9.77323 6.70475 7.64355 8.77865 7.64355 11.3281C7.64355 13.863 9.77323 15.9257 12.3897 15.9257C15.0062 15.9257 17.1359 13.8518 17.1359 11.3023C17.1359 8.76742 15.0062 6.70475 12.3897 6.70475ZM12.3897 14.6047C10.5204 14.6047 8.99961 13.1345 8.99961 11.3281C8.99961 9.50715 10.5204 8.0257 12.3897 8.0257C14.2591 8.0257 15.7799 9.49592 15.7799 11.3023C15.7799 13.1233 14.2591 14.6047 12.3897 14.6047ZM13.5471 11.4958C13.8122 11.7541 13.8122 12.1715 13.5471 12.4298C13.4149 12.5586 13.2413 12.6233 13.0678 12.6233C12.8942 12.6233 12.7206 12.5586 12.5884 12.4298L11.9104 11.7693C11.7829 11.6451 11.7117 11.4774 11.7117 11.3023V9.98137C11.7117 9.61679 12.0148 9.3209 12.3897 9.3209C12.7647 9.3209 13.0678 9.61679 13.0678 9.98137V11.0289L13.5471 11.4958ZM17.1359 4.69756V6.01851C17.1359 6.3831 16.8329 6.67899 16.4579 6.67899C16.083 6.67899 15.7799 6.3831 15.7799 6.01851V4.69756C15.7799 3.60513 14.8673 2.71613 13.7458 2.71613H4.25342C3.13196 2.71613 2.21934 3.60513 2.21934 4.69756V5.35804H8.32158C8.69585 5.35804 8.99961 5.65393 8.99961 6.01851C8.99961 6.3831 8.69585 6.67899 8.32158 6.67899H2.21934V12.6233C2.21934 13.7157 3.13196 14.6047 4.25342 14.6047H6.96552C7.33979 14.6047 7.64355 14.9006 7.64355 15.2652C7.64355 15.6298 7.33979 15.9257 6.96552 15.9257H4.25342C2.3841 15.9257 0.863281 14.4442 0.863281 12.6233V4.69756C0.863281 2.87662 2.3841 1.39517 4.25342 1.39517H4.93144V0.734696C4.93144 0.370112 5.2352 0.0742188 5.60947 0.0742188C5.98374 0.0742188 6.2875 0.370112 6.2875 0.734696V1.39517H11.7117V0.734696C11.7117 0.370112 12.0148 0.0742188 12.3897 0.0742188C12.7647 0.0742188 13.0678 0.370112 13.0678 0.734696V1.39517H13.7458C15.6151 1.39517 17.1359 2.87662 17.1359 4.69756Z"
                            fill="#005E80"
                          />
                        </svg>
                      }
                    />
                  )}
                />
              </div>
            </div>

            <Label text="Current Employee Count" required />

            <div className="w-[380px]">
              <Controller
                control={control}
                name="currentEmployeeCounts"
                render={({ field }) => (
                  <SelectPicker
                    options={empCountOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
                  />
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <Label text="Company Rank " />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="mt-7"
              >
                <path
                  d="M9.0013 0.666626C7.35313 0.666626 5.74196 1.15537 4.37155 2.07105C3.00114 2.98672 1.93304 4.28821 1.30231 5.81093C0.671579 7.33365 0.506552 9.0092 0.828095 10.6257C1.14964 12.2422 1.94331 13.7271 3.10875 14.8925C4.27419 16.058 5.75904 16.8516 7.37555 17.1732C8.99206 17.4947 10.6676 17.3297 12.1903 16.699C13.713 16.0682 15.0145 15.0001 15.9302 13.6297C16.8459 12.2593 17.3346 10.6481 17.3346 8.99996C17.3322 6.79055 16.4535 4.67233 14.8912 3.11004C13.3289 1.54776 11.2107 0.669016 9.0013 0.666626ZM9.0013 15.9444C7.62782 15.9444 6.28519 15.5371 5.14318 14.7741C4.00117 14.011 3.11108 12.9264 2.58548 11.6575C2.05987 10.3885 1.92234 8.99225 2.1903 7.64516C2.45825 6.29807 3.11964 5.06069 4.09084 4.08949C5.06204 3.1183 6.29942 2.4569 7.64651 2.18895C8.9936 1.921 10.3899 2.05852 11.6588 2.58413C12.9278 3.10974 14.0123 3.99982 14.7754 5.14183C15.5385 6.28384 15.9457 7.62648 15.9457 8.99996C15.9437 10.8411 15.2114 12.6063 13.9095 13.9082C12.6076 15.2101 10.8425 15.9424 9.0013 15.9444Z"
                  fill="#064771"
                />
                <path
                  d="M9.00217 7.61194H8.30773C8.12355 7.61194 7.94691 7.6851 7.81668 7.81534C7.68645 7.94557 7.61328 8.1222 7.61328 8.30638C7.61328 8.49056 7.68645 8.6672 7.81668 8.79743C7.94691 8.92766 8.12355 9.00083 8.30773 9.00083H9.00217V13.1675C9.00217 13.3517 9.07533 13.5283 9.20557 13.6585C9.3358 13.7888 9.51244 13.8619 9.69661 13.8619C9.88079 13.8619 10.0574 13.7888 10.1877 13.6585C10.3179 13.5283 10.3911 13.3517 10.3911 13.1675V9.00083C10.3911 8.63247 10.2447 8.2792 9.98426 8.01873C9.72379 7.75827 9.37053 7.61194 9.00217 7.61194Z"
                  fill="#064771"
                />
                <path
                  d="M9.0026 6.22066C9.5779 6.22066 10.0443 5.75429 10.0443 5.179C10.0443 4.6037 9.5779 4.13733 9.0026 4.13733C8.42731 4.13733 7.96094 4.6037 7.96094 5.179C7.96094 5.75429 8.42731 6.22066 9.0026 6.22066Z"
                  fill="#064771"
                />
              </svg>
            </div>
            <div className="w-[380px]">
              <Controller
                control={control}
                name="companyRank"
                render={({ field }) => (
                  <SelectPicker
                    options={companyRankOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    placeholder="Select between A/B/C"
                  />
                )}
              />
            </div>

            <Label text="Selling Reason" />
            <div className="w-[380px]">
              <Controller
                control={control}
                name="sellingReason"
                render={({ field }) => (
                  <SelectPicker
                    options={sellingReasonOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    placeholder="Select selling reason"
                  />
                )}
              />
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 p-0 pt-[30px] pl-7 rounded-none ">
            <p className="w-full text-left text-[#064771] text-lg font-medium leading-5 font-poppins">
              Financials & Valuation
            </p>
            <svg
              width="394"
              height="2"
              viewBox="0 0 394 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H394" stroke="#BCC2C5" />
            </svg>

            <div className="flex items-center gap-2">
              <Label text="EBITDA Value " />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="mt-7"
              >
                <path
                  d="M9.0013 0.666626C7.35313 0.666626 5.74196 1.15537 4.37155 2.07105C3.00114 2.98672 1.93304 4.28821 1.30231 5.81093C0.671579 7.33365 0.506552 9.0092 0.828095 10.6257C1.14964 12.2422 1.94331 13.7271 3.10875 14.8925C4.27419 16.058 5.75904 16.8516 7.37555 17.1732C8.99206 17.4947 10.6676 17.3297 12.1903 16.699C13.713 16.0682 15.0145 15.0001 15.9302 13.6297C16.8459 12.2593 17.3346 10.6481 17.3346 8.99996C17.3322 6.79055 16.4535 4.67233 14.8912 3.11004C13.3289 1.54776 11.2107 0.669016 9.0013 0.666626ZM9.0013 15.9444C7.62782 15.9444 6.28519 15.5371 5.14318 14.7741C4.00117 14.011 3.11108 12.9264 2.58548 11.6575C2.05987 10.3885 1.92234 8.99225 2.1903 7.64516C2.45825 6.29807 3.11964 5.06069 4.09084 4.08949C5.06204 3.1183 6.29942 2.4569 7.64651 2.18895C8.9936 1.921 10.3899 2.05852 11.6588 2.58413C12.9278 3.10974 14.0123 3.99982 14.7754 5.14183C15.5385 6.28384 15.9457 7.62648 15.9457 8.99996C15.9437 10.8411 15.2114 12.6063 13.9095 13.9082C12.6076 15.2101 10.8425 15.9424 9.0013 15.9444Z"
                  fill="#064771"
                />
                <path
                  d="M9.00217 7.61194H8.30773C8.12355 7.61194 7.94691 7.6851 7.81668 7.81534C7.68645 7.94557 7.61328 8.1222 7.61328 8.30638C7.61328 8.49056 7.68645 8.6672 7.81668 8.79743C7.94691 8.92766 8.12355 9.00083 8.30773 9.00083H9.00217V13.1675C9.00217 13.3517 9.07533 13.5283 9.20557 13.6585C9.3358 13.7888 9.51244 13.8619 9.69661 13.8619C9.88079 13.8619 10.0574 13.7888 10.1877 13.6585C10.3179 13.5283 10.3911 13.3517 10.3911 13.1675V9.00083C10.3911 8.63247 10.2447 8.2792 9.98426 8.01873C9.72379 7.75827 9.37053 7.61194 9.00217 7.61194Z"
                  fill="#064771"
                />
                <path
                  d="M9.0026 6.22066C9.5779 6.22066 10.0443 5.75429 10.0443 5.179C10.0443 4.6037 9.5779 4.13733 9.0026 4.13733C8.42731 4.13733 7.96094 4.6037 7.96094 5.179C7.96094 5.75429 8.42731 6.22066 9.0026 6.22066Z"
                  fill="#064771"
                />
              </svg>
            </div>

            <div className="flex items-center gap-3 p-[10px_20px_10px_20px]rounded-md w-full sm:w-80 md:w-96 lg:w-[500px]">
              <div className="w-full bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2">
                <Input
                  {...register('ebitdaValue', {})}
                  placeholder="৳ 639,000"
                  rightIcon={
                    <svg
                      width="21"
                      height="10"
                      viewBox="0 0 21 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="ml-[-120px]"
                    >
                      <path
                        d="M7.12559 0.723404L6.65751 1.31915C6.65751 1.31915 6.35964 1.74468 6.27453 2C6.18942 2.12766 6.06176 2.21277 5.89155 2.21277H5.63623C4.14687 2.21277 2.87027 3.31915 2.78517 4.76596C2.65751 6.38298 3.97666 7.70213 5.55113 7.70213H9.42347C9.93411 7.70213 10.4022 7.53191 10.7852 7.3617C11.2958 7.06383 11.7213 6.59574 11.9341 6.04255C12.0618 5.70213 12.1469 5.3617 12.1469 4.93617C12.1469 4.7234 12.1043 4.55319 12.0618 4.34043C11.9767 4.04255 12.1894 3.78723 12.4873 3.82979H13.9341C14.1469 3.82979 14.2745 4 14.3596 4.17021C14.4022 4.42553 14.4022 4.68085 14.4022 4.93617C14.4022 5.2766 14.3596 5.65957 14.2745 6.04255C14.1469 6.6383 13.8916 7.19149 13.5511 7.70213C12.9128 8.6383 11.9341 9.40426 10.8277 9.70213C10.4022 9.82979 9.89155 9.91489 9.46602 9.91489H5.72134C3.04049 9.91489 0.742615 7.82979 0.657509 5.14894C0.529849 2.34042 2.78517 -9.53674e-07 5.59368 -9.53674e-07H6.87028C7.16815 0.042552 7.33836 0.468084 7.12559 0.723404ZM20.9979 5.19149C20.9128 7.87234 18.615 10 15.9341 9.95745L14.7852 10C14.4447 10 14.232 9.57447 14.4447 9.31915C14.7852 8.93617 15.0405 8.51064 15.2958 8.04255C15.3809 7.91489 15.5086 7.82979 15.6788 7.82979H15.9341C17.4235 7.82979 18.7001 6.7234 18.7852 5.2766C18.9128 3.65957 17.5937 2.34043 16.0192 2.34043H12.1469C11.6362 2.34043 11.1681 2.51064 10.7852 2.68085C10.2745 2.97872 9.849 3.44681 9.63623 4C9.50857 4.34043 9.42347 4.68085 9.42347 5.10638C9.42347 5.31915 9.46602 5.48936 9.50857 5.70213C9.59368 6 9.38091 6.25532 9.08304 6.21277H7.63623C7.42347 6.21277 7.29581 6.04255 7.2107 5.87234C7.16815 5.61702 7.16815 5.3617 7.16815 5.10638C7.16815 4.76596 7.2107 4.34043 7.29581 4C7.42347 3.40425 7.67879 2.85106 8.01921 2.38298C8.65751 1.44681 9.63623 0.680849 10.7426 0.382977C11.1681 0.255318 11.6788 0.170211 12.1043 0.170211H15.9767C18.8277 0.042551 21.083 2.38298 20.9979 5.19149Z"
                        fill="#848484"
                      />
                    </svg>
                  }
                  className="h-[40px] p-0 pl-4  w-[400px]"
                />
              </div>
            </div>

            <div className="flex self-stretch justify-start items-start flex-row gap-2.5 mt-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.16748 10.833V5.83301C9.16748 5.37467 9.54248 4.99967 10.0008 4.99967C10.4591 4.99967 10.8341 5.37467 10.8341 5.83301V10.833C10.8341 11.2913 10.4591 11.6663 10.0008 11.6663C9.54248 11.6663 9.16748 11.2913 9.16748 10.833ZM10.0008 12.4997C9.30915 12.4997 8.75082 13.058 8.75082 13.7497C8.75082 14.4413 9.30915 14.9997 10.0008 14.9997C10.6925 14.9997 11.2508 14.4413 11.2508 13.7497C11.2508 13.058 10.6925 12.4997 10.0008 12.4997ZM19.6508 16.5663C19.0675 17.6913 17.8425 18.333 16.3091 18.333H3.70082C2.15915 18.333 0.942482 17.6913 0.359149 16.5663C-0.232518 15.433 -0.0658513 13.983 0.775815 12.7663L7.47582 2.16634C8.06748 1.31634 9.00082 0.833008 10.0008 0.833008C11.0008 0.833008 11.9341 1.31634 12.5008 2.14134L19.2341 12.783C20.0758 13.9997 20.2341 15.4413 19.6425 16.5663H19.6508ZM17.8591 13.7163C17.8591 13.7163 17.8425 13.6997 17.8425 13.683L11.1175 3.05801C10.8758 2.71634 10.4591 2.49967 10.0008 2.49967C9.54248 2.49967 9.12582 2.71634 8.86748 3.09134L2.15915 13.683C1.64248 14.4163 1.52582 15.2163 1.82582 15.7913C2.11748 16.358 2.78415 16.6663 3.69248 16.6663H16.2925C17.2008 16.6663 17.8675 16.358 18.1591 15.7913C18.4592 15.2163 18.3425 14.4163 17.8508 13.7163H17.8591Z"
                  fill="#DD7A01"
                />
              </svg>
              <div
                className="flex justify-start items-start flex-col gap-[13px] w-[352px]"
                style={{ width: '352px' }}
              >
                <div className="self-stretch text-[#6D6D6D] text-sm">
                  The EBITDA value is automatically pulled from the valuation module, if you
                  wish to use a different value for this please adjust in the valuation
                </div>
                <button className="flex justify-start items-end flex-row gap-2.5" type="button">
                  <span className="text-[#0C5577] font-medium leading-[19.28569984436035px] underline">
                    See The Valuation Details
                  </span>
                  <div className="mb-1">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 6.71429V1M9 1H3.28571M9 1L1 9"
                        stroke="#16607B"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label text="Monthly Revenue " />
            </div>

            <div className="flex items-center gap-3 p-[10px_20px_10px_20px]rounded-md w-full sm:w-80 md:w-96 lg:w-[500px]">
              <div className="w-full bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2">
                <Input
                  {...register('monthlyRevenue', {})}
                  placeholder="৳"
                  className="h-[40px] p-0 pl-4  w-[400px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label text="Maximum Investor Shareholding Percentage " />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="mt-7"
              >
                <path
                  d="M9.0013 0.666626C7.35313 0.666626 5.74196 1.15537 4.37155 2.07105C3.00114 2.98672 1.93304 4.28821 1.30231 5.81093C0.671579 7.33365 0.506552 9.0092 0.828095 10.6257C1.14964 12.2422 1.94331 13.7271 3.10875 14.8925C4.27419 16.058 5.75904 16.8516 7.37555 17.1732C8.99206 17.4947 10.6676 17.3297 12.1903 16.699C13.713 16.0682 15.0145 15.0001 15.9302 13.6297C16.8459 12.2593 17.3346 10.6481 17.3346 8.99996C17.3322 6.79055 16.4535 4.67233 14.8912 3.11004C13.3289 1.54776 11.2107 0.669016 9.0013 0.666626ZM9.0013 15.9444C7.62782 15.9444 6.28519 15.5371 5.14318 14.7741C4.00117 14.011 3.11108 12.9264 2.58548 11.6575C2.05987 10.3885 1.92234 8.99225 2.1903 7.64516C2.45825 6.29807 3.11964 5.06069 4.09084 4.08949C5.06204 3.1183 6.29942 2.4569 7.64651 2.18895C8.9936 1.921 10.3899 2.05852 11.6588 2.58413C12.9278 3.10974 14.0123 3.99982 14.7754 5.14183C15.5385 6.28384 15.9457 7.62648 15.9457 8.99996C15.9437 10.8411 15.2114 12.6063 13.9095 13.9082C12.6076 15.2101 10.8425 15.9424 9.0013 15.9444Z"
                  fill="#064771"
                />
                <path
                  d="M9.00217 7.61194H8.30773C8.12355 7.61194 7.94691 7.6851 7.81668 7.81534C7.68645 7.94557 7.61328 8.1222 7.61328 8.30638C7.61328 8.49056 7.68645 8.6672 7.81668 8.79743C7.94691 8.92766 8.12355 9.00083 8.30773 9.00083H9.00217V13.1675C9.00217 13.3517 9.07533 13.5283 9.20557 13.6585C9.3358 13.7888 9.51244 13.8619 9.69661 13.8619C9.88079 13.8619 10.0574 13.7888 10.1877 13.6585C10.3179 13.5283 10.3911 13.3517 10.3911 13.1675V9.00083C10.3911 8.63247 10.2447 8.2792 9.98426 8.01873C9.72379 7.75827 9.37053 7.61194 9.00217 7.61194Z"
                  fill="#064771"
                />
                <path
                  d="M9.0026 6.22066C9.5779 6.22066 10.0443 5.75429 10.0443 5.179C10.0443 4.6037 9.5779 4.13733 9.0026 4.13733C8.42731 4.13733 7.96094 4.6037 7.96094 5.179C7.96094 5.75429 8.42731 6.22066 9.0026 6.22066Z"
                  fill="#064771"
                />
              </svg>
            </div>

            <Controller
              name="misp"
              control={control}
              render={({ field }) => <ApproxInput {...field} placeholder="e.g., 54%" />}
            />

            <div className="flex items-center gap-2">
              <Label text="Expected Investment Amount (Desired Amount)" />
            </div>

            <div className="flex items-center gap-3 p-[10px_20px_10px_20px]rounded-md w-full sm:w-80 md:w-96 lg:w-[500px]">
              <div className="w-full bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2">
                <Input
                  {...register('expectedInvestmentAmount', {})}
                  placeholder=""
                  className="h-[40px] p-0 pl-4  w-[400px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label text="M&A Structure " />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="mt-7"
              >
                <path
                  d="M9.0013 0.666626C7.35313 0.666626 5.74196 1.15537 4.37155 2.07105C3.00114 2.98672 1.93304 4.28821 1.30231 5.81093C0.671579 7.33365 0.506552 9.0092 0.828095 10.6257C1.14964 12.2422 1.94331 13.7271 3.10875 14.8925C4.27419 16.058 5.75904 16.8516 7.37555 17.1732C8.99206 17.4947 10.6676 17.3297 12.1903 16.699C13.713 16.0682 15.0145 15.0001 15.9302 13.6297C16.8459 12.2593 17.3346 10.6481 17.3346 8.99996C17.3322 6.79055 16.4535 4.67233 14.8912 3.11004C13.3289 1.54776 11.2107 0.669016 9.0013 0.666626ZM9.0013 15.9444C7.62782 15.9444 6.28519 15.5371 5.14318 14.7741C4.00117 14.011 3.11108 12.9264 2.58548 11.6575C2.05987 10.3885 1.92234 8.99225 2.1903 7.64516C2.45825 6.29807 3.11964 5.06069 4.09084 4.08949C5.06204 3.1183 6.29942 2.4569 7.64651 2.18895C8.9936 1.921 10.3899 2.05852 11.6588 2.58413C12.9278 3.10974 14.0123 3.99982 14.7754 5.14183C15.5385 6.28384 15.9457 7.62648 15.9457 8.99996C15.9437 10.8411 15.2114 12.6063 13.9095 13.9082C12.6076 15.2101 10.8425 15.9424 9.0013 15.9444Z"
                  fill="#064771"
                />
                <path
                  d="M9.00217 7.61194H8.30773C8.12355 7.61194 7.94691 7.6851 7.81668 7.81534C7.68645 7.94557 7.61328 8.1222 7.61328 8.30638C7.61328 8.49056 7.68645 8.6672 7.81668 8.79743C7.94691 8.92766 8.12355 9.00083 8.30773 9.00083H9.00217V13.1675C9.00217 13.3517 9.07533 13.5283 9.20557 13.6585C9.3358 13.7888 9.51244 13.8619 9.69661 13.8619C9.88079 13.8619 10.0574 13.7888 10.1877 13.6585C10.3179 13.5283 10.3911 13.3517 10.3911 13.1675V9.00083C10.3911 8.63247 10.2447 8.2792 9.98426 8.01873C9.72379 7.75827 9.37053 7.61194 9.00217 7.61194Z"
                  fill="#064771"
                />
                <path
                  d="M9.0026 6.22066C9.5779 6.22066 10.0443 5.75429 10.0443 5.179C10.0443 4.6037 9.5779 4.13733 9.0026 4.13733C8.42731 4.13733 7.96094 4.6037 7.96094 5.179C7.96094 5.75429 8.42731 6.22066 9.0026 6.22066Z"
                  fill="#064771"
                />
              </svg>
            </div>
            <div className="w-[380px]">
              <Controller
                control={control}
                name="mnaStructure"
                render={({ field }) => (
                  <SelectPicker
                    options={mnaStructureOptions}
                    value={field.value}
                    onChange={field.onChange}
                    searchable={false}
                    placeholder="Select"
                  />
                )}
              />
            </div>
          </div>

          <div className="w-[2px] bg-gray-300 ml-[24px] mt-[-70px] "></div>

          <div className="w-[306px]  ml-[14px] mt-[-70px]">
            <div className="flex self-stretch justify-start items-start flex-col gap-[23px]">
              <p className="self-stretch text-[#064771] text-[22px] font-semibold leading-5">
                Teaser Controls
              </p>
              <div className="self-stretch text-[#393939] text-sm">
                Use the buttons to toggle the visibility of information you want to show or hide.
                Checkboxed content cannot be toggled off, as it forms the core of the presentation.
              </div>

              <div className="flex justify-start items-start flex-col gap-8 w-[228px]">
                {toggleFields.map(({ key, label }) => (
                  <Controller
                    key={key}
                    control={control}
                    name={`toggles.${key}`}
                    render={({ field }) => (
                      <div className="flex items-center gap-[22px] text-nowrap">
                        <div
                          className="w-[39px] h-[24px] rounded-full cursor-pointer flex items-center"
                          style={{
                            backgroundColor: field.value ? '#0C5577' : '#E5E7EB',
                            padding: '1.5px',
                            justifyContent: field.value ? 'flex-end' : 'flex-start',
                          }}
                          onClick={() => field.onChange(!field.value)}
                        >
                          <div
                            style={{
                              width: '21px',
                              height: '21px',
                              borderRadius: '50%',
                              backgroundColor: 'white',
                            }}
                          />
                        </div>
                        <span className="text-[#30313D] leading-[19.2857px]">{label}</span>
                      </div>
                    )}
                  />
                ))}
              </div>

              <div className="flex self-stretch justify-start items-start flex-col gap-2.5 py-2.5 pr-2.5 pl-[8px] mt-[20px]">
                <div className="flex self-stretch justify-start items-start flex-col gap-8">
                  {[
                    { key: 'teaserName', label: 'Teaser Name' },
                    { key: 'industry', label: 'Industry' },
                  ].map((item) => {
                    const isChecked = checkedItems[item.key as keyof typeof checkedItems];

                    return (
                      <div
                        key={item.key}
                        className="flex self-stretch justify-start items-center flex-row gap-[13px]"
                      >
                        <div className="flex justify-start items-center flex-row gap-[5px]">
                          <div className="w-[6px] h-[6px] bg-[#EC1D42] rounded-full" />
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleChange(item.key as keyof typeof checkedItems)}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-[24px] h-[24px] rounded-md flex items-center justify-center transition-colors duration-200 ${
                                isChecked
                                  ? 'bg-[#0C5577]'
                                  : 'bg-transparent border border-[#0C5577]'
                              }`}
                            >
                              {isChecked && (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M18.9348 7.08535C19.1638 7.29527 19.1793 7.65109 18.9693 7.8801L10.7193 16.8801C10.6157 16.9932 10.4703 17.059 10.3169 17.0624C10.1635 17.0657 10.0154 17.0062 9.90694 16.8978L6.15694 13.1478C5.93727 12.9281 5.93727 12.5719 6.15694 12.3523C6.37661 12.1326 6.73277 12.1326 6.95244 12.3523L10.287 15.6868L18.14 7.11991C18.35 6.8909 18.7058 6.87543 18.9348 7.08535Z"
                                    fill="white"
                                    stroke="white"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          </label>
                        </div>
                        <span className="text-[#000000] leading-[19.2857px]">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-2 mt-[50px]">
          <div className="  w-[1290px] h-[364px] p-5 mb-4">
            <div className="flex items-center gap-2 mb-5 mt-[-40px]">
              <Label text="Teaser Details" required />
            </div>

            <Controller
              name="teaser_details"
              control={control}
              render={({ field }) => (
                <TextArea value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
              )}
            />
          </div>

          <div className=" w-[1290px]  p-5 mb-4 h-">
            <div className=" flex">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_180_33390)">
                  <path
                    d="M23.2715 9.41927C21.7205 6.89327 18.1925 2.65527 12.0005 2.65527C5.80854 2.65527 2.28054 6.89327 0.72954 9.41927C0.250068 10.1948 -0.00390625 11.0885 -0.00390625 12.0003C-0.00390625 12.912 0.250068 13.8058 0.72954 14.5813C2.28054 17.1073 5.80854 21.3453 12.0005 21.3453C18.1925 21.3453 21.7205 17.1073 23.2715 14.5813C23.751 13.8058 24.005 12.912 24.005 12.0003C24.005 11.0885 23.751 10.1948 23.2715 9.41927ZM21.5665 13.5343C20.2345 15.7003 17.2195 19.3453 12.0005 19.3453C6.78154 19.3453 3.76654 15.7003 2.43454 13.5343C2.14967 13.0733 1.99879 12.5421 1.99879 12.0003C1.99879 11.4584 2.14967 10.9272 2.43454 10.4663C3.76654 8.30027 6.78154 4.65527 12.0005 4.65527C17.2195 4.65527 20.2345 8.29627 21.5665 10.4663C21.8514 10.9272 22.0023 11.4584 22.0023 12.0003C22.0023 12.5421 21.8514 13.0733 21.5665 13.5343Z"
                    fill="#064771"
                  />
                  <path
                    d="M12 7C11.0111 7 10.0444 7.29324 9.22215 7.84265C8.39991 8.39206 7.75904 9.17295 7.3806 10.0866C7.00217 11.0002 6.90315 12.0055 7.09608 12.9755C7.289 13.9454 7.76521 14.8363 8.46447 15.5355C9.16373 16.2348 10.0546 16.711 11.0246 16.9039C11.9945 17.0969 12.9998 16.9978 13.9134 16.6194C14.827 16.241 15.6079 15.6001 16.1574 14.7779C16.7068 13.9556 17 12.9889 17 12C16.9984 10.6744 16.4711 9.40356 15.5338 8.46622C14.5964 7.52888 13.3256 7.00159 12 7ZM12 15C11.4067 15 10.8266 14.8241 10.3333 14.4944C9.83994 14.1648 9.45543 13.6962 9.22836 13.1481C9.0013 12.5999 8.94189 11.9967 9.05765 11.4147C9.1734 10.8328 9.45912 10.2982 9.87868 9.87868C10.2982 9.45912 10.8328 9.1734 11.4147 9.05764C11.9967 8.94189 12.5999 9.0013 13.1481 9.22836C13.6962 9.45542 14.1648 9.83994 14.4944 10.3333C14.8241 10.8266 15 11.4067 15 12C15 12.7956 14.6839 13.5587 14.1213 14.1213C13.5587 14.6839 12.7957 15 12 15Z"
                    fill="#064771"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_180_33390">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>

              <span className="text-[#064771] text-[22px] text-center font-semibold leading-5 pl-2 mb-[-40px]">
                Website Frontend Preview
              </span>
            </div>
            <div className="flex  h-[562px] mt-[10px]">
              <div
                className="w-[507px] h-[562px] rounded-[15px] bg-cover bg-center"
                style={{
                  backgroundImage: `
      linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.7) 100%),
      url('/path/to/your/image.jpg')
    `,
                }}
              ></div>

              <Frontend
                imageUrl="/picture1.png"
                title={teaserHeading}
                location={selectedCountry?.name || 'N/A'}
                industry={industryString}
                sellerRank={sellerRank || 'Not Disclosed'}
                businessFeatures={businessFeatures}
                dealHighlights={[
                  {
                    icon: (
                      <svg
                        width="19"
                        height="21"
                        viewBox="0 0 19 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.54 0.500003C15.1373 0.499957 14.7682 0.499919 14.4679 0.540292C14.1372 0.584748 13.7877 0.689353 13.5003 0.976814C13.2127 1.26428 13.1082 1.61379 13.0637 1.94447C13.0233 2.24476 13.0234 2.61391 13.0234 3.01652V15.1929C13.0234 15.5955 13.0233 15.9646 13.0637 16.2649C13.1082 16.5956 13.2127 16.9451 13.5003 17.2325C13.7877 17.5201 14.1372 17.6246 14.4679 17.6691C14.7682 17.7095 15.1373 17.7095 15.54 17.7094H15.6233C16.0259 17.7095 16.395 17.7095 16.6953 17.6691C17.026 17.6246 17.3755 17.5201 17.6629 17.2325C17.9504 16.9451 18.055 16.5956 18.0995 16.2649C18.1398 15.9646 18.1398 15.5955 18.1397 15.1929V3.01653C18.1398 2.61392 18.1398 2.24476 18.0995 1.94447C18.055 1.61379 17.9504 1.26428 17.6629 0.976814C17.3755 0.689353 17.026 0.584748 16.6953 0.540292C16.395 0.499919 16.0259 0.499957 15.6233 0.500003H15.54ZM14.4892 1.96221L14.4869 1.96349L14.4857 1.96576C14.4847 1.96755 14.4832 1.97064 14.4813 1.97533C14.4729 1.99559 14.4587 2.04058 14.4466 2.1304C14.4203 2.32642 14.4188 2.59992 14.4188 3.05816V15.1512C14.4188 15.6095 14.4203 15.8829 14.4466 16.0789C14.4587 16.1688 14.4729 16.2138 14.4813 16.234C14.4832 16.2388 14.4847 16.2418 14.4857 16.2436L14.4869 16.2459L14.4892 16.2471L14.4922 16.2486C14.4939 16.2495 14.4961 16.2505 14.4988 16.2515C14.5191 16.2599 14.564 16.2741 14.6539 16.2862C14.8499 16.3125 15.1234 16.314 15.5816 16.314C16.0398 16.314 16.3133 16.3125 16.5093 16.2862C16.5992 16.2741 16.6442 16.2599 16.6644 16.2515C16.6691 16.2496 16.6722 16.2482 16.674 16.2471L16.6763 16.2459L16.6775 16.2436C16.6785 16.2418 16.68 16.2388 16.6819 16.234C16.6902 16.2138 16.7045 16.1688 16.7166 16.0789C16.7429 15.8829 16.7444 15.6095 16.7444 15.1512V3.05816C16.7444 2.59992 16.7429 2.32642 16.7166 2.1304C16.7045 2.04058 16.6902 1.99559 16.6819 1.97533C16.68 1.97064 16.6785 1.96755 16.6775 1.96576L16.6763 1.96349L16.674 1.96221C16.6722 1.96127 16.6691 1.95977 16.6644 1.95784C16.6442 1.94951 16.5992 1.93527 16.5093 1.9232C16.3133 1.89685 16.0398 1.89537 15.5816 1.89537C15.1234 1.89537 14.8499 1.89685 14.6539 1.9232C14.564 1.93527 14.5191 1.94951 14.4988 1.95784C14.494 1.95977 14.491 1.96127 14.4892 1.96221Z"
                          fill="black"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.02829 3.29077H9.11155C9.51415 3.29073 9.88327 3.29069 10.1835 3.33106C10.5142 3.37552 10.8637 3.48012 11.1512 3.76759C11.4387 4.05505 11.5433 4.40456 11.5877 4.73524C11.6281 5.03553 11.6281 5.40467 11.628 5.80729V15.193C11.6281 15.5956 11.6281 15.9647 11.5877 16.265C11.5433 16.5957 11.4387 16.9451 11.1512 17.2326C10.8637 17.5201 10.5142 17.6247 10.1835 17.6692C9.88327 17.7095 9.51415 17.7095 9.11155 17.7094H9.02829C8.62568 17.7095 8.25647 17.7095 7.95619 17.6692C7.62549 17.6247 7.276 17.5201 6.98853 17.2326C6.70107 16.9451 6.59647 16.5957 6.55201 16.265C6.51164 15.9647 6.51168 15.5956 6.51172 15.193V5.8073C6.51168 5.40468 6.51164 5.03553 6.55201 4.73524C6.59647 4.40456 6.70107 4.05505 6.98853 3.76759C7.276 3.48012 7.62549 3.37552 7.95619 3.33106C8.25647 3.29069 8.62559 3.29073 9.02829 3.29077ZM7.97517 4.75426L7.97749 4.75298L7.97535 16.246L7.97396 16.2437C7.97303 16.2419 7.97145 16.2388 7.96959 16.2341C7.96122 16.2139 7.94698 16.1689 7.93489 16.079C7.90856 15.883 7.90708 15.6095 7.90708 15.1513V5.84893C7.90708 5.39069 7.90856 5.11719 7.93489 4.92117C7.94698 4.83135 7.96122 4.78636 7.96959 4.7661C7.97145 4.76141 7.97303 4.75832 7.97396 4.75653L7.97517 4.75426ZM7.97535 16.246L7.97749 4.75298L7.98103 4.75124L7.98708 4.74861C8.00736 4.74028 8.05229 4.72604 8.14215 4.71397C8.33815 4.68762 8.61164 4.68614 9.06987 4.68614C9.5281 4.68614 9.80159 4.68762 9.9976 4.71397C10.0875 4.72604 10.1325 4.74028 10.1527 4.74861C10.1574 4.75054 10.1605 4.75204 10.1622 4.75298L10.1646 4.75426L10.1658 4.75653C10.1668 4.75832 10.1683 4.76141 10.1702 4.7661C10.1785 4.78636 10.1928 4.83135 10.2049 4.92117C10.2312 5.11719 10.2327 5.39069 10.2327 5.84893V15.1513C10.2327 15.6095 10.2312 15.883 10.2049 16.079C10.1928 16.1689 10.1785 16.2139 10.1702 16.2341C10.1683 16.2388 10.1668 16.2419 10.1658 16.2437L10.1646 16.246L10.1622 16.2472C10.1611 16.2478 10.1594 16.2487 10.1569 16.2498C10.1557 16.2504 10.1543 16.2509 10.1527 16.2516C10.1325 16.2599 10.0875 16.2742 9.9976 16.2863C9.80159 16.3126 9.5281 16.3141 9.06987 16.3141C8.61164 16.3141 8.33815 16.3126 8.14215 16.2863C8.05229 16.2742 8.00736 16.2599 7.98708 16.2516C7.98233 16.2497 7.97926 16.2482 7.97749 16.2472L7.97535 16.246Z"
                          fill="black"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M2.51653 7.01172C2.11391 7.01168 1.74476 7.01164 1.44447 7.05201C1.11379 7.09647 0.764276 7.20107 0.476814 7.48853C0.189353 7.77599 0.0847475 8.12551 0.0402916 8.45619C-8.06641e-05 8.75647 -4.33871e-05 9.12559 3.12465e-06 9.52829V15.193C-4.33871e-05 15.5956 -8.06641e-05 15.9647 0.0402916 16.265C0.0847475 16.5957 0.189353 16.9452 0.476814 17.2326C0.764276 17.5201 1.11379 17.6247 1.44447 17.6692C1.74476 17.7095 2.11392 17.7095 2.51653 17.7094H2.59978C3.0024 17.7095 3.37155 17.7095 3.67184 17.6692C4.00253 17.6247 4.35204 17.5201 4.6395 17.2326C4.92697 16.9452 5.03157 16.5957 5.07603 16.265C5.1164 15.9647 5.11636 15.5956 5.11631 15.193V9.52829C5.11636 9.12559 5.1164 8.75647 5.07603 8.45619C5.03157 8.12551 4.92697 7.77599 4.6395 7.48853C4.35204 7.20107 4.00253 7.09647 3.67184 7.05201C3.37155 7.01164 3.0024 7.01168 2.59979 7.01172H2.51653ZM1.46576 8.47393L1.46349 8.47521L1.46221 8.47748C1.46127 8.47927 1.45977 8.48236 1.45784 8.48705C1.44951 8.50731 1.43527 8.55229 1.4232 8.64215C1.39685 8.83815 1.39537 9.11164 1.39537 9.56987V15.1513C1.39537 15.6095 1.39685 15.883 1.4232 16.079C1.43527 16.1689 1.44951 16.2139 1.45784 16.2341C1.45977 16.2388 1.46127 16.2419 1.46221 16.2437L1.46312 16.2453L1.46576 16.2472C1.46755 16.2482 1.47064 16.2497 1.47533 16.2516C1.49559 16.2599 1.54058 16.2742 1.6304 16.2863C1.82642 16.3126 2.09992 16.3141 2.55816 16.3141C3.0164 16.3141 3.28989 16.3126 3.48591 16.2863C3.57574 16.2742 3.62072 16.2599 3.64098 16.2516C3.64568 16.2497 3.64876 16.2482 3.65056 16.2472L3.65283 16.246L3.65411 16.2437L3.65617 16.2395L3.65848 16.2341C3.66682 16.2139 3.68104 16.1689 3.69311 16.079C3.71947 15.883 3.72096 15.6095 3.72096 15.1513V9.56987C3.72096 9.11164 3.71947 8.83815 3.69311 8.64215C3.68104 8.55229 3.66682 8.50731 3.65848 8.48705C3.65655 8.48236 3.65505 8.47927 3.65411 8.47748L3.65283 8.47521L3.65056 8.47393C3.64876 8.47299 3.64568 8.47149 3.64098 8.46956C3.62072 8.46122 3.57574 8.44699 3.48591 8.43492C3.28989 8.40856 3.0164 8.40708 2.55816 8.40708C2.09992 8.40708 1.82642 8.40856 1.6304 8.43492C1.54058 8.44699 1.49559 8.46122 1.47533 8.46956C1.47064 8.47149 1.46755 8.47299 1.46576 8.47393Z"
                          fill="black"
                        />
                        <path
                          d="M0.697677 19.1047C0.312355 19.1047 0 19.4171 0 19.8024C0 20.1877 0.312355 20.5001 0.697677 20.5001H17.4419C17.8272 20.5001 18.1396 20.1877 18.1396 19.8024C18.1396 19.4171 17.8272 19.1047 17.4419 19.1047H0.697677Z"
                          fill="black"
                        />
                      </svg>
                    ),
                    label: 'Sales Volume (Monthly)',
                    value: monthlyRevenue,
                  },
                  {
                    icon: (
                      <svg
                        width="22"
                        height="23"
                        viewBox="0 0 22 23"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.99997 4.49999C6.99997 6.15683 5.65683 7.49997 3.99999 7.49997C2.34314 7.49997 1 6.15683 1 4.49999C1 2.84314 2.34314 1.5 3.99999 1.5C5.65683 1.5 6.99997 2.84314 6.99997 4.49999Z"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M21.0019 4.49999C21.0019 6.15683 19.6588 7.49997 18.0019 7.49997C16.345 7.49997 15.002 6.15683 15.002 4.49999C15.002 2.84314 16.345 1.5 18.0019 1.5C19.6588 1.5 21.0019 2.84314 21.0019 4.49999Z"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M6.99997 18.5C6.99997 20.1569 5.65683 21.5 3.99999 21.5C2.34314 21.5 1 20.1569 1 18.5C1 16.8431 2.34314 15.5 3.99999 15.5C5.65683 15.5 6.99997 16.8431 6.99997 18.5Z"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M21.0019 18.5C21.0019 20.1569 19.6588 21.5 18.0019 21.5C16.345 21.5 15.002 20.1569 15.002 18.5C15.002 16.8431 16.345 15.5 18.0019 15.5C19.6588 15.5 21.0019 16.8431 21.0019 18.5Z"
                          stroke="black"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M7.00195 18.5H15.0019"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M7.00195 4.5H15.0019"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 15.5V7.5"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M4 15.5V7.5"
                          stroke="black"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                    label: 'M&A Structure',
                    value: mnaStructureValue,
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 10.5C0 4.97715 4.47714 0.5 9.99997 0.5C15.5228 0.5 19.9999 4.97715 19.9999 10.5C19.9999 16.0228 15.5228 20.5 9.99997 20.5C4.47714 20.5 0 16.0228 0 10.5ZM9.99997 1.93442C5.26935 1.93442 1.43443 5.76936 1.43443 10.5C1.43443 15.2305 5.26935 19.0656 9.99997 19.0656C14.7305 19.0656 18.5654 15.2305 18.5654 10.5C18.5654 5.76936 14.7305 1.93442 9.99997 1.93442ZM11.1324 15.0302C11.1324 15.6556 10.6254 16.1626 10 16.1626C9.37456 16.1626 8.86756 15.6556 8.86756 15.0302C8.86756 14.4047 9.37456 13.8977 10 13.8977C10.6254 13.8977 11.1324 14.4047 11.1324 15.0302ZM7.81076 8.61298C7.81076 7.58942 8.69419 6.61233 10.0002 6.61233C11.3061 6.61233 12.1895 7.58942 12.1895 8.61298C12.1895 9.35462 11.7818 9.73352 11.0789 10.1606C11.0004 10.2082 10.91 10.2608 10.8132 10.317C10.5365 10.4776 10.2083 10.6683 9.96159 10.8605C9.59566 11.1456 9.16969 11.6056 9.16969 12.3123C9.16971 12.7709 9.54151 13.1427 10.0002 13.1427C10.4567 13.1427 10.8272 12.7743 10.8306 12.3186L10.8314 12.3173C10.8445 12.2966 10.8833 12.2479 10.9824 12.1707C11.1357 12.0513 11.3063 11.9524 11.5337 11.8206C11.6522 11.7519 11.7863 11.6742 11.9412 11.5801C12.7482 11.0898 13.8504 10.2797 13.8504 8.61298C13.8504 6.6167 12.167 4.95142 10.0002 4.95142C7.83331 4.95142 6.14985 6.6167 6.14985 8.61298C6.14985 9.07163 6.52167 9.44344 6.98031 9.44344C7.43896 9.44344 7.81076 9.07163 7.81076 8.61298Z"
                          fill="black"
                        />
                      </svg>
                    ),
                    label: 'Reason',
                    value: sellingReasonValue,
                  },
                  {
                    icon: (
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.2561 9.48876C7.3672 9.48876 6.49825 9.22517 5.75916 8.73132C5.02006 8.23748 4.444 7.53555 4.10384 6.71431C3.76367 5.89307 3.67466 4.9894 3.84808 4.11757C4.0215 3.24575 4.44954 2.44493 5.07809 1.81638C5.70665 1.18783 6.50747 0.759777 7.37929 0.58636C8.25112 0.412944 9.15479 0.501947 9.97603 0.842116C10.7973 1.18229 11.4992 1.75834 11.993 2.49744C12.4869 3.23654 12.7505 4.10548 12.7505 4.99438C12.7505 6.18637 12.277 7.32953 11.4341 8.17239C10.5912 9.01525 9.44809 9.48876 8.2561 9.48876ZM8.2561 1.83548C7.62117 1.83548 7.0005 2.02375 6.47257 2.3765C5.94464 2.72925 5.53318 3.23063 5.2902 3.81723C5.04722 4.40383 4.98365 5.04931 5.10751 5.67204C5.23138 6.29477 5.53713 6.86679 5.9861 7.31575C6.43506 7.76472 7.00708 8.07047 7.62981 8.19433C8.25254 8.3182 8.89802 8.25463 9.48462 8.01165C10.0712 7.76867 10.5726 7.35721 10.9253 6.82928C11.2781 6.30135 11.4664 5.68068 11.4664 5.04575C11.4664 4.62417 11.3833 4.20672 11.222 3.81723C11.0607 3.42774 10.8242 3.07384 10.5261 2.77574C10.228 2.47764 9.87411 2.24117 9.48462 2.07984C9.09513 1.91851 8.67768 1.83548 8.2561 1.83548Z"
                          fill="black"
                        />
                        <path
                          d="M11.8331 10.2657C8.35856 9.48383 4.72363 9.86041 1.48317 11.3379C1.03751 11.5508 0.661506 11.8859 0.39893 12.3042C0.136353 12.7225 -0.00198588 13.2068 2.15405e-05 13.7007V17.5209C2.15405e-05 17.6912 0.0676664 17.8545 0.188075 17.9749C0.308484 18.0953 0.471793 18.1629 0.642076 18.1629C0.81236 18.1629 0.975669 18.0953 1.09608 17.9749C1.21649 17.8545 1.28413 17.6912 1.28413 17.5209V13.7007C1.27854 13.4507 1.34604 13.2046 1.47834 12.9924C1.61064 12.7803 1.80199 12.6114 2.02891 12.5064C3.98093 11.6051 6.10681 11.1427 8.25684 11.1517C9.46154 11.1502 10.6621 11.2924 11.8331 11.5755V10.2657Z"
                          fill="black"
                        />
                        <path d="M15.866 16.3716H11.9238V17.2705H15.866V16.3716Z" fill="black" />
                        <path
                          d="M19.0045 12.5578H15.6851V13.8419H18.3625V19.2159H9.26458V13.8419H13.3095V14.1116C13.3095 14.2819 13.3772 14.4452 13.4976 14.5656C13.618 14.686 13.7813 14.7536 13.9516 14.7536C14.1219 14.7536 14.2852 14.686 14.4056 14.5656C14.526 14.4452 14.5936 14.2819 14.5936 14.1116V11.614C14.5936 11.4437 14.526 11.2804 14.4056 11.16C14.2852 11.0396 14.1219 10.9719 13.9516 10.9719C13.7813 10.9719 13.618 11.0396 13.4976 11.16C13.3772 11.2804 13.3095 11.4437 13.3095 11.614V12.5578H8.62252C8.45224 12.5578 8.28893 12.6254 8.16852 12.7459C8.04811 12.8663 7.98047 13.0296 7.98047 13.1999V19.858C7.98047 20.0282 8.04811 20.1916 8.16852 20.312C8.28893 20.4324 8.45224 20.5 8.62252 20.5H19.0045C19.1748 20.5 19.3381 20.4324 19.4585 20.312C19.579 20.1916 19.6466 20.0282 19.6466 19.858V13.1999C19.6466 13.0296 19.579 12.8663 19.4585 12.7459C19.3381 12.6254 19.1748 12.5578 19.0045 12.5578Z"
                          fill="black"
                        />
                      </svg>
                    ),
                    label: 'Employee Count',
                    value: employeeCountValue,
                  },
                  {
                    icon: (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_180_33470)">
                          <path
                            d="M10.0013 20.5003V9.83366M10.0013 10.5003V14.5003M10.0013 10.5003C10.0013 7.55481 7.61349 5.16699 4.66797 5.16699H0.667969V9.16699C0.667969 12.1125 3.05578 14.5003 6.0013 14.5003H10.0013M10.0013 10.5003H14.0013C16.9468 10.5003 19.3346 8.11251 19.3346 5.16699V1.16699H15.3346C12.3891 1.16699 10.0013 3.55481 10.0013 6.50033V10.5003ZM10.0013 10.5003L15.3346 5.16699M10.0013 14.5003L4.66797 9.16699"
                            stroke="black"
                            strokeWidth="1.33333"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_180_33470">
                            <rect
                              width="20"
                              height="20"
                              fill="white"
                              transform="translate(0 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                    ),
                    label: 'Founded',
                    value: year_founded instanceof Date ? year_founded.getFullYear().toString() : String(year_founded || ''),
                  },
                ]}
                desiredInvestment={expectedInvestment ? `$${expectedInvestment}` : ''}
                stake={mispValue ? (mispValue.includes('%') ? mispValue : `${mispValue}%`) : ''}
              />
            </div>
          </div>

          <div className="flex justify-between items-center flex-row gap-[16px] mt-[70px]  w-full ">
            <div
              className="flex justify-start items-end flex-row gap-[10.06532096862793px] w-[93px] h-[34px]"
              style={{ width: '93px' }}
            >
              <button
                className="flex justify-center items-center flex-row gap-[4.313709259033203px] py-[5.032660484313965px] px-[6.470563888549805px] bg-[#FFF6F7] border-solid border-[#DF272A] border-[0.7664670944213867px] rounded-[49.82036209106445px] w-[100px] h-[34px] "
                style={{ width: '100px' }}
                onClick={() => navigate('/seller-portal')}
                type="button"
              >
                <svg
                  width="20"
                  height="19"
                  viewBox="0 0 20 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="9.84214"
                    cy="9.49106"
                    r="8.58443"
                    stroke="#DF272A"
                    strokeWidth="1.22635"
                  />
                  <path
                    d="M13.3253 6.73193L7.08203 12.9752M13.5204 13.1703L7.17867 6.82857"
                    stroke="#DF272A"
                    strokeWidth="1.53293"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[#DF272A] font-semibold">Cancel</span>
              </button>
            </div>

            <div className="relative flex items-start gap-4  pr-2">
              {isEditMode && (
                <button
                  className="flex justify-start items-end flex-row gap-[10.06532096862793px] w-[190px] h-[34px]"
                  style={{ width: '190px' }}
                  type="button"
                  onClick={handleSubmit(onDraftCancel)}
                  disabled={isSubmitting}
                >
                  <div
                    className="flex justify-center items-center flex-row gap-1.5 py-[5.032660484313965px] px-3 bg-[#F1FBFF] border-solid border-[#0C5577] border-[0.7664670944213867px] rounded-[49.82036209106445px] w-[200px] h-[34px]"
                    style={{ width: '190px' }}
                  >
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.0866 15.1436V10.8322H5.91294V15.1436M13.6734 15.1436H3.32611C2.37367 15.1436 1.60156 14.3715 1.60156 13.419V3.07172C1.60156 2.11928 2.37367 1.34717 3.32611 1.34717H10.3723C10.8296 1.34717 11.2683 1.52886 11.5917 1.85228L14.8928 5.15343C15.2163 5.47686 15.398 5.91549 15.398 6.37288V13.419C15.398 14.3715 14.6259 15.1436 13.6734 15.1436Z"
                        stroke="#0C5577"
                        strokeWidth="1.53293"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span className="text-[#0C5577] text-nowrap">Save and Close</span>
                  </div>
                </button>
              )}

              <button
                className="flex justify-start items-end flex-row gap-[10.06532096862793px] w-[157px] h-[34px]"
                style={{ width: '157px' }}
                type="button"
                onClick={handleSubmit(onDraft)}
                disabled={isSubmitting}
              >
                <div
                  className="flex justify-center items-center flex-row gap-1.5 py-[5.032660484313965px] px-3 bg-[#F1FBFF] border-solid border-[#0C5577] border-[0.7664670944213867px] rounded-[49.82036209106445px] w-[157px] h-[34px]"
                  style={{ width: '157px' }}
                >
                  <svg
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.0866 15.1436V10.8322H5.91294V15.1436M13.6734 15.1436H3.32611C2.37367 15.1436 1.60156 14.3715 1.60156 13.419V3.07172C1.60156 2.11928 2.37367 1.34717 3.32611 1.34717H10.3723C10.8296 1.34717 11.2683 1.52886 11.5917 1.85228L14.8928 5.15343C15.2163 5.47686 15.398 5.91549 15.398 6.37288V13.419C15.398 14.3715 14.6259 15.1436 13.6734 15.1436Z"
                      stroke="#0C5577"
                      strokeWidth="1.53293"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <span className="text-[#0C5577] ">Save as Draft</span>
                </div>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex justify-start items-end flex-row gap-[10.06532096862793px] h-[34px]"
              >
                <div className="flex justify-center items-center flex-row gap-1.5 py-[5.032660484313965px] px-3 bg-[#064771] rounded-[49.82036209106445px] h-[34px] disabled:opacity-50">
                  {isSubmitting ? (
                    <span className="animate-spin border-4 border-white border-t-transparent rounded-full w-5 h-5"></span>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.80245 10.7743L16.7508 1.82919M8.05681 11.1765L10.0859 15.2347C10.5762 16.2154 10.8214 16.7057 11.1302 16.8372C11.3983 16.9513 11.7047 16.9306 11.955 16.7816C12.2434 16.6099 12.4206 16.091 12.7749 15.0534L16.6087 3.82585C16.9174 2.92175 17.0717 2.4697 16.9661 2.17065C16.8742 1.9105 16.6696 1.70587 16.4095 1.61395C16.1104 1.5083 15.6583 1.66266 14.7542 1.97137L3.52664 5.80519C2.48902 6.15949 1.97021 6.33665 1.79847 6.62508C1.64942 6.87537 1.62877 7.18178 1.74288 7.44977C1.87437 7.75864 2.36471 8.00387 3.3454 8.49415L7.40353 10.5233C7.56516 10.6041 7.64596 10.6444 7.7159 10.6984C7.77807 10.7463 7.83376 10.802 7.8816 10.8641C7.93565 10.9341 7.97601 11.0149 8.05681 11.1765Z"
                          stroke="white"
                          strokeWidth="1.53293"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-[#FFF] whitespace-nowrap">Publish</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default TeaserCenter;
