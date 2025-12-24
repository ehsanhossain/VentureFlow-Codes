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

interface SharedBuyer {
    id: number;
    teaser_overview: {
        hq_country?: string;
        company_type?: string;
        main_industry_operations?: string[];
        txn_timeline?: string;
    };
    target_preference?: {
        investment_size?: string;
    };
}

const InvestorList = () => {
    const { user } = useContext(AuthContext);
    const [investors, setInvestors] = useState<SharedBuyer[]>([]);
    const [loading, setLoading] = useState(true);

    // TODO: Retrieve partner_id from user context once backend is updated 
    // For now, we might need to fetch it or rely on a property in user object
    // const partnerId = (user as any)?.partner?.id; 
    const partnerId = 1; // HARDCODED for Layout Development until Auth is fixed

    useEffect(() => {
        if (partnerId) {
            const fetchInvestors = async () => {
                try {
                    const response = await api.get(`/api/partners/${partnerId}/shared-buyers`);
                    setInvestors(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch investors", error);
                    showAlert({ type: "error", message: "Failed to fetch assigned investors." });
                } finally {
                    setLoading(false);
                }
            };

            fetchInvestors();
        }
    }, [partnerId]);

    if (loading) return <div>Loading Investors...</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#30313D] font-poppins">Assigned Investors</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Industry</TableHead>
                            <TableHead>HQ Country</TableHead>
                            <TableHead>Deal Timeline</TableHead>
                            <TableHead>Investment Size</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investors.length > 0 ? (
                            investors.map((buyer) => (
                                <TableRow key={buyer.id}>
                                    <TableCell>
                                        {Array.isArray(buyer.teaser_overview?.main_industry_operations)
                                            ? buyer.teaser_overview?.main_industry_operations.join(', ')
                                            : buyer.teaser_overview?.main_industry_operations || '-'}
                                    </TableCell>
                                    <TableCell>{buyer.teaser_overview?.hq_country || '-'}</TableCell>
                                    <TableCell>{buyer.teaser_overview?.txn_timeline || '-'}</TableCell>
                                    <TableCell>{buyer.target_preference?.investment_size || '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4">
                                    No investors assigned yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default InvestorList;
