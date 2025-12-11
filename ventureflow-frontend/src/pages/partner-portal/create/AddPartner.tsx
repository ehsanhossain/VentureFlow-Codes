import React, { useEffect } from 'react';
import { Tabs } from '../../../assets/tabs';
import Breadcrumb from '../../../assets/breadcrumb';
import LetterIcon from '../../../assets/svg/LetterIcon';
import PartnershipStructureIcon from '../../../assets/svg/PartnershipStructureIcon';

import Attachment from '../../../assets/svg/Attachment';
import CompanyOverview from './PartnerOverview';
import PartnershipStructure from './PartnershipStructure';
import Attachments from './Attachments';

import { useTabStore } from './store/tabStore';

const PartnerOverviewTab = () => <CompanyOverview />;
const PartnershipStructureTab = () => <PartnershipStructure />;
const AttachmentsTab = () => <Attachments />;
import { useNavigate } from 'react-router-dom';

const tabsData = [
  {
    id: 'partner-overview',
    label: "Partner's Overview",
    activeIcon: <LetterIcon isActive={true} />,
    inactiveIcon: <LetterIcon isActive={false} />,
  },
  {
    id: 'partnership-structure',
    label: 'Partnership Structure',
    activeIcon: <PartnershipStructureIcon isActive={true} />,
    inactiveIcon: <PartnershipStructureIcon isActive={false} />,
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
  'partnership-structure': PartnershipStructureTab,

  attachments: AttachmentsTab,
};

const AddPartner: React.FC = () => {
  const breadcrumbLinks = [
    { label: 'Home', url: '/', isCurrentPage: false },
    { label: 'Partner Portal', url: '/partner-portal', isCurrentPage: false },
    { label: 'Partner Management', url: '', isCurrentPage: true },
  ];

  const activeTab = useTabStore((state) => state.activeTab);
  const setActiveTab = useTabStore((state) => state.setActiveTab);

  useEffect(() => {
    if (!activeTab) {
      setActiveTab('partner-overview');
    }
  }, [activeTab, setActiveTab]);

  const ActiveComponent = TabContentMap[activeTab] || PartnerOverviewTab;
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full py-6 font-poppins">
      <div className="flex flex-col w-full p-[25px] pl-[40px]">
        <h1 className="text-[#00081a] text-[1.75rem] font-medium mb-4">Partner Management</h1>

        <div className="flex items-center gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => navigate('/partner-portal')}
            className="flex items-center gap-1 py-1 px-3 rounded bg-[#064771]"
          >
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
            <span className="text-white text-[.8125rem] font-semibold">Back</span>
          </button>
          <Breadcrumb links={breadcrumbLinks} />
        </div>
      </div>

      <div className="w-full bg-white">
        <div className="relative">
          <div className="w-full h-0.5 absolute top-[39px] bg-gray-200" />
          <div className="[&>*]:mr-4 [&>*:last-child]:mr-0">
            {' '}
            <Tabs tabs={tabsData} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        <div className="mt-8 w-full">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AddPartner;
