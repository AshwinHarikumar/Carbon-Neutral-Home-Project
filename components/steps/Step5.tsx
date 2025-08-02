
import React, { useMemo } from 'react';
import { SurveyData, EquipmentEntry } from '../../types';

interface Step5Props {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
}

const commonAppliances: { name: string; wattage: number }[] = [
    { name: 'Ceiling Fan', wattage: 75 },
    { name: 'Refrigerator', wattage: 200 },
    { name: 'LED Bulb', wattage: 9 },
    { name: 'Television (LED)', wattage: 100 },
    { name: 'Washing Machine', wattage: 500 },
    { name: 'Water Pump (0.5HP)', wattage: 375 },
    { name: 'AC (1 Ton)', wattage: 1200 },
    { name: 'Iron Box', wattage: 1000 },
    { name: 'Mixer Grinder', wattage: 550 },
    { name: 'Laptop Charger', wattage: 65 },
];

const Step5: React.FC<Step5Props> = ({ data, onDataChange }) => {

    const handleEquipmentChange = (index: number, field: keyof EquipmentEntry, value: string | number) => {
        const updatedEquipment = data.equipmentEstimations.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };
                if (['dailyUsageHours', 'powerWatts'].includes(field as string)) {
                    const consumption = (Number(updatedItem.dailyUsageHours) || 0) * (Number(updatedItem.powerWatts) || 0);
                    updatedItem.energyConsumptionWh = consumption;
                }
                return updatedItem;
            }
            return item;
        });
        onDataChange('equipmentEstimations', updatedEquipment);
    };
    
    const addPresetEquipment = (name: string, wattage: number) => {
        const newEquipment: EquipmentEntry = {
            id: `equip-${Date.now()}`,
            equipment: name,
            powerWatts: wattage,
            dailyUsageHours: '',
            energyConsumptionWh: 0,
            remarks: ''
        };
        onDataChange('equipmentEstimations', [...data.equipmentEstimations, newEquipment]);
    };

    const addCustomEquipmentEntry = () => {
        const newEquipment: EquipmentEntry = {
            id: `equip-${Date.now()}`,
            equipment: '', dailyUsageHours: '', powerWatts: '', energyConsumptionWh: '', remarks: ''
        };
        onDataChange('equipmentEstimations', [...data.equipmentEstimations, newEquipment]);
    };

    const removeEquipmentEntry = (id: string) => {
        onDataChange('equipmentEstimations', data.equipmentEstimations.filter(e => e.id !== id));
    };

    const totalEnergyConsumptionKWh = useMemo(() => {
        const totalWh = data.equipmentEstimations.reduce((acc, item) => acc + (Number(item.energyConsumptionWh) || 0), 0);
        return totalWh / 1000;
    }, [data.equipmentEstimations]);


    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">III. Daily Equipment Wise Usage Estimation</h2>
            
            <div className="p-4 border border-dashed rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-700">Add Common Appliances</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Click to add a common appliance with its typical wattage pre-filled.</p>
                <div className="flex flex-wrap gap-3">
                    {commonAppliances.map(appliance => (
                        <button
                            key={appliance.name}
                            onClick={() => addPresetEquipment(appliance.name, appliance.wattage)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            {appliance.name} ({appliance.wattage}W)
                        </button>
                    ))}
                </div>
            </div>

             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Equipment', 'Daily Usage (Hours)', 'Rated Power (Watts)', 'Energy Consumption (Watt hour)', 'Remarks', 'Actions'].map(header => (
                                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.equipmentEstimations.length > 0 ? data.equipmentEstimations.map((item, index) => (
                             <tr key={item.id}>
                                <td className="p-2"><input type="text" value={item.equipment} onChange={e => handleEquipmentChange(index, 'equipment', e.target.value)} className="w-40 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" placeholder="e.g. 4" value={item.dailyUsageHours} onChange={e => handleEquipmentChange(index, 'dailyUsageHours', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={item.powerWatts} onChange={e => handleEquipmentChange(index, 'powerWatts', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={item.energyConsumptionWh} className="w-28 p-1 border rounded bg-gray-100" readOnly/></td>
                                <td className="p-2"><input type="text" value={item.remarks} onChange={e => handleEquipmentChange(index, 'remarks', e.target.value)} className="w-40 p-1 border rounded"/></td>
                                <td className="p-2"><button onClick={() => removeEquipmentEntry(item.id)} className="text-red-600 hover:text-red-900">Remove</button></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center p-4 text-gray-500">No equipment added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={addCustomEquipmentEntry} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Add Custom Equipment</button>
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <div className="font-bold text-gray-700">Total Energy Consumption in kWh (B): <span className="text-blue-600">{totalEnergyConsumptionKWh.toFixed(2)} kWh</span></div>
            </div>

            <p className="text-sm text-gray-600 italic">Validate if the difference of A (from bills) and B (from equipment) is within 10%, otherwise verify the daily equipment wise usage estimation.</p>
        </div>
    );
};

export default Step5;
