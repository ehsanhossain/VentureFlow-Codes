import React, { useEffect, useState } from 'react';
import { Tabs } from '../../assets/tabs';
import Breadcrumb from '../../assets/breadcrumb';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { showAlert } from '../../components/Alert';

// Import icons from seller portal
import CartIcon from '../seller-portal/index/svg/CartIcon';
import ClosedDealsIcon from '../seller-portal/index/svg/ClosedDealsIcon';
import DraftsIcon from '../seller-portal/index/svg/DraftsIcon';
import FromPartnersIcon from '../seller-portal/index/svg/FromPartnersIcon';
import InterestedIcon from '../seller-portal/index/svg/InterestedIcon';
import NotInterestedIcon from '../seller-portal/index/svg/NotInterestedIcon';

// Import existing components from seller and buyer portals
import AllSellers from '../seller-portal/index/AllSellers';
import AllSellersList from '../seller-portal/index/AllSellersList';
import AllBuyers from '../buyer-portal/AllBuyers';
import AllBuyersList from '../buyer-portal/AllBuyersList';

// Type for prospect type selection
type ProspectType = 'sellers' | 'buyers' | 'all';

interface ProspectCounts {
    total: number;
    interested: number;
    notInterested: number;
    closedDeals: number;
    drafts: number;
    fromPartners: number;
}

const ProspectsPortal: React.FC = () => {
    const navigate = useNavigate();

    // Clear stored IDs
    localStorage.removeItem('seller_id');
    localStorage.removeItem('buyer_id');

    // State for type selection
    const [prospectType, setProspectType] = useState<ProspectType>('all');
    const [activeTab, setActiveTab] = useState('all-prospects');
    const [activeButton, setActiveButton] = useState('button1');

    // Seller counts
    const [sellerCounts, setSellerCounts] = useState<ProspectCounts>({
        total: 0, interested: 0, notInterested: 0, closedDeals: 0, drafts: 0, fromPartners: 0
    });

    // Buyer counts
    const [buyerCounts, setBuyerCounts] = useState<ProspectCounts>({
        total: 0, interested: 0, notInterested: 0, closedDeals: 0, drafts: 0, fromPartners: 0
    });

    // Fetch seller data
    const fetchSellerCounts = async () => {
        try {
            const [all, interested, notInterested, closed, drafts, partners] = await Promise.all([
                api.get('/api/seller'),
                api.get('/api/seller/pinned'),
                api.get('/api/seller/unpinned'),
                api.get('/api/seller/closed'),
                api.get('/api/seller/drafts'),
                api.get('/api/seller/partnerships'),
            ]);

            setSellerCounts({
                total: all.data?.meta?.total ?? 0,
                interested: interested.data?.meta?.total ?? 0,
                notInterested: notInterested.data?.meta?.total ?? 0,
                closedDeals: closed.data?.meta?.total ?? 0,
                drafts: drafts.data?.meta?.total ?? 0,
                fromPartners: partners.data?.meta?.total ?? 0,
            });
        } catch {
            showAlert({ type: 'error', message: 'Failed to fetch seller data' });
        }
    };

    // Fetch buyer data
    const fetchBuyerCounts = async () => {
        try {
            const [all, interested, notInterested, closed, drafts, partners] = await Promise.all([
                api.get('/api/buyer'),
                api.get('/api/buyer/pinned'),
                api.get('/api/buyer/unpinned'),
                api.get('/api/buyer/closed-deals'),
                api.get('/api/buyer/drafts'),
                api.get('/api/buyer/from-partners'),
            ]);

            setBuyerCounts({
                total: all.data?.meta?.total ?? 0,
                interested: interested.data?.meta?.total ?? 0,
                notInterested: notInterested.data?.meta?.total ?? 0,
                closedDeals: closed.data?.meta?.total ?? 0,
                drafts: drafts.data?.meta?.total ?? 0,
                fromPartners: partners.data?.meta?.total ?? 0,
            });
        } catch {
            showAlert({ type: 'error', message: 'Failed to fetch buyer data' });
        }
    };

    useEffect(() => {
        fetchSellerCounts();
        fetchBuyerCounts();
    }, []);

    // Calculate combined counts based on selected type
    const getCounts = () => {
        if (prospectType === 'sellers') return sellerCounts;
        if (prospectType === 'buyers') return buyerCounts;
        // Combined counts for 'all'
        return {
            total: sellerCounts.total + buyerCounts.total,
            interested: sellerCounts.interested + buyerCounts.interested,
            notInterested: sellerCounts.notInterested + buyerCounts.notInterested,
            closedDeals: sellerCounts.closedDeals + buyerCounts.closedDeals,
            drafts: sellerCounts.drafts + buyerCounts.drafts,
            fromPartners: sellerCounts.fromPartners + buyerCounts.fromPartners,
        };
    };

    const counts = getCounts();

    const tabsData = [
        {
            id: 'all-prospects',
            label: prospectType === 'sellers' ? 'All Sellers' : prospectType === 'buyers' ? 'All Buyers' : 'All Prospects',
            count: counts.total,
            activeIcon: <CartIcon isActive={true} />,
            inactiveIcon: <CartIcon isActive={false} />,
        },
        {
            id: 'interested',
            label: 'Interested',
            count: counts.interested,
            activeIcon: <InterestedIcon isActive={true} />,
            inactiveIcon: <InterestedIcon isActive={false} />,
        },
        {
            id: 'not-interested',
            label: 'Not Interested',
            count: counts.notInterested,
            activeIcon: <NotInterestedIcon isActive={true} />,
            inactiveIcon: <NotInterestedIcon isActive={false} />,
        },
        {
            id: 'closed-deals',
            label: 'Closed Deals',
            count: counts.closedDeals,
            activeIcon: <ClosedDealsIcon isActive={true} />,
            inactiveIcon: <ClosedDealsIcon isActive={false} />,
        },
        {
            id: 'drafts',
            label: 'Drafts',
            count: counts.drafts,
            activeIcon: <DraftsIcon isActive={true} />,
            inactiveIcon: <DraftsIcon isActive={false} />,
        },
        {
            id: 'from-partners',
            label: 'From Partners',
            count: counts.fromPartners,
            activeIcon: <FromPartnersIcon isActive={true} />,
            inactiveIcon: <FromPartnersIcon isActive={false} />,
        },
    ];

    const breadcrumbLinks = [
        { label: 'Home', url: '/', isCurrentPage: false },
        { label: 'Prospects', url: '/prospects', isCurrentPage: true },
    ];

    // Dummy handlers for child component props
    const handleClearFilters = () => {
        // Refresh counts when filters are cleared
        fetchSellerCounts();
        fetchBuyerCounts();
    };

    const handleApplyFilters = () => {
        // Could implement filter state tracking here if needed
    };

    // Render content based on type and tab
    const renderContent = () => {
        if (activeTab !== 'all-prospects') {
            return (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>Content for "{activeTab}" tab - Coming soon</p>
                </div>
            );
        }

        const isCardView = activeButton === 'button1';

        if (prospectType === 'sellers') {
            return isCardView
                ? <AllSellers onClearFilters={handleClearFilters} />
                : <AllSellersList onClearFilters={handleClearFilters} />;
        }

        if (prospectType === 'buyers') {
            return isCardView
                ? <AllBuyers onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
                : <AllBuyersList onClearFilters={handleClearFilters} />;
        }

        // Show both for 'all' type
        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Sellers</span>
                        <span className="text-gray-400 text-sm">({sellerCounts.total} total)</span>
                    </h3>
                    {isCardView
                        ? <AllSellers onClearFilters={handleClearFilters} />
                        : <AllSellersList onClearFilters={handleClearFilters} />}
                </div>
                <hr className="border-gray-200" />
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Buyers</span>
                        <span className="text-gray-400 text-sm">({buyerCounts.total} total)</span>
                    </h3>
                    {isCardView
                        ? <AllBuyers onApplyFilters={handleApplyFilters} onClearFilters={handleClearFilters} />
                        : <AllBuyersList onClearFilters={handleClearFilters} />}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col w-full min-h-screen font-poppins overflow-x-hidden">
            {/* Header Section */}
            <div className="flex flex-col w-full px-4 sm:px-6 lg:px-9 pt-6 pb-4">
                {/* Title */}
                <h1 className="text-xl sm:text-2xl font-medium text-[#00081a]">
                    Prospects
                </h1>

                {/* Breadcrumb and Actions Row */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-4">
                    {/* Left side - Back button and Breadcrumb */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1 py-1.5 px-3 rounded bg-[#064771] shrink-0"
                        >
                            <svg width={14} height={11} viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3.66681 9.85943H9.28387C11.2247 9.85943 12.8003 8.2839 12.8003 6.34304C12.8003 4.40217 11.2247 2.82666 9.28387 2.82666H1.55469" stroke="white" strokeWidth="1.56031" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3.17526 4.59629L1.38281 2.79245L3.17526 1" stroke="white" strokeWidth="1.56031" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-white text-sm font-semibold">Back</span>
                        </button>
                        <Breadcrumb links={breadcrumbLinks} />
                    </div>

                    {/* Right side - Action buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Create Seller Button */}
                        <button
                            onClick={() => navigate('/seller-portal/add')}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#064771] rounded-full hover:bg-[#053a5e] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className="text-white text-xs sm:text-sm whitespace-nowrap">Create Seller</span>
                        </button>

                        {/* Create Buyer Button */}
                        <button
                            onClick={() => navigate('/buyer-portal/create')}
                            className="flex items-center gap-1.5 py-1.5 px-3 bg-[#0d7b3d] rounded-full hover:bg-[#0a6431] transition-colors"
                        >
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 5V15M5 10H15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <span className="text-white text-xs sm:text-sm whitespace-nowrap">Create Buyer</span>
                        </button>

                        {/* Export Button */}
                        <button className="flex items-center gap-1.5 py-1.5 px-3 bg-[#F1FBFF] border border-[#0C5577] rounded-full hover:bg-blue-100 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.7378 15.7037C18.47 12.9714 18.47 8.53642 15.7378 5.80416C13.0055 3.0719 8.57052 3.0719 5.83826 5.80416C3.106 8.53642 3.106 12.9714 5.83826 15.7037" stroke="#0C5577" strokeWidth="1.4" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.7889 11.743L10.7889 19.8606" stroke="#0C5577" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.39823 18.2617L10.789 20.6524L13.1797 18.2617" stroke="#0C5577" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[#0C5577] text-xs sm:text-sm whitespace-nowrap">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Type Switcher */}
            <div className="px-4 sm:px-6 lg:px-9 py-4">
                <div className="inline-flex rounded-lg bg-gray-100 p-1 flex-wrap">
                    <button
                        onClick={() => setProspectType('all')}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${prospectType === 'all'
                                ? 'bg-white text-[#064771] shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All ({sellerCounts.total + buyerCounts.total})
                    </button>
                    <button
                        onClick={() => setProspectType('sellers')}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${prospectType === 'sellers'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Sellers ({sellerCounts.total})
                    </button>
                    <button
                        onClick={() => setProspectType('buyers')}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${prospectType === 'buyers'
                                ? 'bg-green-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Buyers ({buyerCounts.total})
                    </button>
                </div>
            </div>

            {/* Tabs and Content Section */}
            <div className="flex-1 bg-white w-full">
                <div className="flex flex-col w-full">
                    {/* Tabs Row with View Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 px-4 sm:px-6 lg:px-9">
                        <div className="overflow-x-auto">
                            <Tabs
                                tabs={tabsData}
                                activeTab={activeTab}
                                onTabChange={(tabId) => setActiveTab(tabId)}
                            />
                        </div>

                        {/* View Toggle */}
                        {activeTab === 'all-prospects' && (
                            <div className="flex items-center py-2 sm:py-0">
                                <button
                                    onClick={() => setActiveButton('button1')}
                                    className={`flex justify-center items-center w-9 h-9 rounded-l-md border ${activeButton === 'button1'
                                            ? 'bg-[#064771] border-[#064771]'
                                            : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
                                        <rect x="2" y="2" width="7" height="7" rx="1" fill={activeButton === 'button1' ? 'white' : '#54575C'} />
                                        <rect x="11" y="2" width="7" height="7" rx="1" fill={activeButton === 'button1' ? 'white' : '#54575C'} />
                                        <rect x="2" y="11" width="7" height="7" rx="1" fill={activeButton === 'button1' ? 'white' : '#54575C'} />
                                        <rect x="11" y="11" width="7" height="7" rx="1" fill={activeButton === 'button1' ? 'white' : '#54575C'} />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setActiveButton('button2')}
                                    className={`flex justify-center items-center w-9 h-9 rounded-r-md border-t border-r border-b ${activeButton === 'button2'
                                            ? 'bg-[#064771] border-[#064771]'
                                            : 'bg-white border-gray-300'
                                        }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 16" fill="none">
                                        <rect x="0" y="1" width="20" height="3" rx="1" fill={activeButton === 'button2' ? 'white' : '#54575C'} />
                                        <rect x="0" y="6" width="20" height="3" rx="1" fill={activeButton === 'button2' ? 'white' : '#54575C'} />
                                        <rect x="0" y="11" width="20" height="3" rx="1" fill={activeButton === 'button2' ? 'white' : '#54575C'} />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="w-full px-4 sm:px-6 lg:px-9 py-6">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProspectsPortal;
