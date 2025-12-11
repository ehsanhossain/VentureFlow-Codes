import { useDroppable } from '@dnd-kit/core';
import { Deal } from '../DealPipeline';
import DealCard from './DealCard';

interface StageColumnProps {
    code: string;
    name: string;
    deals: Deal[];
    onDealClick?: (deal: Deal) => void;
}

const StageColumn = ({ code, name, deals, onDealClick }: StageColumnProps) => {
    const { setNodeRef, isOver } = useDroppable({
        id: code,
    });

    return (
        <div className="flex flex-col w-72 shrink-0">
            {/* Column Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-t-lg border border-gray-200">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{code}</span>
                    <span className="text-sm text-gray-600 truncate">{name}</span>
                </div>
                <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-gray-600">
                    {deals.length}
                </span>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-2 space-y-3 bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg min-h-[200px] transition-colors ${isOver ? 'bg-blue-50 border-blue-200' : ''
                    }`}
            >
                {deals.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                        No deals in this stage
                    </div>
                ) : (
                    deals.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={() => onDealClick?.(deal)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default StageColumn;
