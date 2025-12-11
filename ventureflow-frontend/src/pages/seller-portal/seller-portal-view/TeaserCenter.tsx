import React, { useState, useEffect } from 'react';

import api from '../../../config/api';
import { useTabStore } from './store/tabStore';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { showAlert } from '../../../components/Alert';
import html2pdf from 'html2pdf.js';
type TeaserInfo = {
  teaser_name: string;
  country: string;
  industry: { name: string }[];
  seller_rank: string;
  sales_volume_monthly: string;
  ma_structure: string;
  reason: string;
  employee_count: string;
  founded: string;
  teaser_details: string;
  expectedInvestmentAmount: string;
  misp: string;
};

interface Country {
  id: number;
  name: string;
  svg_icon_url: string;
}

const TeaserCenter: React.FC = () => {
  const { id: paramId } = useParams();
  const id = paramId || localStorage.getItem('seller_id');

  // All hooks must be called at the top level, before any conditional logic
  const setActiveTab = useTabStore((state) => state.setActiveTab);
  const navigate = useNavigate();

  const [companyInfo, setCompanyInfo] = useState({
    company_title: '',
    origin_country_flag_svg: '',
    rating: '',
    company_type: '',
    status: '',
    origin_country: '',
    seller_id: '',
    seller_rank: '',
    updated_at: '',
    image_url: '',
  });

  const [teaserInfo, setTeaserInfo] = useState<TeaserInfo | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);



  const handleDownloadPDF = async () => {
    const element = document.querySelector('.pdf-container');
    if (!element) {
      showAlert({ type: 'error', message: 'No element with class .pdf-container found' });
      return;
    }
    await document.fonts.ready;

    const options = {
      margin: 0.1,
      filename: 'Ventureflow.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: window.devicePixelRatio * 2 || 2,
        scrollY: 0,
        letterRendering: true,
        useCORS: true,
      },
      jsPDF: {
        unit: 'in',
        format: [18, 10.5],
        orientation: 'landscape',
      },
    };

    // @ts-expect-error: Missing types for html2pdf.js
    html2pdf().set(options).from(element).save();
  };

  const baseURL = import.meta.env.VITE_APP_URL;

  const handleCopyLinkExample = () => {
    const fullUrl = `${baseURL}/seller-portal/view/${id}`;
   

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        showAlert({
          type: 'success',
          message: 'Link copied to clipboard',
        });
   
      })
      .catch(() => {
        showAlert({ type: 'error', message: 'Failed to copy link' });
      });
  };

  // No longer call /api/teaser-details directly since seller payload already includes this data

  useEffect(() => {
    const fetchTeaserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/seller/${id}`);
      

        const overview = response.data.data.company_overview || {};
        const teaser = response.data.data.teaser_center || {};

        setCompanyInfo({
          company_title: overview.reg_name || '',
          origin_country_flag_svg: overview.origin_country_flag_svg || '',
          rating: overview.rating || '',
          company_type: overview.company_type || '',
          status: overview.status || '',
          origin_country: overview.hq_country || '',
          seller_id: response.data.data.seller_id || '',
          seller_rank: overview.company_rank || '',
          updated_at: response.data.data.updated_at || '',
          image_url: response.data.data.image || '',
        });

        setTeaserInfo({
          teaser_name: teaser.teaser_heading_name || '',
          country: teaser.hq_origin_country_id || '',
          industry: teaser.industry || [],
          seller_rank: teaser.company_rank || '',
          teaser_details: teaser.teaser_details || '',
          sales_volume_monthly: teaser.monthly_revenue || '',
          ma_structure: teaser.ma_structure || '',
          reason: teaser.selling_reason || '',
          employee_count: teaser.current_employee_count || '',
          founded: teaser.year_founded || '',
          expectedInvestmentAmount: teaser.expected_investment_amount || '',
          misp: teaser.misp || '',
        });
      } catch  {
        showAlert({ type: 'error', message: 'Failed to load teaser/company info' });
        setError('Failed to load teaser/company info.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeaserData();
    }
  }, [id]);

  useEffect(() => {
    api
      .get('/api/countries')
      .then((res) => {
        setCountries(res.data);
      })
      
      .finally(() => setLoading(false));
  }, []);

  if (!paramId && !localStorage.getItem('seller_id')) {
    return (
      <div className="p-8 text-red-600 font-semibold flex justify-center items-center h-[200px]">
        Error: No seller ID found. Please complete company overview.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 font-semibold flex justify-center items-center h-[200px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600 font-semibold flex justify-center items-center h-[200px]">
        {error}
      </div>
    );
  }

  const getCountryById = (id: number) => countries.find((c) => c.id === id);

  const countryData = getCountryById(parseInt(companyInfo.origin_country));


  const getTeaserCountryById = (id: string | undefined) => countries.find((c) => c.id === Number(id));
  const teaserCountryData = getTeaserCountryById(teaserInfo?.country);

  return (
    <div className="px-8 font-poppins pdf-container">
      <div className="flex w-full mt-[30px]">
        <div className=" w-full h-[180px]">
          <div className="flex justify-start items-center flex-row gap-[22px] w-full">
            {companyInfo?.image_url ? (
              <img
                className="rounded-[180px] w-[180px] h-[180px]"
                src={`${import.meta.env.VITE_API_BASE_URL}/storage/${companyInfo.image_url}`}
                style={{ objectFit: 'cover', width: '180px' }}
                alt="Buyer"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="146"
                height="145"
                viewBox="0 0 146 145"
                fill="none"
              >
                <rect x="1.125" y="1" width="143" height="143" rx="71.5" fill="#F1FBFF" />
                <rect
                  x="1.125"
                  y="1"
                  width="143"
                  height="143"
                  rx="71.5"
                  stroke="#064771"
                  strokeWidth="2"
                />
                <path
                  d="M86.6143 57.5H95.3915C95.9223 57.5005 96.4341 57.6981 96.8276 58.0544C97.2211 58.4107 97.4684 58.9004 97.5215 59.4286L98.8286 72.5H94.5172L93.4457 61.7857H86.6143V68.2143C86.6143 68.7826 86.3886 69.3276 85.9867 69.7295C85.5848 70.1314 85.0398 70.3571 84.4715 70.3571C83.9031 70.3571 83.3581 70.1314 82.9562 69.7295C82.5544 69.3276 82.3286 68.7826 82.3286 68.2143V61.7857H65.1857V68.2143C65.1857 68.7826 64.96 69.3276 64.5581 69.7295C64.1563 70.1314 63.6112 70.3571 63.0429 70.3571C62.4746 70.3571 61.9295 70.1314 61.5277 69.7295C61.1258 69.3276 60.9 68.7826 60.9 68.2143V61.7857H54.0643L50.6357 96.0714H73.7572V100.357H48.2657C47.9664 100.357 47.6705 100.294 47.3971 100.172C47.1236 100.051 46.8786 99.873 46.678 99.651C46.4773 99.4289 46.3254 99.1673 46.232 98.8829C46.1386 98.5986 46.1058 98.2978 46.1357 98L49.9929 59.4286C50.046 58.9004 50.2932 58.4107 50.6867 58.0544C51.0803 57.6981 51.592 57.5005 52.1229 57.5H60.9V56.0043C60.9 48.5729 66.6257 42.5 73.7572 42.5C80.8886 42.5 86.6143 48.5729 86.6143 56.0043V57.5043V57.5ZM82.3286 57.5V56.0043C82.3286 50.8871 78.4629 46.7857 73.7572 46.7857C69.0515 46.7857 65.1857 50.8871 65.1857 56.0043V57.5043H82.3286V57.5ZM95.8157 89.9L90.9 84.9886V100.357C90.9 100.925 90.6743 101.471 90.2724 101.872C89.8705 102.274 89.3255 102.5 88.7572 102.5C88.1889 102.5 87.6438 102.274 87.2419 101.872C86.8401 101.471 86.6143 100.925 86.6143 100.357V84.9886L81.7029 89.9C81.5052 90.1047 81.2688 90.2679 81.0073 90.3802C80.7459 90.4925 80.4647 90.5516 80.1802 90.5541C79.8956 90.5566 79.6135 90.5024 79.3501 90.3946C79.0868 90.2869 78.8475 90.1278 78.6463 89.9266C78.4451 89.7254 78.286 89.4861 78.1783 89.2228C78.0705 88.9594 78.0163 88.6772 78.0188 88.3927C78.0213 88.1082 78.0804 87.827 78.1927 87.5656C78.305 87.3041 78.4682 87.0677 78.6729 86.87L87.2443 78.2986C87.6462 77.8968 88.1911 77.6712 88.7593 77.6712C89.3275 77.6712 89.8725 77.8968 90.2743 78.2986L98.8457 86.87C99.0504 87.0677 99.2137 87.3041 99.326 87.5656C99.4383 87.827 99.4974 88.1082 99.4998 88.3927C99.5023 88.6772 99.4481 88.9594 99.3404 89.2228C99.2326 89.4861 99.0735 89.7254 98.8723 89.9266C98.6711 90.1278 98.4319 90.2869 98.1685 90.3946C97.9052 90.5024 97.623 90.5566 97.3385 90.5541C97.0539 90.5516 96.7727 90.4925 96.5113 90.3802C96.2499 90.2679 96.0134 90.1047 95.8157 89.9Z"
                  fill="#064771"
                />
              </svg>
            )}

            <div className="flex justify-start items-start flex-col gap-[13px] w-[520px]">
              <div className="flex self-stretch justify-start items-center flex-row gap-[19px]">
                <p className="text-[rgba(0,0,0,0.88)] text-2xl font-semibold leading-8">
                  {companyInfo?.company_title || 'N/A'}
                </p>
                <div className="flex justify-center items-center flex-row gap-2 py-1 px-2 bg-[#0C5577] rounded-[36px]">
                  <svg
                    width="8"
                    height="9"
                    viewBox="0 0 8 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 4.5C8 6.70914 6.20914 8.5 4 8.5C1.79086 8.5 0 6.70914 0 4.5C0 2.29086 1.79086 0.5 4 0.5C6.20914 0.5 8 2.29086 8 4.5Z"
                      fill="white"
                    />
                  </svg>
                  <span className="text-[#FFFFFF] text-xs font-medium leading-[1.4]">
                    {companyInfo?.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex justify-start items-start flex-col gap-4 w-[344px]">
                <div className="flex justify-start items-center flex-row gap-[17px]">
                  <div className="text-[#727272] text-sm font-medium leading-5">
                    HQ / Origin Country
                  </div>
                  <div className="flex justify-start items-center flex-row gap-[8.67px]">
                    {countryData?.svg_icon_url ? (
                      <img
                        src={countryData?.svg_icon_url}
                        alt="flag"
                        className="w-[26px] h-[26px] rounded-full bg-gray-200 text-gray-800 text-[10px] flex items-center justify-center"
                      />
                    ) : (
                      <span className="w-[26px] h-[26px] rounded-full bg-gray-200 text-gray-800 text-[10px] flex items-center justify-center">
                        n/a
                      </span>
                    )}
                    <span className="text-[#30313D] text-sm font-semibold leading-[31.78px]">
                      {countryData?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex self-stretch justify-start items-center flex-row gap-[49px]">
                  <div className="text-[#727272] text-sm font-medium leading-5">Company Type</div>
                  <span className="text-[#30313D] text-sm font-semibold leading-5">
                    {companyInfo?.company_type || 'N/A'}
                  </span>
                </div>

                <div className="flex self-stretch justify-start items-center flex-row gap-[49px]">
                  <div className="text-[#727272] text-sm font-medium leading-5">Seller Rank</div>
                  <div className="flex justify-between items-center flex-row gap-[49px] w-[54px] ml-[30px]">
                    <span className="text-[#30313D] text-sm font-semibold leading-5">
                      {companyInfo?.seller_rank || 'N/A'}
                    </span>
                    <div>
                      {[...Array(companyInfo?.rating || 0)].map((_, i) => (
                        <svg
                          key={i}
                          width="13"
                          height="12"
                          viewBox="0 0 13 12"
                          fill="none"
                          className="mr-1"
                        >
                          <path
                            d="M6.5 0.5L8.03 3.74L11.61 4.24L8.93 6.76L9.6 10.26L6.5 8.5L3.4 10.26L4.07 6.76L1.39 4.24L4.97 3.74L6.5 0.5Z"
                            fill="#FFBA00"
                          />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" h-[180px] w-[245px] ml-[12px] text-nowrap">
          <div
            className="flex justify-center items-center flex-row gap-[4px]  pr-4 bg-[#064771] rounded-[5px] w-[245px] h-[180px]"
            style={{ width: '245px' }}
          >
            <div className="flex justify-between items-center flex-col gap-1.5 h-[158px]">
              <div className="flex justify-start items-end flex-col gap-[29px] h-[158px]">
                <div
                  className="flex justify-center items-end flex-col gap-1.5 w-[202px]"
                  style={{ width: '202px' }}
                >
                  <div className="flex self-stretch justify-between items-center flex-row gap-[107px]">
                    <div className="flex justify-start items-end flex-row gap-[7.1049323081970215px] h-[24px]">
                      <button
                        onClick={() => handleCopyLinkExample()}
                        className="flex justify-center items-center flex-row gap-[3.044971227645874px] py-[3.5524661540985107px] px-[5.647058963775635px] bg-[#F1FBFF] border-solid border-[#064771] border-[0.3529411852359772px] rounded-[35.16731643676758px] w-[57px] h-[24px]"
                        style={{ width: '57px' }}
                      >
                        <svg
                          width="15"
                          height="16"
                          viewBox="0 0 15 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5.50127 7.99966C5.50127 9.09163 4.61605 9.97686 3.52407 9.97686C2.4321 9.97686 1.54688 9.09163 1.54688 7.99966C1.54688 6.90769 2.4321 6.02246 3.52407 6.02246C4.61605 6.02246 5.50127 6.90769 5.50127 7.99966Z"
                            stroke="#064771"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M9.4544 3.6499L5.5 6.41798"
                            stroke="#064771"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M9.4544 12.3511L5.5 9.58301"
                            stroke="#064771"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M13.4114 13.1403C13.4114 14.2323 12.5262 15.1175 11.4342 15.1175C10.3423 15.1175 9.45703 14.2323 9.45703 13.1403C9.45703 12.0483 10.3423 11.1631 11.4342 11.1631C12.5262 11.1631 13.4114 12.0483 13.4114 13.1403Z"
                            stroke="#064771"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M13.4114 2.85952C13.4114 3.9515 12.5262 4.83672 11.4342 4.83672C10.3423 4.83672 9.45703 3.9515 9.45703 2.85952C9.45703 1.76755 10.3423 0.882324 11.4342 0.882324C12.5262 0.882324 13.4114 1.76755 13.4114 2.85952Z"
                            stroke="#064771"
                            strokeWidth="1.2"
                          />
                        </svg>
                        <span className="text-[#064771] text-[12px] text-nowrap hover:underline">
                          Share
                        </span>
                      </button>
                    </div>
                    <span className="text-[#FFFFFF] leading-[12.788783073425293px] ml-[-10px]">
                      Seller ID
                    </span>
                  </div>
                </div>
                <div className="flex justify-start items-end flex-col gap-[33px] h-[105px] mt-[-10px]">
                  <div className="flex justify-start items-end flex-col gap-3">
                    <div
                      className="flex justify-start items-center flex-row gap-[10.231026649475098px] w-[179px]"
                      style={{ width: '179px' }}
                    >
                      <svg
                        width="25"
                        height="27"
                        viewBox="0 0 25 27"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1.54886 0C0.945866 0 0.457031 0.549475 0.457031 1.22727C0.457031 1.90507 0.945866 2.45455 1.54886 2.45455H2.88005L6.77158 19.9517C5.62441 20.5244 4.82436 21.8162 4.82436 23.3182C4.82436 25.3517 6.29085 27 8.09985 27C9.90885 27 11.3753 25.3517 11.3753 23.3182C11.3753 22.8879 11.3096 22.4748 11.189 22.0909H15.929C15.8084 22.4748 15.7427 22.8879 15.7427 23.3182C15.7427 25.3517 17.2091 27 19.0182 27C20.8272 27 22.2937 25.3517 22.2937 23.3182C22.2937 21.2847 20.8272 19.6364 19.0182 19.6364H8.95233L8.40642 17.1818H19.0182C21.2719 17.1818 22.6233 15.5813 23.3732 13.8141C24.106 12.087 24.361 10.023 24.45 8.52179C24.5738 6.43108 23.0364 4.90909 21.3341 4.90909H5.67684L4.99852 1.85923C4.75549 0.766542 3.88206 0 2.88005 0H1.54886ZM19.0182 14.7273H7.8605L6.22275 7.36364H21.3341C21.9379 7.36364 22.3005 7.86283 22.2712 8.35868C22.1882 9.75952 21.9558 11.4527 21.4023 12.7574C20.8658 14.0217 20.1319 14.7273 19.0182 14.7273ZM19.0182 24.5378C18.4189 24.5378 17.9331 23.9918 17.9331 23.3182C17.9331 22.6445 18.4189 22.0985 19.0182 22.0985C19.6175 22.0985 20.1032 22.6445 20.1032 23.3182C20.1032 23.9918 19.6175 24.5378 19.0182 24.5378ZM7.01476 23.3182C7.01476 23.9918 7.50057 24.5378 8.09985 24.5378C8.69914 24.5378 9.18495 23.9918 9.18495 23.3182C9.18495 22.6445 8.69914 22.0985 8.09985 22.0985C7.50057 22.0985 7.01476 22.6445 7.01476 23.3182Z"
                          fill="#F9F8FA"
                        />
                      </svg>
                      <p className="text-[#FFFFFF] text-[28.646873474121094px] font-semibold leading-[30.69308090209961px]">
                        {companyInfo?.seller_id || 'N/A'}
                      </p>
                    </div>
                    <div className="flex justify-start items-start flex-row gap-1.5">
                      <span className="text-[#AFAFAF] text-sm leading-[18.860000610351562px]">
                        Last Release
                      </span>
                      <span className="text-[#FFFFFF] text-sm font-medium leading-[10px] mt-[5px]">
                        {companyInfo?.updated_at
                          ? new Date(companyInfo.updated_at).toLocaleDateString('en-GB', {
                              month: 'short',
                              year: 'numeric',
                              day: '2-digit',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex justify-start items-center flex-row gap-1.5 w-[202px] h-[23px]"
                    style={{ width: '202px' }}
                  >
                    <button
                      onClick={handleDownloadPDF}
                      className="flex justify-center items-center flex-row gap-[3.044971227645874px] py-[3.5524661540985107px] px-[5.647058963775635px] bg-[#F1FBFF] border-solid border-[#064771] border-[0.3529411852359772px] rounded-[35.16731643676758px] w-[114px] h-[24px]"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.6272 10.8206C12.5558 8.89194 12.5558 5.76138 10.6272 3.83272C8.6985 1.90407 5.56793 1.90407 3.63928 3.83272C1.71062 5.76138 1.71062 8.89194 3.63928 10.8206"
                          stroke="#064771"
                          strokeWidth="0.988235"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.13499 8.02268L7.13497 13.7527"
                          stroke="#064771"
                          strokeWidth="0.988235"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5.44517 12.6265L7.13274 14.314L8.82031 12.6265"
                          stroke="#064771"
                          strokeWidth="0.988235"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="text-[#064771] text-[12px] text-nowrap">Download PDF</span>
                    </button>
                    <button
                      className="flex justify-center items-center flex-row gap-[3.044971227645874px] py-[3.5524661540985107px] px-[5.647058963775635px] bg-[#FFFFFF] rounded-[35.16731643676758px] w-[82px] h-[24px]"
                      style={{ width: '82px' }}
                      onClick={() => {
                        navigate(`/seller-portal/edit/${id}`);
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2.2437 5.87325C2.58773 3.53533 4.76188 1.91897 7.0998 2.263C7.89745 2.38037 8.6457 2.72072 9.25836 3.24484L8.70684 3.79637C8.52198 3.98127 8.52203 4.28103 8.70695 4.46588C8.79569 4.55461 8.91606 4.60447 9.04155 4.60449H11.2127C11.4741 4.60449 11.6861 4.39254 11.6861 4.13108V1.95998C11.686 1.69852 11.474 1.48661 11.2125 1.48665C11.0871 1.48668 10.9667 1.53654 10.8779 1.62526L10.2625 2.2407C7.91549 0.148595 4.31689 0.355198 2.22479 2.70217C1.48362 3.53362 1.00264 4.56424 0.841439 5.66636C0.777882 6.05708 1.04309 6.42535 1.4338 6.48891C1.46899 6.49463 1.50454 6.49772 1.5402 6.49816C1.89767 6.4943 2.19772 6.22776 2.2437 5.87325Z"
                          fill="#064771"
                        />
                        <path
                          d="M11.4193 6.50146C11.0618 6.50533 10.7617 6.77187 10.7158 7.12638C10.3717 9.4643 8.19759 11.0807 5.85967 10.7366C5.06202 10.6193 4.31376 10.2789 3.7011 9.75481L4.25262 9.20328C4.43748 9.01838 4.43744 8.71862 4.25251 8.53376C4.16377 8.44504 4.0434 8.39518 3.91791 8.39515H1.74685C1.48539 8.39515 1.27344 8.60711 1.27344 8.86857V11.0397C1.2735 11.3011 1.4855 11.513 1.74696 11.513C1.87245 11.513 1.99282 11.4631 2.08156 11.3744L2.697 10.7589C5.04342 12.8513 8.64175 12.6453 10.7341 10.2989C11.4757 9.46725 11.9569 8.43628 12.118 7.33376C12.1818 6.94308 11.9169 6.57463 11.5262 6.51081C11.4908 6.50502 11.4551 6.50189 11.4193 6.50146Z"
                          fill="#064771"
                        />
                      </svg>
                      <span className="text-[#064771] text-[12px] text-nowrap">Update</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex self-stretch justify-between items-center flex-row gap-4 w-[1280px] mt-[70px] ">
        <span className="text-[#064771] text-lg font-medium leading-5">Website Preview</span>
        <div
          className="flex justify-between items-center flex-row w-[271px]"
          style={{ width: '271px' }}
        >
          <div
            className="flex justify-between items-center flex-row w-[271px]"
            style={{ width: '271px' }}
          >
            <p className="text-[#30313D] text-sm text-center leading-5">
              {companyInfo?.updated_at
                ? new Date(companyInfo.updated_at).toLocaleString('en-GB', {
                    month: 'short',
                    year: 'numeric',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : 'N/A'}
            </p>
            <div className="flex justify-start items-center flex-row gap-2">
              <div className="flex justify-start items-start flex-row gap-2 h-[24px]">
                <div className="flex justify-start items-center flex-row gap-2.5 py-1 h-[24px]">
                  <div className="flex justify-start items-center flex-row gap-2">
                    <span className="text-[#444444] text-sm font-medium leading-[18px]">
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsActive((prev) => !prev)}
                  className={`w-[48px] h-[24px] rounded-full transition-colors duration-200 relative ${
                    isActive ? 'bg-[#064771]' : 'bg-gray-400'
                  } flex items-center px-1`}
                >
                  {isActive && (
                    <svg
                      className="absolute left-2 w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}

                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      isActive ? 'translate-x-[24px]' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[2px] bg-gray-400 w-[1300px] mt-[16px]" />

      <div className="flex  h-[562px]  mt-[60px] ">
        <div
          className="w-[507px] h-[562px] rounded-[15px] bg-cover bg-center"
          style={{
            backgroundImage: `
      linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.7) 100%),
      url('/path/to/your/image.jpg')
    `,
          }}
        ></div>

        <div className="  w-[697px] h-[562px] ml-[60px]">
          <p className="text-[#000000] text-[28px] font-['Serenity'] font-medium leading-[31px]">
            {teaserInfo?.teaser_name || 'N/A'}
          </p>

          <div className="flex self-stretch justify-between items-center flex-row gap-[190px] text-nowrap mt-[22px]">
            <div className="flex justify-start items-center flex-row gap-4">
              <div className="flex justify-start items-center flex-row gap-[3px]">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99935 18C12.916 15 15.8327 12.3137 15.8327 9C15.8327 5.68629 13.221 3 9.99935 3C6.77769 3 4.16602 5.68629 4.16602 9C4.16602 12.3137 7.08268 15 9.99935 18Z"
                    stroke="#1D7595"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="text-[#000000] font-['Serenity'] font-medium">
                  <span className="text-[#30313D] text-sm font-semibold leading-[31.78px]">
                    {teaserCountryData?.name || 'N/A'}
                  </span>
                </span>
              </div>
              <div className="flex justify-start items-center flex-row gap-[3px]">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_180_33410)">
                    <path
                      d="M18.4563 4.34375C18.3612 4.28889 18.2535 4.26002 18.1438 4.26002C18.034 4.26002 17.9263 4.28889 17.8313 4.34375L12.5 6.9875V4.875C12.4997 4.76846 12.4721 4.66377 12.42 4.57087C12.3678 4.47798 12.2927 4.39996 12.2019 4.34423C12.1111 4.28849 12.0076 4.2569 11.9012 4.25244C11.7947 4.24798 11.6889 4.27081 11.5938 4.31875L6.25 6.9875V2.375C6.25 2.20924 6.18415 2.05027 6.06694 1.93306C5.94973 1.81585 5.79076 1.75 5.625 1.75H1.875C1.70924 1.75 1.55027 1.81585 1.43306 1.93306C1.31585 2.05027 1.25 2.20924 1.25 2.375V18H18.75V4.875C18.7502 4.76878 18.7234 4.66427 18.672 4.57132C18.6206 4.47836 18.5463 4.40004 18.4563 4.34375ZM13.75 16.75H11.25V12.375H13.75V16.75ZM17.5 16.75H15V11.75C15 11.5842 14.9342 11.4253 14.8169 11.3081C14.6997 11.1908 14.5408 11.125 14.375 11.125H10.625C10.4592 11.125 10.3003 11.1908 10.1831 11.3081C10.0658 11.4253 10 11.5842 10 11.75V16.75H2.5V3H5V9.0125L11.25 5.8875V9.0125L17.5 5.8875V16.75Z"
                      fill="#005E80"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_180_33410">
                      <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-lg">
                  <span className="text-[#757575] font-['Serenity'] font-medium">Industry:</span>
                  <span className="text-[#6D6D6D] font-['Serenity'] font-light"></span>
                  <span className="text-[#000000] font-['Serenity'] font-semibold">
                    {Array.isArray(teaserInfo?.industry) && teaserInfo.industry.length > 0
                      ? teaserInfo.industry.map((item) => item.name).join(', ').length > 30
                        ? teaserInfo.industry
                            .map((item) => item.name)
                            .join(', ')
                            .substring(0, 30) + '...'
                        : teaserInfo.industry.map((item) => item.name).join(', ')
                      : 'N/A'}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex justify-start items-center flex-row gap-[5px] ml-[-90px]">
              <svg
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.2855 7.4684C17.2855 7.63093 17.1927 7.81377 17.007 8.01693L13.2561 12.0192L14.1474 17.6874V17.9312C14.1474 18.0801 14.1103 18.2088 14.036 18.3172C13.9617 18.4255 13.8596 18.4831 13.7296 18.4898C13.5996 18.4966 13.4604 18.4526 13.3118 18.3578L8.65106 15.6761L4.00887 18.3578C3.86032 18.4526 3.71796 18.5 3.58179 18.5C3.44562 18.5 3.3404 18.4391 3.26612 18.3172C3.19185 18.1953 3.15471 18.0666 3.15471 17.9312C3.15471 17.877 3.1609 17.7957 3.17328 17.6874L4.06458 12.0192L0.295119 8.01693C0.12181 7.81377 0.0351562 7.63093 0.0351562 7.4684C0.0351562 7.18397 0.227033 7.0079 0.610788 6.94018L5.81004 6.12754L8.1497 0.967268C8.28587 0.655756 8.45299 0.5 8.65106 0.5C8.84913 0.5 9.02244 0.655756 9.17099 0.967268L11.4921 6.12754L16.6913 6.94018C17.0875 7.0079 17.2855 7.18397 17.2855 7.4684Z"
                  fill="#FFA500"
                />
              </svg>
              <span className="font-['Serenity'] text-right font-medium ">
                <span className="text-[#6D6D6D]">Seller Rank</span>
                <span className="text-[#000000]">“{teaserInfo?.seller_rank || 'N/A'}”</span>
              </span>
            </div>
          </div>

          <div
            className="your-css-classes-here"
            dangerouslySetInnerHTML={{
              __html: teaserInfo?.teaser_details || '<p>N/A</p>',
            }}
          />

          <button
            className="flex justify-end items-center flex-row gap-2 w-[691px] mt-[8px]"
            style={{ width: '691px' }}
          >
            <span className="text-[#1D7595] text-lg font-['Serenity'] font-semibold leading-[29.71px]">
              See is Details
            </span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.2859 10.1422V1.33447V10.1422ZM14.2859 1.33447H5.47818H14.2859ZM14.2859 1.33447L1.95508 13.6653L14.2859 1.33447Z"
                fill="#02293E"
              />
              <path
                d="M14.2859 10.1422V1.33447M14.2859 1.33447H5.47818M14.2859 1.33447L1.95508 13.6653"
                stroke="#3B728F"
                strokeWidth="2.64232"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="bg-gray-400 h-[1px] w-[700px] mt-1 border-dashed border-[#727272] border-[1.8980880975723267px] "></div>

          <div
            className="flex justify-start items-center flex-row gap-2 w-[691px] mt-[15px]"
            style={{ width: '691px' }}
          >
            <span className="text-[#000000] text-lg font-['Serenity'] font-medium leading-[25.996261596679688px]">
              Deal Highlights
            </span>
          </div>

          <div className="flex self-stretch justify-end items-end flex-row gap-[70px] mt-[28px]">
            <div
              className="flex justify-start items-center flex-col gap-2.5 w-[440px] text-nowrap"
              style={{ width: '440px' }}
            >
              <div className="flex self-stretch justify-between items-center flex-row gap-[200px]">
                <div className="flex justify-start items-center flex-row gap-3.5">
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
                  <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09]">
                    Sales Volume (Monthly)
                  </span>
                </div>
                <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09] ml-[-30px]">
                  {teaserInfo?.sales_volume_monthly || 'N/A'}
                </span>
              </div>
              <svg
                width="459"
                height="1"
                viewBox="0 0 459 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0.5 0.5H458.5" stroke="#A6A6A6" strokeLinecap="round" />
              </svg>
              <div className="flex self-stretch justify-between items-center flex-row gap-[168px]">
                <div className="flex justify-start items-center flex-row gap-3.5">
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
                    <path d="M18 15.5V7.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 15.5V7.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09]">
                    M&A Structure
                  </span>
                </div>
                <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09] ">
                  {teaserInfo?.ma_structure || 'N/A'}
                </span>
              </div>
              <svg
                width="459"
                height="1"
                viewBox="0 0 459 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0.5 0.5H458.5" stroke="#A6A6A6" strokeLinecap="round" />
              </svg>
              <div className="flex self-stretch justify-between items-center flex-row gap-[294px]">
                <div className="flex justify-start items-center flex-row gap-3.5">
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
                  <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09]">
                    Reason
                  </span>
                </div>
                <span className="text-[#000000] text-lg font-['Serenity'] text-right font-medium leading-[25.996261596679688px] ml-[-70px]">
                  {teaserInfo?.reason || 'N/A'}
                </span>
              </div>
              <svg
                width="459"
                height="1"
                viewBox="0 0 459 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0.5 0.5H458.5" stroke="#A6A6A6" strokeLinecap="round" />
              </svg>
              <div className="flex self-stretch justify-between items-center flex-row gap-[294px]">
                <div className="flex justify-start items-center flex-row gap-3.5">
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
                  <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09]">
                    Employee Count
                  </span>
                </div>
                <span className="text-[#000000] text-right font-medium leading-5 ml-[-70px]">
                  {teaserInfo?.employee_count || 'N/A'}
                </span>
              </div>
              <svg
                width="459"
                height="1"
                viewBox="0 0 459 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0.5 0.5H458.5" stroke="#A6A6A6" strokeLinecap="round" />
              </svg>
              <div className="flex self-stretch justify-between items-center flex-row gap-[294px]">
                <div className="flex justify-start items-center flex-row gap-3.5">
                  <svg
                    width="20"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
                        <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                      </clipPath>
                    </defs>
                  </svg>
                  <span className="text-[#000000] font-['Serenity'] font-medium leading-[1.09]">
                    Founded
                  </span>
                </div>
                <span className="text-[#000000] text-[17.330841064453125px] font-['Serenity'] text-right font-medium leading-[25.996261596679688px]">
                  {teaserInfo?.founded || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex justify-center items-end flex-col gap-4 ">
              <div
                className="flex justify-start items-end flex-col gap-[8.443299293518066px] w-[182px]"
                style={{ width: '182px' }}
              >
                <div className="flex justify-start items-center flex-row gap-[7.505154609680176px] text-nowrap">
                  <span className="text-[#757575] text-[15.010309219360352px] font-['Serenity'] font-medium leading-[20.90420913696289px]">
                    Desired Investment & Stake
                  </span>
                  <button>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 17 17"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.46826 0.420898C6.92203 0.420898 5.41053 0.879408 4.12489 1.73845C2.83925 2.59749 1.83721 3.81847 1.24549 5.247C0.653778 6.67553 0.498958 8.24744 0.800612 9.76396C1.10227 11.2805 1.84685 12.6735 2.94019 13.7668C4.03354 14.8602 5.42655 15.6048 6.94307 15.9064C8.45959 16.2081 10.0315 16.0533 11.46 15.4615C12.8886 14.8698 14.1095 13.8678 14.9686 12.5821C15.8276 11.2965 16.2861 9.785 16.2861 8.23877C16.2839 6.16603 15.4595 4.17882 13.9939 2.71318C12.5282 1.24753 10.541 0.42314 8.46826 0.420898ZM8.46826 14.7537C7.17974 14.7537 5.92015 14.3716 4.84878 13.6557C3.77741 12.9398 2.94239 11.9223 2.44929 10.7319C1.95619 9.54147 1.82718 8.23154 2.07855 6.96777C2.32993 5.70401 2.95042 4.54317 3.86154 3.63204C4.77266 2.72092 5.93351 2.10044 7.19727 1.84906C8.46103 1.59768 9.77096 1.7267 10.9614 2.21979C12.1518 2.71289 13.1693 3.54792 13.8852 4.61929C14.6011 5.69066 14.9832 6.95024 14.9832 8.23877C14.9813 9.96604 14.2943 11.622 13.0729 12.8434C11.8515 14.0648 10.1955 14.7518 8.46826 14.7537Z"
                        fill="#1D7595"
                      />
                      <path
                        d="M8.46899 6.93652H7.8175C7.64472 6.93652 7.47901 7.00516 7.35683 7.12734C7.23465 7.24952 7.16602 7.41523 7.16602 7.58801C7.16602 7.7608 7.23465 7.92651 7.35683 8.04868C7.47901 8.17086 7.64472 8.2395 7.8175 8.2395H8.46899V12.1484C8.46899 12.3212 8.53763 12.4869 8.65981 12.6091C8.78199 12.7313 8.9477 12.7999 9.12048 12.7999C9.29327 12.7999 9.45898 12.7313 9.58115 12.6091C9.70333 12.4869 9.77197 12.3212 9.77197 12.1484V8.2395C9.77197 7.89393 9.63469 7.56251 9.39034 7.31816C9.14598 7.0738 8.81456 6.93652 8.46899 6.93652Z"
                        fill="#1D7595"
                      />
                      <path
                        d="M8.46747 5.63147C9.00718 5.63147 9.4447 5.19395 9.4447 4.65424C9.4447 4.11452 9.00718 3.677 8.46747 3.677C7.92776 3.677 7.49023 4.11452 7.49023 4.65424C7.49023 5.19395 7.92776 5.63147 8.46747 5.63147Z"
                        fill="#1D7595"
                      />
                    </svg>
                  </button>
                </div>
                <span className="text-[#1D7595] text-[22.29782485961914px] text-right leading-[33.44673538208008px]">
                  <span className="font-['Serenity'] font-medium">
                    {' '}
                    $ {teaserInfo?.expectedInvestmentAmount || 'N/A'}
                  </span>
                  <span className="font-['Serenity'] font-light"> for </span>
                  <span className="font-['Serenity'] font-medium">
                    {teaserInfo?.misp || 'N/A'} %{' '}
                  </span>
                </span>
              </div>
              <button
                className="flex justify-center items-center flex-row gap-[10.37492561340332px] py-[7.781193733215332px] px-[12.968656539916992px] bg-[#C6E7F3] rounded-[4.322885513305664px] w-[182px] h-[44px]"
                style={{ width: '182px' }}
              >
                <span className="text-[#02293E] text-[19.02069664001465px] font-['Serenity'] font-medium leading-[1.09] text-nowrap">
                  Contact Business
                </span>
                <svg
                  width="16"
                  height="15"
                  viewBox="0 0 16 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.8814 10.0938V1.448V10.0938ZM13.8814 1.448H5.23565H13.8814ZM13.8814 1.448L1.77734 13.5521L13.8814 1.448Z"
                    fill="#02293E"
                  />
                  <path
                    d="M13.8814 10.0938V1.448M13.8814 1.448H5.23565M13.8814 1.448L1.77734 13.5521"
                    stroke="#02293E"
                    strokeWidth="2.59373"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-7 mt-[110px]">
        <div className="flex justify-between items-center flex-row gap-[916px] mt-15 ml-">
          <div
            className="flex justify-start items-end flex-row gap-[10.06532096862793px] w-[93px] h-[34px]"
            style={{ width: '93px' }}
          ></div>

          <div className="flex justify-start items-center flex-row gap-4 mx-auto w-fit ml-[-350px]">
            <button
              className="flex justify-center items-center flex-row gap-1.5 py-[5.032660484313965px] px-3 bg-[#064771] rounded-[49.82036209106445px] h-[34px] "
              onClick={() => setActiveTab('attachments')}
            >
              <svg
                width="8"
                height="14"
                viewBox="0 0 8 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7.71748 12.3618C8.09417 12.7366 8.09417 13.3443 7.71748 13.7191C7.34078 14.0939 6.73003 14.0939 6.35333 13.7191L0.282264 7.67829C-0.0940858 7.30381 -0.0940857 6.69667 0.282264 6.32219L6.35334 0.28136C6.73003 -0.0934614 7.34078 -0.0934612 7.71748 0.281361C8.09418 0.656182 8.09418 1.26389 7.71748 1.63871L2.32911 7.00024L7.71748 12.3618Z"
                  fill="white"
                />
              </svg>

              <span className="text-[#FFF] ">Back</span>
            </button>

            <div className="flex justify-start items-end flex-row gap-[10.06532096862793px] h-[34px]">
              <button
                className="flex justify-center items-center flex-row gap-1.5 py-[5.032660484313965px] px-3 rounded-[49.82036209106445px] h-[34px] bg-[#064771]"
                onClick={() => navigate('/seller-portal')}
              >
                <span className="text-[#FFF] ">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeaserCenter;
