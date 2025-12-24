import React, { useEffect, useState, useContext } from 'react';
import api from '../../../config/api';
import { AuthContext } from '../../../routes/AuthContext';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../components/table/table';
import { showAlert } from '../../../components/Alert';

interface SharedSeller {
    id: number;
    teaser_overview: {
        hq_country?: string;
        industry_ops?: string[];
        year_founded?: string;
        description?: string;
    };
    financial_details?: {
        revenue?: string;
        ebitda?: string;
    };
}

const SellerList = () => {
    const { user } = useContext(AuthContext);
    const [sellers, setSellers] = useState<SharedSeller[]>([]);
    const [loading, setLoading] = useState(true);

    // TODO: Retrieve partner_id from user context once backend is updated 
    const partnerId = 1; // HARDCODED for Layout Development until Auth is fixed

    useEffect(() => {
        if (partnerId) {
            const fetchSellers = async () => {
                try {
                    const response = await api.get(`/api/partners/${partnerId}/shared-sellers`);
                    setSellers(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch sellers", error);
                    showAlert({ type: "error", message: "Failed to fetch assigned targets." });
                } finally {
                    setLoading(false);
                }
            };

            fetchSellers();
        }
    }, [partnerId]);

    if (loading) return <div>Loading Targets...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#30313D] font-poppins">Assigned Targets</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Industry</TableHead>
                            <TableHead>HQ Country</TableHead>
                            <TableHead>Year Founded</TableHead>
                            <TableHead>Revenue</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sellers.length > 0 ? (
                            sellers.map((seller) => (
                                <TableRow key={seller.id}>
                                    <TableCell>
                                        {Array.isArray(seller.teaser_overview?.industry_ops)
                                            ? seller.teaser_overview?.industry_ops.join(', ')
                                            : seller.teaser_overview?.industry_ops || '-'}
                                    </TableCell>
                                    <TableCell>{seller.teaser_overview?.hq_country || '-'}</TableCell>
                                    <TableCell>{seller.teaser_overview?.year_founded || '-'}</TableCell>
                                    <TableCell>{seller.financial_details?.revenue || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                    No targets assigned yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default SellerList;
