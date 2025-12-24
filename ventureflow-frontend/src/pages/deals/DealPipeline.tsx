import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Country, Dropdown } from '../currency/components/Dropdown';
import { showAlert } from '../../components/Alert';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import DealCard from './components/DealCard';
import KPIDashboard from './components/KPIDashboard';
import StageColumn from './components/StageColumn';
import CreateDealModal from './components/CreateDealModal';

// Stage definitions matching backend
const STAGES = {
    K: { name: 'Buyer Sourcing', progress: 5 },
    J: { name: 'Onboarding', progress: 10 },
    I: { name: 'Target Sourcing', progress: 20 },
    H: { name: 'Interest Check', progress: 30 },
    G: { name: 'NDA & IM Delivery', progress: 40 },
    F: { name: 'Top Meeting & IOI', progress: 50 },
    E: { name: 'LOI / Exclusivity', progress: 65 },
    D: { name: 'Due Diligence', progress: 80 },
    C: { name: 'SPA Negotiation', progress: 90 },
    B: { name: 'Deal Closing', progress: 95 },
    A: { name: 'Success', progress: 100 },
} as const;

type StageCode = keyof typeof STAGES;

export interface Deal {
    id: number;
    name: string;
    buyer_id: number;
    seller_id: number;
    industry: string | null;
    region: string | null;
    estimated_ev_value: number | null;
    estimated_ev_currency: string;
    stage_code: StageCode;
    progress_percent: number;
    priority: 'low' | 'medium' | 'high';
    pic_user_id: number | null;
    target_close_date: string | null;
    status: 'active' | 'on_hold' | 'lost' | 'won';
    comment_count: number;
    attachment_count: number;
    updated_at: string;
    buyer?: {
        id: number;
        company_overview?: {
            reg_name: string;
        };
    };
    seller?: {
        id: number;
        company_overview?: {
            reg_name: string;
        };
    };
    pic?: {
        id: number;
        name: string;
    };
}

interface KPIData {
    expected_transaction: number;
    active_deals: number;
    late_stage: number;
    avg_progress: number;
    velocity_score: number;
}

interface GroupedDeals {
    [key: string]: {
        code: string;
        name: string;
        progress: number;
        deals: Deal[];
    };
}

const DealPipeline = () => {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<GroupedDeals>({});
    const [kpis, setKpis] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'board' | 'table' | 'analysis'>('board');
    const [selectedStage, setSelectedStage] = useState<StageCode | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await api.get('/api/countries');
                const formatted = response.data.map((country: any) => ({
                    id: country.id,
                    name: country.name,
                    flagSrc: country.svg_icon_url,
                }));
                setCountries(formatted);
            } catch {
                // Silent fail or show alert
            }
        };
        fetchCountries();
    }, []);

    const fetchDeals = async () => {
        try {
            const response = await api.get('/api/deals', {
                params: {
                    search: searchQuery || undefined,
                    country: selectedCountry?.id || undefined
                }
            });
            setDeals(response.data.grouped);
        } catch {
            showAlert({ type: 'error', message: 'Failed to fetch deals' });
        }
    };

    const fetchKPIs = async () => {
        try {
            const response = await api.get('/api/deals/dashboard');
            setKpis(response.data);
        } catch {
            showAlert({ type: 'error', message: 'Failed to fetch dashboard data' });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchDeals(), fetchKPIs()]);
            setLoading(false);
        };
        loadData();
    }, [searchQuery, selectedCountry]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const dealId = Number(active.id);

        // Find the deal being dragged
        for (const stageData of Object.values(deals)) {
            const found = stageData.deals.find((d) => d.id === dealId);
            if (found) {
                setActiveDeal(found);
                break;
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = Number(active.id);
        const newStage = String(over.id) as StageCode;

        // Find current deal
        let currentDeal: Deal | undefined;
        for (const stageData of Object.values(deals)) {
            currentDeal = stageData.deals.find((d) => d.id === dealId);
            if (currentDeal) break;
        }

        if (!currentDeal || currentDeal.stage_code === newStage) return;

        // Optimistic update
        const oldDeals = { ...deals };
        const updatedDeals = { ...deals };

        // Remove from old stage
        updatedDeals[currentDeal.stage_code] = {
            ...updatedDeals[currentDeal.stage_code],
            deals: updatedDeals[currentDeal.stage_code].deals.filter((d) => d.id !== dealId),
        };

        // Add to new stage
        const updatedDeal = {
            ...currentDeal,
            stage_code: newStage,
            progress_percent: STAGES[newStage].progress,
        };
        updatedDeals[newStage] = {
            ...updatedDeals[newStage],
            deals: [...updatedDeals[newStage].deals, updatedDeal],
        };

        setDeals(updatedDeals);

        try {
            await api.patch(`/api/deals/${dealId}/stage`, { stage_code: newStage });
            fetchKPIs(); // Refresh KPIs
            showAlert({ type: 'success', message: `Moved to ${STAGES[newStage].name}` });
        } catch {
            setDeals(oldDeals); // Revert on error
            showAlert({ type: 'error', message: 'Failed to update stage' });
        }
    };

    const handleDealCreated = () => {
        setShowCreateModal(false);
        fetchDeals();
        fetchKPIs();
    };

    const stageEntries = Object.entries(STAGES) as [StageCode, typeof STAGES[StageCode]][];

    return (
        <div className="flex flex-col h-full min-h-screen bg-gray-50 font-poppins overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-semibold text-gray-900">Deal Pipeline</h1>

                    {/* Country Filter */}
                    <div className="w-60">
                        <Dropdown
                            countries={countries}
                            selected={selectedCountry}
                            onSelect={setSelectedCountry}
                            placeholder="Filter by Country"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search deals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Deal
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Pipeline Workflow */}
                <div className="w-64 bg-white border-r overflow-y-auto shrink-0">
                    <div className="p-4">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                            Pipeline Workflow
                        </h2>
                        <div className="text-sm text-gray-500 mb-4">Buyer Side Stages</div>
                        <div className="space-y-1">
                            {stageEntries.map(([code, stage]) => {
                                const stageDeals = deals[code]?.deals || [];
                                const isSelected = selectedStage === code;
                                return (
                                    <button
                                        key={code}
                                        onClick={() => setSelectedStage(isSelected ? null : code)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className="font-medium">{code}</span>
                                            <span className="truncate">{stage.name}</span>
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${stageDeals.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {stageDeals.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* KPI Dashboard */}
                    <div className="p-4 bg-white border-b">
                        <div className="text-sm text-gray-500 mb-3">
                            Dashboard – Executive overview and team performance metrics
                        </div>
                        <KPIDashboard kpis={kpis} loading={loading} />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-white border-b">
                        {(['board', 'table', 'analysis'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab === 'board' ? 'Deal Board' : tab === 'table' ? 'Table View' : 'Analysis'}
                            </button>
                        ))}
                    </div>

                    {/* Kanban Board */}
                    {activeTab === 'board' && (
                        <div className="flex-1 overflow-x-auto p-4">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCorners}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                            >
                                <div className="flex gap-4 min-w-max">
                                    {stageEntries
                                        .filter(([code]) => !selectedStage || selectedStage === code)
                                        .map(([code, stage]) => (
                                            <StageColumn
                                                key={code}
                                                code={code}
                                                name={stage.name}
                                                deals={deals[code]?.deals || []}
                                                onDealClick={(deal) => navigate(`/deals/${deal.id}`)}
                                            />
                                        ))}
                                </div>
                                <DragOverlay>
                                    {activeDeal ? <DealCard deal={activeDeal} isDragging /> : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    )}

                    {activeTab === 'table' && (
                        <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
                            Table View - Coming Soon
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="flex-1 p-4 flex items-center justify-center text-gray-500">
                            Analysis - Coming Soon
                        </div>
                    )}
                </div>
            </div>

            {/* Create Deal Modal */}
            {showCreateModal && (
                <CreateDealModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleDealCreated}
                />
            )}
        </div>
    );
};

export default DealPipeline;
