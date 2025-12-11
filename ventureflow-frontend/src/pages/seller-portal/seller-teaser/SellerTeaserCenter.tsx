import React, { useEffect, useState } from 'react';
import { Tabs } from '../../../assets/tabs';
import Breadcrumb from '../../../assets/breadcrumb';
import ActiveTeaserIcon from './svg/ActiveTeaserIcon';
import PausedIcon from './svg/PausedIcon';
import ActiveTeaser from './ActiveTeaser';
import PausedTeaser from './PausedTeaser';
import { useNavigate } from 'react-router-dom';
import api from '../../../config/api';
import { showAlert } from '../../../components/Alert';

const ActiveTeaserTab = () => (
  <div>
    <ActiveTeaser onApplyFilters={() => {}} onClearFilters={() => {}} />
  </div>
);

const PausedTab = () => (
  <div>
    <PausedTeaser onClearFilters={() => {}} />
  </div>
);

interface SellerResponse {
  data?: unknown[];
  meta?: {
    total: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const SellerTeaserCenter: React.FC = () => {
  const [activesellers, activesetsellers] = useState<SellerResponse>({});



  const [pausedsellers, setpausedsellers] = useState<SellerResponse>({});

  const fetchsellers = async (page = 1, query = '') => {
    try {
      const response = await api.get('/api/seller/teaser-center/live', {
        params: { page, search: query },
      });
      activesetsellers(response.data);
    } catch  {
      showAlert({ type: 'error', message: 'Failed to fetch active sellers' });
    }
    try {
      const response = await api.get('/api/seller/teaser-center/paused', {
        params: { page, search: query },
      });
      setpausedsellers(response.data);
    } catch  {
      showAlert({ type: 'error', message: 'Failed to fetch paused sellers' });
    }
  };

  useEffect(() => {
    fetchsellers();
  }, []);

  const tabsData = [
    {
      id: 'active-teasers',
      label: 'Active Teaser',

      count: activesellers.meta?.total ?? 0,
      activeIcon: <ActiveTeaserIcon isActive={true} />,
      inactiveIcon: <ActiveTeaserIcon isActive={false} />,
    },
    {
      id: 'paused',
      label: 'Paused',

      count: pausedsellers.meta?.total ?? 0,
      activeIcon: <PausedIcon isActive={true} />,
      inactiveIcon: <PausedIcon isActive={false} />,
    },
  ];

  const navigate = useNavigate();
  const breadcrumbLinks = [
    { label: 'Home', url: '/', isCurrentPage: false },
    { label: 'Buyer Teaser Center', url: '/buyer-teaser', isCurrentPage: true },
  ];

  const [activeTab, setActiveTab] = useState('active-teasers');

  const TabContentMap: Record<string, React.FC | (() => JSX.Element)> = {
    'active-teasers': ActiveTeaserTab,
    paused: PausedTab,
  };

  const ActiveComponent = TabContentMap[activeTab];

  return (
    <div className="flex items-center gap-[13px] w-auto font-poppins">
      <div className="flex flex-col flex-shrink-0 items-start gap-0 flex-wrap w-full">
        <div className="flex items-center self-stretch text-[#00081a] text-right font-poppins text-[1.75rem] font-medium leading-[normal] ml-9 mt-7">
          Seller Teaser Center
        </div>
        <div className="flex items-center self-stretch ml-9 w-auto pt-4">
          <div className="flex items-center gap-2.5 w-auto">
            <button
              className="flex flex-col flex-shrink-0 justify-center items-center gap-1 py-1 px-3 w-[4.125rem] rounded bg-[#064771]"
              onClick={() => navigate(-1)}
            >
              <div className="flex items-center gap-1">
                <svg
                  width={14}
                  height={11}
                  viewBox="0 0 14 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.66681 9.85943H9.28387C11.2247 9.85943 12.8003 8.2839 12.8003 6.34304C12.8003 4.40217 11.2247 2.82666 9.28387 2.82666H1.55469"
                    stroke="white"
                    strokeWidth="1.56031"
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.17526 4.59629L1.38281 2.79245L3.17526 1"
                    stroke="white"
                    strokeWidth="1.56031"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="text-white font-poppins text-[.8125rem] font-semibold leading-[1.1875rem]">
                  Back
                </div>
              </div>
            </button>
            <div className="flex items-start">
              <Breadcrumb links={breadcrumbLinks} />
            </div>
          </div>
        </div>

        <div className="bg-white flex flex-row justify-center w-full mt-[45px]">
          <div className="bg-white w-full min-h-screen">
            <div className="flex flex-col w-full items-start relative">
              <div className="w-full h-0.5 absolute top-[39px] bg-gray-200" />

              <Tabs
                tabs={tabsData}
                activeTab={activeTab}
                onTabChange={(tabId) => {
                  setActiveTab(tabId);
                }}
              />

              <div className="mt-8 w-full">
                {ActiveComponent ? <ActiveComponent /> : <div>No content found.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerTeaserCenter;
