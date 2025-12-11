import React, { useState, useEffect } from 'react';
import { Tabs } from '../../../assets/tabs';
import Breadcrumb from '../../../assets/breadcrumb';
import LetterIcon from '../../../assets/svg/LetterIcon';
import SharedSellersIcon from '../../../assets/svg/SharedSellersIcon';
import SharedBuyersIcon from '../../../assets/svg/SharedBuyersIcon';
import Attachment from '../../../assets/svg/Attachment';
import PartnerOverview from './PartnerOverview';
import SharedSellers from './SharedSellers';
import SharedBuyers from './SharedBuyers';
import Attachments from './Attachments';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import api from '../../../config/api';
import { showAlert } from '../../../components/Alert';
const PartnerOverviewTab = () => <PartnerOverview />;
const SharedSellersTab = () => <SharedSellers />;
const SharedBuyersTab = () => <SharedBuyers />;
const AttachmentsTab = () => <Attachments />;

const tabsData = [
  {
    id: 'partner-overview',
    label: "Partner's Overview",
    activeIcon: <LetterIcon isActive={true} />,
    inactiveIcon: <LetterIcon isActive={false} />,
  },
  {
    id: 'shared-sellers',
    label: 'Shared Sellers',
    activeIcon: <SharedSellersIcon isActive={true} />,
    inactiveIcon: <SharedSellersIcon isActive={false} />,
  },
  {
    id: 'shared-buyers',
    label: 'Shared Buyers',
    activeIcon: <SharedBuyersIcon isActive={true} />,
    inactiveIcon: <SharedBuyersIcon isActive={false} />,
  },
  {
    id: 'attachments',
    label: 'Attachments',
    activeIcon: <Attachment isActive={true} />,
    inactiveIcon: <Attachment isActive={false} />,
  },
];

const TabContentMap: Record<string, React.FC> = {
  'partner-overview': PartnerOverviewTab,
  'shared-sellers': SharedSellersTab,
  'shared-buyers': SharedBuyersTab,
  attachments: AttachmentsTab,
};

interface PartnerData {
  partner_overview?: {
    reg_name?: string;
  };
}

const PartnerPortalDetails: React.FC = () => {
  const { id } = useParams();
  const [partner, setPartner] = useState<PartnerData | null>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await api.get(`/api/partner/${id}`);
        const partnerData = response.data?.data || {};
        setPartner(partnerData);
      } catch {
        showAlert({ type: "error", message: "Failed to fetch partner" });
      }
    };

    if (id) {
      fetchPartner();
    }
  }, [id]);

  const breadcrumbLinks = [
    { label: 'Home', url: '/', isCurrentPage: false },
    { label: 'Partner Portal', url: '/partner-portal', isCurrentPage: false },
    {
      label: id ? partner?.partner_overview?.reg_name || 'Edit Partner' : 'Create a New Partner',
      url: '',
      isCurrentPage: true,
    },
  ];

  const [activeTab, setActiveTab] = useState<string>('company-overview');

  const ActiveComponent = TabContentMap[activeTab] || PartnerOverviewTab;
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full py-4 font-poppins">
      <div className="flex flex-col w-full p-[25px]">
        <h1 className="text-[#00081a] text-[1.75rem] font-medium mb-4">Partner in Details </h1>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="flex items-center gap-1 py-1 px-3 rounded bg-[#064771]">
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
            <button
              onClick={() => navigate('/partner-portal')}
              className="bg-transparent border-none p-0 cursor-pointer"
            >
              <span className="text-white text-[.8125rem] font-semibold">Back</span>
            </button>
          </div>
          <Breadcrumb links={breadcrumbLinks} />
        </div>
      </div>
      <div className="w-full bg-white">
        <div className="relative">
          <div className="w-full h-0.5 absolute top-[39px] bg-gray-200" />
          <Tabs tabs={tabsData} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="mt-8 w-full">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default PartnerPortalDetails;
