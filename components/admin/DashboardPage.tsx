
import React, { useEffect, useState, useCallback } from 'react';
import { getSurveys, updateSurvey } from '../../services/firebaseService';
import { SurveyData } from '../../types';
import * as XLSX from 'xlsx';
import SurveyDetailModal from './SurveyDetailModal';

interface DashboardPageProps {
    onLogout: () => void;
}

const flattenSurveyDataForExport = (surveys: SurveyData[]) => {
    return surveys.map(s => {
        // Simple aggregations for array fields
        const totalBill = s.billEstimations.reduce((acc, b) => acc + (Number(b.total) || 0), 0);
        const avgConsumption = s.billEstimations.length > 0 ? s.billEstimations.reduce((acc, b) => acc + (Number(b.consumption) || 0), 0) / s.billEstimations.length : 0;
        const totalEquipmentWh = s.equipmentEstimations.reduce((acc, e) => acc + (Number(e.energyConsumptionWh) || 0), 0);

        return {
            'Survey ID': s.id,
            'Submission Date': s.submissionDate ? new Date(s.submissionDate).toLocaleDateString() : 'N/A',
            'Appraiser Name': s.appraiserInfo.name,
            'Appraiser Enrollment ID': s.appraiserInfo.enrollmentId,
            'Consumer Name': s.electricityConnection.consumerName,
            'Consumer Number': s.electricityConnection.consumerNumber,
            'Family Members': s.electricityConnection.familyMembers,
            'Building Type': s.electricityConnection.buildingType,
            'Building Area (m2)': s.electricityConnection.buildingArea,
            'Connected Load (W)': s.electricityConnection.connectedLoadWatts,
            'Solar Installed': s.electricityConnection.solarInstalled,
            'Avg Bill Consumption (kWh)': avgConsumption.toFixed(2),
            'Total Bill Amount (Rs)': totalBill.toFixed(2),
            'Total Equipment Consumption (Wh/day)': totalEquipmentWh.toFixed(2),
            'Num Vehicles': s.vehicleUsage.length,
            'Num Fuel Types': s.fuelForCooking.length,
            'Num Saving Opportunities': s.savingOpportunities.length,
        };
    });
};

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
    const [surveys, setSurveys] = useState<SurveyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSurvey, setSelectedSurvey] = useState<SurveyData | null>(null);

    const fetchSurveys = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getSurveys();
            setSurveys(data.sort((a, b) => new Date(b.submissionDate!).getTime() - new Date(a.submissionDate!).getTime()));
        } catch (err) {
            setError("Failed to fetch survey data. Please try again later.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSurveys();
    }, [fetchSurveys]);
    
    const handleSaveSurvey = async (id: string, data: SurveyData) => {
        try {
            await updateSurvey(id, data);
            await fetchSurveys(); // Refetch all data to ensure consistency
            setSelectedSurvey(null); // Close modal on success
        } catch(err) {
            console.error(err);
            alert("Failed to save survey. Please check the console for details.");
        }
    };

    const handleExport = () => {
        if (surveys.length === 0) {
            alert("No data available to export.");
            return;
        }
        const flattenedData = flattenSurveyDataForExport(surveys);
        const worksheet = XLSX.utils.json_to_sheet(flattenedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Submissions");
        XLSX.writeFile(workbook, "CarbonNeutralHome_Surveys.xlsx");
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <>
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">Carbon Neutral Home - Admin</h1>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Export to Excel
                            </button>
                             <button
                                onClick={onLogout}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Survey Submissions</h2>
                                <p className="mt-1 text-sm text-gray-600">A list of all submitted energy appraisal surveys.</p>
                            </div>
                             <button onClick={fetchSurveys} className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200" disabled={isLoading}>
                                {isLoading ? 'Refreshing...' : 'Refresh Data'}
                            </button>
                        </div>
                         {isLoading && <p className="p-6 text-center text-gray-600">Loading surveys...</p>}
                         {error && <p className="p-6 text-center text-red-600">{error}</p>}
                         {!isLoading && !error && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumer Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appraiser</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {surveys.map((survey) => (
                                            <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{survey.electricityConnection.consumerName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{survey.appraiserInfo.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{survey.electricityConnection.buildingType}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(survey.submissionDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => setSelectedSurvey(survey)} className="text-blue-600 hover:text-blue-800">
                                                        View / Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                         )}
                    </div>
                </div>
            </main>
            
            {selectedSurvey && (
                <SurveyDetailModal 
                    survey={selectedSurvey} 
                    onSave={handleSaveSurvey}
                    onClose={() => setSelectedSurvey(null)} 
                />
            )}
        </>
    );
};

export default DashboardPage;