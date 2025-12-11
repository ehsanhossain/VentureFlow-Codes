import React, { useEffect, useState, useRef, useCallback } from 'react';
import Pagination from '../../../components/Pagination';
import ArrowIcon from '../../../assets/svg/ArrowIcon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/table/table';
import api from '../../../config/api';

import { ActionButton } from '../../../components/ActionButton';
import clsx from 'clsx';
import { SearchInput } from '../../../components/SearchInput';
import { showAlert } from '../../../components/Alert';
import { Controller, useForm } from 'react-hook-form';
import DatePicker from '../../../components/DatePicker';
import { Dropdown, Country as DropdownCountry } from '../components/Dropdown';
import SelectPicker from '../../../components/SelectPicker';
import { Industry, IndustryDropdown } from '../components/IndustryDropdown';
import { Input } from '../../../components/Input';
import { ApproxInput } from '../../../components/ApproxInput';
import { Check, Pause } from 'lucide-react';

const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Deal Closed', label: 'Deal Closed' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Interested', label: 'Interested' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Not Interested', label: 'Not Interested' },
  { value: 'Canceled', label: 'Canceled' },
  { value: 'In-Active', label: 'In-Active' },
  { value: 'Drafts', label: 'Drafts' },
];

const sourceOptions = [
  { value: '1', label: 'Partner' },
  { value: '0', label: 'TCG' },
];



export interface FilterState {
  registered: string;
  country: string;
  structure: string;
  status: string;
  broderIndustries: Industry[];
  priorityIndustries: Industry[];
  [key: string]: unknown;
}

interface FormValues {
  RegisterWithin: Date | null;
  dealTimeline: Date | null;
  HQCountry: string;
  source: string;
  currency: string[];
  annualRevenue: string;

  partnershipStructure: string;
  status: string;
  broderIndustries: Industry[];
  priorityIndustries: Industry[];
  maximumInvestorSharing: string;

  expectedInvestmentAmount: string;
  showOnlyPinned: boolean;
}

type PausedTeaserProps = {
  onClearFilters: () => void;
  initialState?: FilterState;
};


interface Currency {
  id: number;
  currency_name: string;
}

interface Country {
  id: number;
  name: string;
  flagSrc?: string;
  status?: string;
  [key: string]: unknown;
}

interface ExtendedIndustry extends Industry {
  status: number;
  sub_industries?: ExtendedIndustry[];
}

interface Seller {
  id: number;
  seller_id: string;
  created_at: string;
  teaser_center?: {
    status: number;
  };
  company_overview?: {
    reg_name?: string;
    name?: string; // Add name
    origin_country_flag_svg?: string;
    rating?: string | number;
    company_type?: string;
    status?: string;
    hq_country?: string;
    company_rank?: string;
    image?: string;
    [key: string]: unknown;
  };
  partnership_details?: {
    partnership_affiliation?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const PausedTeaser = ({
  onClearFilters,
  initialState,
}: PausedTeaserProps): JSX.Element => {
  localStorage.removeItem('seller_id');

  const {
    control,
    handleSubmit,
    register,
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      RegisterWithin: null,
      dealTimeline: null,
      HQCountry: '',
      partnershipStructure: '',
      status: '',
      source: '',
      currency: [],
      annualRevenue: '',
      broderIndustries: [],
      priorityIndustries: [],

      maximumInvestorSharing: '',

      expectedInvestmentAmount: '',
      showOnlyPinned: false,
    } as Partial<FormValues>,
  });

  const [industries, setIndustries] = useState<ExtendedIndustry[]>([]);
  const [subIndustries, setSubIndustries] = useState<ExtendedIndustry[]>([]);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await api.get('/api/industries');

        const formatted = (response.data as ExtendedIndustry[]).map((industry) => ({
          id: industry.id,
          name: industry.name,
          status: industry.status,
          sub_industries: industry.sub_industries || [],
        }));
        setIndustries(formatted);
      } catch  {
        showAlert({ type: 'error', message: 'Failed to fetch industries' });
      }
    };

    fetchIndustries();
  }, []);
  const selectedIndustries = watch('broderIndustries');

  useEffect(() => {
    if (!selectedIndustries || selectedIndustries.length === 0) {
      setSubIndustries([]);
      return;
    }

    const selectedIds = selectedIndustries.map((ind) => ind.id);

    const subs = industries
      .filter((ind: ExtendedIndustry) => selectedIds.includes(ind.id))
      .flatMap((ind: ExtendedIndustry) => ind.sub_industries || []);

    const formattedSubs = subs.map((sub: ExtendedIndustry) => ({
      id: sub.id,
      name: sub.name,
      status: sub.status,
    }));

    setSubIndustries(formattedSubs);
  }, [selectedIndustries, industries]);

  const [currencyOptions, setCurrencyOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await api.get('/api/currencies');

        const currencies = Array.isArray(response.data.data) ? response.data.data : response.data;

        const formatted = currencies.map((currency: Currency) => ({
          value: String(currency.id),
          label: currency.currency_name,
        }));

        setCurrencyOptions(formatted);
      } catch  {
        showAlert({ type: 'error', message: 'Error fetching currencies' });
      }
    };

    fetchCurrencies();
  }, []);

  const defaultInitialState: FilterState = {
    registered: '',
    country: '',
    structure: '',
    status: '',
    broderIndustries: [],
    priorityIndustries: [],
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [filters, setFilters] = useState<Record<string, unknown>>(initialState || defaultInitialState);
  const filterButtonRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isModalOpen && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      const modalWidth = 782;
      const viewportWidth = window.innerWidth;

      let leftPosition = rect.right + window.scrollX - modalWidth;

      if (leftPosition + modalWidth > viewportWidth - 20) {
        leftPosition = viewportWidth - modalWidth - 20;
      }

      if (leftPosition < 20) {
        leftPosition = 20;
      }

      setModalPosition({
        top: rect.bottom + window.scrollY - 250,
        left: leftPosition,
      });
    }
  }, [isModalOpen]);

  const filterFields = [
    {
      id: 'registered' as keyof FilterState,
      label: 'Registered Within ',
      placeholder: 'Select',
      hasIcon: false,
      iconPosition: 'left',
      options: [
        { value: '7days', label: 'Last 7 days' },
        { value: '30days', label: 'Last 30 days' },
        { value: '90days', label: 'Last 90 days' },
      ],
    },
    {
      id: 'country' as keyof FilterState,
      label: "Partner's HQ/Origin Country",
      placeholder: 'Select Related Country',
      hasIcon: true,
      iconPosition: 'right',
      options: [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
        { value: 'ca', label: 'Canada' },
      ],
    },
    {
      id: 'structure' as keyof FilterState,
      label: 'Structure',
      placeholder: 'e.g., Percentage / Success Based',
      hasIcon: true,
      iconPosition: 'right',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'success', label: 'Success Based' },
        { value: 'hybrid', label: 'Hybrid' },
      ],
    },
    {
      id: 'status' as keyof FilterState,
      label: 'Status',
      placeholder: 'Select Status',
      hasIcon: true,
      iconPosition: 'right',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };



  const handleClearFilter = () => {
    reset();
    setFilters(defaultInitialState);
    onClearFilters();
  };

  const handleApplySearch = (formValues: FormValues) => {
    let registeredAfter = '';
    if (formValues.RegisterWithin) {
      const date = new Date(formValues.RegisterWithin);
      registeredAfter = date.toISOString().split('T')[0];
    }

    const appliedFilters: Record<string, unknown> = {
      country: (formValues.HQCountry as unknown as { id: string })?.id || formValues.HQCountry || '',
      registered_after: registeredAfter,
      structure: formValues.partnershipStructure || '',
      status: formValues.status || '',
      source: formValues.source || '',
      currency: formValues.currency || '',
      annual_revenue: formValues.annualRevenue || '',
      maximum_investor_shareholding_percentage: formValues.maximumInvestorSharing || '',
      expected_investment_amount: formValues.expectedInvestmentAmount || '',
      deal_timeline: formValues.dealTimeline
        ? new Date(formValues.dealTimeline).toISOString().split('T')[0]
        : '',
      show_only_pinned: formValues.showOnlyPinned ? '1' : '0',
    };

    if (formValues.broderIndustries?.length) {
      appliedFilters.broader_industries = formValues.broderIndustries.map((item) => item.id);
    }
    if (formValues.priorityIndustries?.length) {
      appliedFilters.priority_industries = formValues.priorityIndustries.map((item) => item.id);
    }

    setFilters(appliedFilters);
    setCurrentPage(1);
    setIsModalOpen(false);
  };



  const [sellers, setSellers] = useState<Seller[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [meta, setMeta] = useState<{ total: number; [key: string]: unknown } | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentSort] = useState('');

  const fetchSellers = useCallback(async (
    page = 1,
    filters: Record<string, unknown> = {},
    sort?: string
  ) => {
    try {
      setLoading(true);

      const params = { page, search: searchQuery, sort, ...filters };

      const response = await api.get('/api/seller/teaser-center/paused', {
        params,
      });

      setSellers(response.data.data);
      setMeta(response.data.meta);
      setTotalPages(response.data.meta.last_page);
    } catch  {
      showAlert({ type: 'error', message: 'Failed to fetch sellers' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  useEffect(() => {
    const delay = setTimeout(() => {
      const queryParams = {
        search: searchQuery,
        ...filters,
        sort: currentSort,
      };

      fetchSellers(currentPage, queryParams);
      
    }, 500);

    return () => clearTimeout(delay);
  }, [currentPage, searchQuery, filters, currentSort, fetchSellers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const tableHeaders = [
    'Prospect',
    'HQ/Origin',
    'Source',
    'Declaration ID',
    'Created by',
    'Uploaded on',
    'Quick Actions',
  ];











  const handleExportData = () => {
    alert('Exporting data... (Parent function)');
  };

  const [isComponentOpen, setIsComponentOpen] = useState(false);
  const handleComponentOpen = () => {
    setIsComponentOpen(true);
  };

  const [selectedSellerIds, setSelectedSellerIds] = useState<Set<number>>(new Set());
  const handleDeleteData = async (selectedIdsArray: number[]) => {
    if (!selectedIdsArray || selectedIdsArray.length === 0) {
      alert('Please select items to delete.');
      return false;
    }

    const confirmMessage =
      selectedIdsArray.length > 1
        ? `Are you sure you want to delete these ${selectedIdsArray.length} items?`
        : 'Are you sure you want to delete this item?';

    if (window.confirm(confirmMessage)) {
      try {
        await api.delete(`/api/sellers`, {
          data: { ids: selectedIdsArray },
        });

        showAlert({
          type: 'success',
          message: `${selectedIdsArray.length} item(s) deleted successfully!`,
        });
        fetchSellers();
        return true;
      } catch {
        showAlert({
          type: 'error',
          message: 'Failed to delete items. Please try again.',
        });
        return false;
      }
    } else {
      return false;
    }
  };

  const handleBulkDeleteClick = async () => {
    const idsToDeleteArray: number[] = Array.from(selectedSellerIds);

    if (idsToDeleteArray.length === 0) {
      alert('Please select seller to delete.');
      return;
    }

    const success = await handleDeleteData(idsToDeleteArray);

    if (success) {
      setSelectedSellerIds(new Set());
    }
  };

  const handleComponentClose = () => {
    setIsComponentOpen(false);
    setSelectedSellerIds(new Set());
  };

  const handleCheckboxChange = (sellerId: number) => {
    setSelectedSellerIds((prevSelectedIds) => {
      const newSelectedIds = new Set(prevSelectedIds);
      if (newSelectedIds.has(sellerId)) {
        newSelectedIds.delete(sellerId);
      } else {
        newSelectedIds.add(sellerId);
      }

      return newSelectedIds;
    });
  };

  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    api
      .get('/api/countries')
      .then((res) => {
        setCountries(res.data);
      })

      .finally(() => setLoading(false));
  }, []);

  const getCountryById = (id: number) => countries.find((c: Country) => c.id === id);

  const [activeStatuses, setActiveStatuses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const statusMap: Record<number, boolean> = {};
    sellers.forEach((seller: Seller) => {
      statusMap[seller.id] = seller.teaser_center?.status === 1;
    });
    setActiveStatuses(statusMap);
  }, [sellers]);

  const toggleStatus = async (id: number) => {
    const newStatus = !activeStatuses[id];

    setActiveStatuses((prev) => ({
      ...prev,
      [id]: newStatus,
    }));

    try {
      await api.post(`/api/seller/${id}/status`, {
        status: newStatus ? '1' : '0',
      });
    } catch {
      showAlert({ type: 'error', message: 'Failed to update status' });

      setActiveStatuses((prev) => ({
        ...prev,
        [id]: !newStatus,
      }));
    }
  };
  return (
    <div className="bg-white">
      <div className="flex justify-between items-center px-[20px] ">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search Here" />

        <div className="flex justify-start items-center gap-4 ">
          <span className="text-sm leading-5 font-poppins text-center">
            <span className="text-gray-500">Showing</span>
            <span className="text-gray-800 font-poppins mx-1">{sellers?.length}</span>
            <span className="text-gray-500">of</span>
            <span className="text-gray-800 font-poppins mx-1">{meta?.total}</span>
            <span className="text-gray-500">Cases</span>
          </span>
          <div className="flex items-center gap-4 h-8">
            <div className="flex items-center gap-4 h-8">
              <div className="flex items-center gap-4 h-9">
                <ActionButton
                  onExport={handleExportData}
                  onDelete={handleBulkDeleteClick}
                  onOpen={handleComponentOpen}
                  onClose={handleComponentClose}
                />
              </div>

              <button>
                <div className="flex justify-center items-center flex-row gap-2 py-2 px-3 bg-[#FFFFFF] border-solid border-[#000000] border rounded h-[34px]">
                  <svg
                    width="16"
                    height="17"
                    viewBox="0 0 16 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 8.5H12"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.5 5.5H14.5"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.5 11.5H9.5"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[#000000] text-sm font-medium leading-normal font-poppins">
                    Sort By
                  </span>
                </div>
              </button>

              <button>
                <div
                  className="flex justify-center items-center gap-2 py-2 px-3 bg-white border border-gray-500 rounded-md h-[35px] cursor-pointer"
                  ref={filterButtonRef}
                  onClick={handleOpenModal}
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.82902 3.53027H13.5037C13.6 3.53027 13.6942 3.55824 13.7749 3.61078C13.8556 3.66331 13.9193 3.73815 13.9582 3.8262C13.9972 3.91425 14.0097 4.01172 13.9943 4.10676C13.9789 4.2018 13.9362 4.29033 13.8715 4.36157L9.78657 8.85495C9.70341 8.94643 9.65733 9.06562 9.65733 9.18925V12.707C9.65733 12.7888 9.63713 12.8694 9.59852 12.9415C9.55991 13.0137 9.5041 13.0752 9.43602 13.1205L7.44808 14.4458C7.37323 14.4957 7.28624 14.5244 7.19639 14.5287C7.10655 14.5331 7.0172 14.5129 6.93789 14.4705C6.85858 14.4281 6.79228 14.3649 6.74605 14.2877C6.69983 14.2105 6.67541 14.1223 6.67541 14.0323V9.18925C6.67541 9.06562 6.62933 8.94643 6.54617 8.85495L2.46128 4.36157C2.39651 4.29033 2.35383 4.2018 2.33843 4.10676C2.32303 4.01172 2.33557 3.91425 2.37452 3.8262C2.41347 3.73815 2.47716 3.66331 2.55784 3.61078C2.63853 3.55824 2.73274 3.53027 2.82902 3.53027Z"
                      stroke="#30313D"
                      strokeWidth="1.49096"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-gray-800 text-sm font-medium font-poppins">Filter</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-md z-40"
              onClick={handleCloseModal}
            />

            <div
              className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
              style={{
                top: modalPosition.top,
                left: modalPosition.left,
              }}
            >
              <div className="w-[782px] rounded-[20px] border-0 shadow-2xl bg-white">
                <div className="flex flex-col w-full items-start gap-6 p-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3.5">
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
                      </svg>
                      <h2 className="font-medium text-[#30313d] text-3xl leading-[35.7px] font-['SF_Pro_Display-Medium',Helvetica]">
                        Filter
                      </h2>
                    </div>
                    <button
                      className="w-[30px] h-[30px] rounded-[15px] border-2 border-solid border-[#30313d] p-0 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center bg-white"
                      onClick={handleCloseModal}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-col items-start gap-6 w-full">
                    <div className="flex flex-col items-center gap-[35px] w-full">
                      <div className="flex items-start gap-[53px] w-full">
                        <div className="flex-col w-[300px] h-[70px] flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              {filterFields[0].label}
                            </span>
                          </div>

                          <Controller
                            control={control}
                            name="RegisterWithin"
                            render={({ field }) => (
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select date"
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

                        <div className="flex-col w-[300px] h-[70px] flex items-start justify-between ml-[70px] ">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              Deal Timeline
                            </span>
                          </div>

                          <Controller
                            control={control}
                            name="dealTimeline"
                            render={({ field }) => (
                              <DatePicker
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Select date"
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

                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              Broder Industry Operations
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            name="broderIndustries"
                            control={control}
                            render={({ field, fieldState }) => (
                              <div className="w-full">
                                <IndustryDropdown
                                  industries={industries}
                                  multiSelect
                                  selected={field.value}
                                  onSelect={field.onChange}
                                />
                                {fieldState.error && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {fieldState.error.message}
                                  </p>
                                )}
                              </div>
                            )}
                          />
                        </div>

                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              Niche / Priority Industry
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            name="priorityIndustries"
                            control={control}
                            render={({ field }) => (
                              <IndustryDropdown
                                industries={subIndustries}
                                multiSelect
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col h-[70px] items-start justify-between flex-1">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              HQ/Origin Country
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            name="HQCountry"
                            control={control}
                            render={({ field }) => (
                              <div className="w-[300px]">
                                <Dropdown
                                  {...field}
                                  countries={countries as unknown as DropdownCountry[]}
                                  selected={
                                    getCountryById(
                                      Number(field.value)
                                    ) as unknown as DropdownCountry
                                  }
                                  onSelect={(val: DropdownCountry | DropdownCountry[]) => {
                                    if (!Array.isArray(val)) {
                                      field.onChange(
                                        (val as unknown as { id: number }).id || val
                                      );
                                    }
                                  }}
                                />
                              </div>
                            )}
                          />
                        </div>

                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex flex-col w-full gap-2">
                            <div className="flex items-center gap-1.5 w-full">
                              <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                                Maximum Investor Shareholding Percentage
                              </span>
                            </div>

                            <Controller
                              name="maximumInvestorSharing"
                              control={control}
                              render={({ field }) => (
                                <ApproxInput {...field} placeholder="e.g., 54%" />
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              Source
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            control={control}
                            name="source"
                            render={({ field }) => (
                              <SelectPicker
                                options={sourceOptions}
                                value={field.value}
                                onChange={field.onChange}
                                searchable={false}
                                placeholder="Partner / TCG"
                              />
                            )}
                          />
                        </div>

                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              {filterFields[3].label}
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                              <SelectPicker
                                options={statusOptions}
                                value={field.value}
                                onChange={field.onChange}
                                searchable={false}
                                placeholder="Select Status"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex flex-col w-full gap-2">
                            <div className="flex items-center gap-1.5 w-full">
                              <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                                Expected Investment Amount
                              </span>
                            </div>

                            <div className="flex gap-[13px]">
                              <div className="w-full bg-transparent text-gray-600 text-sm font-medium outline-none placeholder-gray-400 max-h-10 pr-2">
                                <Input
                                  {...register('expectedInvestmentAmount', {})}
                                  placeholder="what is the expected investment?"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* currency */}
                        <div className="flex flex-col w-[301px] h-[70px] items-start justify-between">
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="font-medium text-[#30313d] text-base leading-[19.3px] font-['Poppins',Helvetica]">
                              Currency
                            </span>
                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.67"
                                height="16.67"
                                viewBox="0 0 18 18"
                                fill="none"
                                className="text-gray-400 hover:text-gray-600 cursor-help"
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
                          </div>

                          <Controller
                            control={control}
                            name="currency"
                            render={({ field }) => (
                              <SelectPicker
                                options={currencyOptions}
                                value={field.value[0] || ''}
                                onChange={field.onChange}
                                searchable={false}
                                placeholder="Select Currency"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 w-full">
                      <div className="flex items-center space-x-3 mr-auto">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            {...register('showOnlyPinned')}
                            checked={isComponentOpen}
                            onChange={() => setIsComponentOpen((prev) => !prev)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#3181b6] rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064771]"></div>
                        </label>
                        <span className="text-sm font-medium text-[#064771]">Show Only Pinned</span>
                      </div>

                      <button
                        className="h-[34px] px-3 py-[5.03px] bg-[#f1faff] rounded-[49.82px] border-[0.77px] border-solid border-[#0c5577] text-[#0c5577] font-normal text-base font-['Poppins',Helvetica] hover:bg-[#e6f4ff] transition-colors cursor-pointer flex items-center"
                        onClick={handleClearFilter}
                      >
                        {' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="16"
                          viewBox="0 0 14 16"
                          fill="none"
                        >
                          <path
                            d="M8.86451 3.50036L11.2947 4.97838L12.4032 3.15929C12.8083 2.49134 12.5951 1.61022 11.9271 1.20518C11.2592 0.80015 10.3781 1.01331 9.97302 1.68126L8.86451 3.50036Z"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.47864 5.98067L9.72409 7.34502C11.0316 8.14087 11.4295 9.7468 10.7971 11.0259L9.34038 13.9961C8.87139 14.9554 7.73445 15.2894 6.8249 14.728L2.25584 11.9496C1.33918 11.3954 1.1189 10.2371 1.75132 9.37729L3.71964 6.7197C4.57234 5.56856 6.17116 5.18482 7.47864 5.98067Z"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8.2345 3.09766L11.876 5.31511L10.3977 7.74275L6.7562 5.5253L8.2345 3.09766Z"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.70947 11.418L4.53701 13.3437"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.52832 12.5273L6.35585 14.453"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M3.89062 10.3105L2.71816 12.2362"
                            stroke="#0C5577"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="cursor-pointer pl-1">Clear Filter</span>
                      </button>
                      <button
                        className="h-[34.49px] px-3 py-[5.03px] bg-[#064771] rounded-[49.82px] text-white font-medium text-base font-['Poppins',Helvetica] hover:bg-[#053a5a] transition-colors cursor-pointer flex items-center"
                        onClick={handleSubmit(handleApplySearch)}
                      >
                        Apply & Search
                        <svg
                          className="w-2 h-3.5 ml-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <section className="flex flex-col gap-3.5 w-full px-8 mt-[15px]">
        <div className="w-full">
          <Table className="w-full border-separate border-spacing-y-[10px]">
            <TableHeader>
              <TableRow className="rounded-lg">
                {tableHeaders.map((header, idx) => {


                  return (
                    <TableHead
                      key={idx}
                      className={`cursor-pointer py-[10px] px-6 font-semibold text-[#727272] text-sm border-t border-b ${
                        idx === 0 ? 'border-l first:rounded-l-lg' : ''
                      } ${
                        idx === tableHeaders.length - 1 ? 'border-r last:rounded-r-lg' : ''
                      } bg-[#F9F9F9] text-center whitespace-nowrap hover:bg-[#d1d1d1] transition-colors`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {header}
                        {idx !== tableHeaders.length - 1 && <ArrowIcon />}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, j) => (
                  <TableRow key={`skeleton-${j}`}>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <TableCell
                        key={`skeleton-cell-${j}-${index}`}
                        className="py-[10px] px-6 bg-white"
                      >
                        <div className="h-4 rounded bg-blue-900/10 w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sellers.length > 0 ? (
                sellers.map((seller, index) => {
                  const isSelected = selectedSellerIds.has(seller.id);

                  const countryData = getCountryById(
                    parseInt(seller?.company_overview?.hq_country || '0')
                  );

                  return (
                    <TableRow key={seller.id || index}>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 font-semibold text-[#30313D] text-sm border-t border-b border-l truncate whitespace-nowrap rounded-l-lg',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        <div className="flex items-center gap-2 justify-start">
                          {isComponentOpen && (
                            <input
                              type="checkbox"
                              className="h-5 w-5 border-gray-300 rounded focus:ring-blue-500 shrink-0"
                              style={{ accentColor: '#064771' }}
                              checked={isSelected}
                              onChange={() => handleCheckboxChange(seller.id)}
                            />
                          )}
                          <span>{seller.company_overview?.reg_name ?? '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 text-center font-medium text-[#30313D] text-sm border-t border-b truncate whitespace-nowrap',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        <div className="flex justify-start items-center flex-row gap-[8.67px]">
                          {countryData?.svg_icon_url ? (
                            <img
                              src={countryData?.svg_icon_url as string}
                              alt="flag"
                              className="w-[26px] h-[26px] rounded-full bg-gray-200 text-gray-800 text-[10px] flex items-center justify-center"
                            />
                          ) : (
                            <span className="w-[26px] h-[26px] rounded-full bg-gray-200 text-gray-800 text-[10px] flex items-center justify-center">
                              n/a
                            </span>
                          )}
                          <span className="text-[#30313D] text-sm font-semibold leading-[31.78px]">
                            {countryData?.name ?? 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 text-center text-[#30313D] text-sm border-t border-b truncate whitespace-nowrap',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        {seller.partnership_details?.partnership_affiliation === 1
                          ? 'Partner'
                          : 'Us'}
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 text-center text-[#30313D] text-sm border-t border-b truncate whitespace-nowrap',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        {seller?.seller_id ?? 'N/A'}
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 text-center text-[#30313D] text-sm border-t border-b truncate whitespace-nowrap',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        N/A
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-[10px] px-6 text-center text-[#064771] text-sm border-t border-b truncate whitespace-nowrap',
                          {
                            'border-[#064771] bg-[#F5FBFF]': isSelected,
                            'border-[#E4E4E4] bg-white': !isSelected,
                          }
                        )}
                      >
                        {seller?.created_at
                          ? new Date(seller.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell
                        className={clsx(
                          'py-2 px-6 text-center border-t border-b border-r whitespace-nowrap rounded-r-lg',
                          isSelected ? 'border-[#064771] bg-[#F5FBFF]' : 'border-[#E4E4E4] bg-white'
                        )}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={clsx(
                                'flex items-center gap-1 text-[#444444]',
                                activeStatuses[seller.id] && 'text-[#064771]'
                              )}
                            >
                              {activeStatuses[seller.id] ? 'Active' : 'Paused'}
                            </span>

                            <div
                              onClick={() => toggleStatus(seller.id)}
                              className={clsx(
                                'relative w-12 h-6 rounded-full cursor-pointer transition-colors flex items-center px-1',
                                activeStatuses[seller.id] ? 'bg-[#064771]' : 'bg-[#838383]'
                              )}
                            >
                              {activeStatuses[seller.id] ? (
                                <Check className="w-3.5 h-3.5 text-white z-10" />
                              ) : (
                                <Pause className="w-3.5 h-3.5 text-white absolute right-1 z-10" />
                              )}

                              <div
                                className={clsx(
                                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all',
                                  activeStatuses[seller.id] ? 'right-0.5' : 'left-0.5'
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-sm text-gray-500">
                    No sellers available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default PausedTeaser;
