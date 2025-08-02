
import React, { useState, useEffect } from 'react';
import { SurveyData, AppraiserInfo, ElectricityConnection, WaterUsage, BillEntry, EquipmentEntry } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';

interface SurveyDetailModalProps {
    survey: SurveyData;
    onSave: (id: string, data: SurveyData) => Promise<void>;
    onClose: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">{title}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const ViewField: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-gray-500 capitalize">{label.replace(/([A-Z])/g, ' $1')}</dt>
        <dd className="text-sm text-gray-900 break-words">{String(value || 'N/A')}</dd>
    </div>
);


const SurveyDetailModal: React.FC<SurveyDetailModalProps> = ({ survey, onSave, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState<SurveyData>(JSON.parse(JSON.stringify(survey)));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Reset state if a new survey is selected
        setEditableData(JSON.parse(JSON.stringify(survey)));
        setIsEditing(false);
    }, [survey]);

    const handleInputChange = (section: keyof SurveyData, field: string, value: any) => {
        setEditableData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value,
            }
        }));
    };
    
    // A more specific handler for arrays of objects is needed if editing them is required.
    // For now, this modal focuses on editing top-level objects like appraiserInfo, etc.

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(survey.id!, editableData);
        setIsSaving(false);
        setIsEditing(false); // Go back to view mode after save
    };
    
    const handleCancel = () => {
        setEditableData(JSON.parse(JSON.stringify(survey))); // Revert changes
        setIsEditing(false);
    }

    const renderAppraiserInfo = (data: AppraiserInfo) => (
        Object.keys(data).map(key => (
            isEditing ?
            <Input key={key} label={key} id={key} value={data[key as keyof AppraiserInfo]} onChange={e => handleInputChange('appraiserInfo', key, e.target.value)} /> :
            <ViewField key={key} label={key} value={data[key as keyof AppraiserInfo]} />
        ))
    );

    const renderConnectionDetails = (data: ElectricityConnection) => (
        Object.keys(data).map(key => (
            isEditing ?
            <Input key={key} label={key} id={key} value={data[key as keyof ElectricityConnection]} onChange={e => handleInputChange('electricityConnection', key, e.target.value)} /> :
            <ViewField key={key} label={key} value={data[key as keyof ElectricityConnection]} />
        ))
    );
    
    const renderWaterUsage = (data: WaterUsage) => (
         Object.keys(data).map(key => (
            isEditing ?
            <Input key={key} label={key} id={key} value={data[key as keyof WaterUsage]} onChange={e => handleInputChange('waterUsage', key, e.target.value)} /> :
            <ViewField key={key} label={key} value={data[key as keyof WaterUsage]} />
        ))
    );

    const renderTable = (title: string, items: any[], columns: { key: string, label: string }[]) => (
        <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">{title}</h4>
            {items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>{columns.map(c => <th key={c.key} className="p-2 text-left font-medium">{c.label}</th>)}</tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id || index} className="border-b">
                                    {columns.map(c => <td key={c.key} className="p-2">{String(item[c.key] || '')}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p className="text-sm text-gray-500">No data available.</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" aria-modal="true" role="dialog">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col">
                <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold text-gray-800">Survey: {survey.electricityConnection.consumerName}</h3>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                            </>
                        ) : (
                             <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
                                Edit
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <DetailSection title="Appraiser Info">{renderAppraiserInfo(isEditing ? editableData.appraiserInfo : survey.appraiserInfo)}</DetailSection>
                    <DetailSection title="Electricity Connection">{renderConnectionDetails(isEditing ? editableData.electricityConnection : survey.electricityConnection)}</DetailSection>
                    <DetailSection title="Water Usage">{renderWaterUsage(isEditing ? editableData.waterUsage : survey.waterUsage)}</DetailSection>
                    
                    {renderTable('Bill Estimations', survey.billEstimations, [
                        { key: 'period', label: 'Period' }, { key: 'consumption', label: 'Consumption (kWh)'}, { key: 'total', label: 'Total (Rs)' }, { key: 'remarks', label: 'Remarks' }
                    ])}
                    
                     {renderTable('Equipment Usage', survey.equipmentEstimations, [
                        { key: 'equipment', label: 'Equipment' }, { key: 'dailyUsageHours', label: 'Usage (Hrs)'}, { key: 'powerWatts', label: 'Power (W)' }, { key: 'energyConsumptionWh', label: 'Consumption (Wh)' }
                    ])}

                    {renderTable('Solar Plant Details', survey.solarPlantDetails, [
                        { key: 'type', label: 'Type' }, { key: 'installedCapacity', label: 'Capacity (kWp)'}, { key: 'remarks', label: 'Remarks' }
                    ])}

                    {renderTable('Fuel for Cooking', survey.fuelForCooking, [
                        { key: 'type', label: 'Type' }, { key: 'consumption', label: 'Consumption'}, { key: 'units', label: 'Units' }
                    ])}

                     {renderTable('Vehicle Usage', survey.vehicleUsage, [
                        { key: 'type', label: 'Type' }, { key: 'fuelType', label: 'Fuel'}, { key: 'monthlyUsageKm', label: 'Usage (km)' }, { key: 'monthlyFuelExpense', label: 'Expense (Rs)' }
                    ])}
                    
                     {renderTable('Saving Opportunities', survey.savingOpportunities, [
                        { key: 'suggestion', label: 'Suggestion' }, { key: 'energySavingWh', label: 'Saving (Wh)'}, { key: 'investment', label: 'Investment (Rs)' }, { key: 'paybackMonths', label: 'Payback (Months)' }
                    ])}
                </main>
            </div>
        </div>
    );
};

export default SurveyDetailModal;