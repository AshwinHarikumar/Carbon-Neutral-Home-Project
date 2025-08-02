
import React, { useState, useMemo, useCallback } from 'react';
import { SurveyData, SavingOpportunity } from '../../types';
import { getEnergySavingSuggestions } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SummaryProps {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
    onSave: () => Promise<void>;
    isSaving: boolean;
    saveMessage: string | null;
}

const Summary: React.FC<SummaryProps> = ({ data, onDataChange, onSave, isSaving, saveMessage }) => {
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const handleGetSuggestions = useCallback(async () => {
        setIsLoadingSuggestions(true);
        setSuggestionError(null);
        try {
            const suggestions = await getEnergySavingSuggestions(data);
            onDataChange('savingOpportunities', suggestions);
        } catch (error) {
            setSuggestionError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, [data, onDataChange]);

    const {
        totalAnnualConsumption,
        totalArea,
        presentEPI,
        reducedAnnualConsumption,
        projectedEPI,
        annualBillReduction,
        co2Reduction
    } = useMemo(() => {
        const totalDailyConsumptionKWh_B = data.equipmentEstimations.reduce((acc, item) => acc + (Number(item.energyConsumptionWh) || 0), 0) / 1000;
        const totalAnnualConsumption = totalDailyConsumptionKWh_B * 365;
        const totalArea = Number(data.electricityConnection.buildingArea) || 0;
        const presentEPI = totalArea > 0 ? totalAnnualConsumption / totalArea : 0;
        
        const totalDailySavingWh = data.savingOpportunities.reduce((acc, item) => acc + (Number(item.energySavingWh) || 0), 0);
        const annualSavingKWh = (totalDailySavingWh * 365) / 1000;
        
        const reducedAnnualConsumption = totalAnnualConsumption - annualSavingKWh;
        const projectedEPI = totalArea > 0 ? reducedAnnualConsumption / totalArea : 0;

        const AVG_ELECTRICITY_COST_PER_UNIT = 5;
        const CO2_EMISSION_FACTOR_PER_KWH = 0.79;

        const annualBillReduction = annualSavingKWh * AVG_ELECTRICITY_COST_PER_UNIT;
        const co2Reduction = annualSavingKWh * CO2_EMISSION_FACTOR_PER_KWH;

        return {
            totalAnnualConsumption,
            totalArea,
            presentEPI,
            reducedAnnualConsumption,
            projectedEPI,
            annualBillReduction,
            co2Reduction
        };
    }, [data.equipmentEstimations, data.electricityConnection.buildingArea, data.savingOpportunities]);
    
    const chartData = useMemo(() => {
        return data.equipmentEstimations
            .filter(e => e.equipment && e.energyConsumptionWh)
            .sort((a, b) => (b.energyConsumptionWh || 0) - (a.energyConsumptionWh || 0))
            .slice(0, 10)
            .map(e => ({
                name: e.equipment,
                'Daily Wh': e.energyConsumptionWh
            }));
    }, [data.equipmentEstimations]);

    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">IV & V. Savings & Energy Performance Index (EPI)</h2>
            
            {/* AI Suggestions Section */}
            <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Identify Opportunities for Saving</h3>
                <p className="text-sm text-gray-600 mb-4">Click the button below to get AI-powered energy saving suggestions based on your survey data.</p>
                <button onClick={handleGetSuggestions} disabled={isLoadingSuggestions} className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-wait transition-all">
                    {isLoadingSuggestions ? 'Generating Suggestions...' : 'Get AI Suggestions'}
                </button>
                {suggestionError && <p className="text-red-600 mt-2">{suggestionError}</p>}

                <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-100">
                            <tr>
                                {['Suggestion', 'Energy Saving/day (Wh)', 'Investment (₹)', 'Payback (months)', 'Remarks'].map(header => (
                                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.savingOpportunities.length > 0 ? data.savingOpportunities.map(opp => (
                                <tr key={opp.id}>
                                    <td className="p-3 text-sm">{opp.suggestion}</td>
                                    <td className="p-3 text-sm">{opp.energySavingWh}</td>
                                    <td className="p-3 text-sm">{opp.investment}</td>
                                    <td className="p-3 text-sm">{opp.paybackMonths}</td>
                                    <td className="p-3 text-sm">{opp.remarks}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No suggestions generated yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EPI & Metrics Section */}
            <div className="p-6 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Energy Performance Index (EPI)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricCard title="Annual Consumption (C)" value={`${totalAnnualConsumption.toFixed(2)} kWh`} />
                    <MetricCard title="Total Area (A)" value={`${totalArea} m²`} />
                    <MetricCard title="Present EPI (C/A)" value={presentEPI.toFixed(2)} unit="kWh/m²/year" />
                    <MetricCard title="Reduced Annual Consumption (c)" value={`${reducedAnnualConsumption.toFixed(2)} kWh`} />
                    <MetricCard title="Projected EPI (c/A)" value={projectedEPI.toFixed(2)} unit="kWh/m²/year" />
                    <MetricCard title="Annual Bill Reduction" value={`₹ ${annualBillReduction.toFixed(2)}`} />
                    <MetricCard title="CO₂ Emission Reduction" value={`${co2Reduction.toFixed(2)} kgCO₂`} />
                </div>
            </div>
            
            {/* Chart Section */}
            {chartData.length > 0 &&
                <div className="p-6 border rounded-lg bg-white shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Top Energy Consuming Appliances (Daily)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Daily Wh" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            }

            {/* Save Section */}
            <div className="mt-8 pt-6 border-t flex flex-col items-center">
                 <button onClick={onSave} disabled={isSaving} className="w-full max-w-xs px-6 py-3 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-wait transition-all">
                    {isSaving ? 'Saving...' : 'Save Final Survey'}
                </button>
            </div>
        </div>
    );
};

const MetricCard: React.FC<{title: string; value: string; unit?: string}> = ({ title, value, unit }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {unit && <p className="text-xs text-gray-400">{unit}</p>}
    </div>
);

export default Summary;
