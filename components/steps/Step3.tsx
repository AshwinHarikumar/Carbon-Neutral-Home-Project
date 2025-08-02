import React from 'react';
import { SurveyData, SolarPlantDetail, FuelForCooking, VehicleUsage, WaterUsage } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step3Props {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
}

const Step3: React.FC<Step3Props> = ({ data, onDataChange }) => {

    // Generic handler for dynamic lists
    const handleListChange = <T,>(listKey: keyof SurveyData, index: number, field: keyof T, value: any) => {
        const list = (data[listKey] as T[]).slice();
        list[index] = { ...list[index], [field]: value };
        onDataChange(listKey, list as any);
    };

    const addListItem = (listKey: 'solarPlantDetails' | 'fuelForCooking' | 'vehicleUsage') => {
        let newItem: any;
        switch (listKey) {
            case 'solarPlantDetails': newItem = { id: `solar-${Date.now()}`, type: '', installedCapacity: '', remarks: '' }; break;
            case 'fuelForCooking': newItem = { type: 'Firewood', consumption: '', units: 'Kg', remarks: '' }; break;
            case 'vehicleUsage': newItem = { type: '2 wheeler', fuelType: '', monthlyUsageKm: '', monthlyFuelConsumption: '', monthlyFuelExpense: '', remarks: ''}; break;
        }
        onDataChange(listKey, [...data[listKey], newItem] as any);
    };
    
    const removeListItem = (listKey: keyof SurveyData, index: number) => {
        const list = (data[listKey] as any[]).slice();
        list.splice(index, 1);
        onDataChange(listKey, list as any);
    };

    const handleWaterUsageChange = (field: keyof WaterUsage, value: any) => {
        const updatedWaterUsage = {
            ...data.waterUsage,
            [field]: value
        };
    
        const pumpCapacityHP = Number(updatedWaterUsage.pumpCapacity) || 0;
        const fillTimeHours = Number(updatedWaterUsage.fillTime) || 0;
        const pumpFrequencyPerDay = Number(updatedWaterUsage.pumpFrequency) || 0;
    
        if (pumpCapacityHP > 0 && fillTimeHours > 0 && pumpFrequencyPerDay > 0) {
            const pumpWatts = pumpCapacityHP * 746;
            const dailyWh = pumpWatts * fillTimeHours * pumpFrequencyPerDay;
            const dailyKWh = dailyWh / 1000;
            const annualKWh = dailyKWh * 365;
    
            updatedWaterUsage.dailyPowerConsumption = parseFloat(dailyKWh.toFixed(3));
            updatedWaterUsage.annualPowerConsumption = parseFloat(annualKWh.toFixed(2));
        } else {
            updatedWaterUsage.dailyPowerConsumption = '';
            updatedWaterUsage.annualPowerConsumption = '';
        }
        
        onDataChange('waterUsage', updatedWaterUsage);
    };


    return (
        <div className="space-y-8 animate-fade-in">
            {/* Solar Plant Details */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Solar Plant Details</h3>
                {data.solarPlantDetails.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <Select label="Type of Solar Plant" id={`solar-type-${index}`} value={item.type} onChange={e => handleListChange('solarPlantDetails', index, 'type', e.target.value)}>
                             <option value="">Select...</option>
                             <option value="Off grid">Off grid</option>
                             <option value="On grid">On grid</option>
                             <option value="Hybrid">Hybrid</option>
                        </Select>
                        <Input label="Installed Capacity (kWp)" id={`solar-capacity-${index}`} type="number" value={item.installedCapacity} onChange={e => handleListChange('solarPlantDetails', index, 'installedCapacity', e.target.valueAsNumber || '')} />
                        <Input label="Remarks" id={`solar-remarks-${index}`} value={item.remarks} onChange={e => handleListChange('solarPlantDetails', index, 'remarks', e.target.value)} />
                        <button onClick={() => removeListItem('solarPlantDetails', index)} className="mt-6 self-end h-10 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
                    </div>
                ))}
                <button onClick={() => addListItem('solarPlantDetails')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Add Solar Plant</button>
            </div>

            {/* Fuel used for Cooking */}
            <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Fuel used for Cooking</h3>
                 {data.fuelForCooking.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                       <Select label="Type of fuel" id={`fuel-type-${index}`} value={item.type} onChange={e => handleListChange('fuelForCooking', index, 'type', e.target.value)}>
                            <option value="Firewood">Firewood (Kg)</option>
                            <option value="LPG Cylinder">LPG Cylinder (Cylinders)</option>
                            <option value="Biogas">Biogas (Hours)</option>
                            <option value="Induction Cooker">Induction Cooker (Hours)</option>
                            <option value="Others">Others</option>
                        </Select>
                        <Input label="Consumption per month" id={`fuel-consumption-${index}`} type="number" value={item.consumption} onChange={e => handleListChange('fuelForCooking', index, 'consumption', e.target.valueAsNumber || '')}/>
                        <Input label="Remarks" id={`fuel-remarks-${index}`} value={item.remarks} onChange={e => handleListChange('fuelForCooking', index, 'remarks', e.target.value)} />
                        <button onClick={() => removeListItem('fuelForCooking', index)} className="mt-6 self-end h-10 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
                    </div>
                 ))}
                 <button onClick={() => addListItem('fuelForCooking')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Add Fuel Type</button>
            </div>

            {/* Water Usage Details */}
            <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Water Usage Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg">
                    <Select label="Source of water" id="water-source" value={data.waterUsage.source} onChange={e => handleWaterUsageChange('source', e.target.value as any)}>
                        <option value="">Select...</option>
                        <option value="Open well">Open well</option>
                        <option value="Bore well">Bore well</option>
                        <option value="Underground tank">Underground tank</option>
                        <option value="Municipal water">Municipal water</option>
                    </Select>
                    <Input label="Municipal water bi-monthly consumption (Kilo liters)" id="water-municipal-consumption" type="number" value={data.waterUsage.municipalConsumption} onChange={e => handleWaterUsageChange('municipalConsumption', e.target.valueAsNumber || '')}/>
                    <Input label="Municipal water bi-monthly bill (rupees)" id="water-municipal-bill" type="number" value={data.waterUsage.municipalBill} onChange={e => handleWaterUsageChange('municipalBill', e.target.valueAsNumber || '')}/>
                    <Input label="Overhead water tank capacity (Liters)" id="water-tank-capacity" type="number" value={data.waterUsage.tankCapacity} onChange={e => handleWaterUsageChange('tankCapacity', e.target.valueAsNumber || '')}/>
                    <Input label="Capacity of the pump (HP)" id="water-pump-capacity" type="number" value={data.waterUsage.pumpCapacity} onChange={e => handleWaterUsageChange('pumpCapacity', e.target.valueAsNumber || '')}/>
                    <Input label="Time taken to fill the tank (Hours)" id="water-fill-time" type="number" value={data.waterUsage.fillTime} onChange={e => handleWaterUsageChange('fillTime', e.target.valueAsNumber || '')}/>
                    <Input label="Frequency of operating the pump per day (times)" id="water-pump-freq" type="number" value={data.waterUsage.pumpFrequency} onChange={e => handleWaterUsageChange('pumpFrequency', e.target.valueAsNumber || '')}/>
                    <Input label="Daily power consumption (kWh)" id="water-daily-power" type="number" value={data.waterUsage.dailyPowerConsumption} disabled />
                    <Input label="Annual Power Consumption (kWh)" id="water-annual-power" type="number" value={data.waterUsage.annualPowerConsumption} disabled />
                 </div>
            </div>

             {/* Vehicle Usage Details */}
            <div className="space-y-4">
                 <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Vehicle Usage Details</h3>
                 {data.vehicleUsage.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg items-end">
                        <Select label="Vehicle" id={`vehicle-type-${index}`} value={item.type} onChange={e => handleListChange('vehicleUsage', index, 'type', e.target.value)}>
                            <option value="2 wheeler">2 wheeler</option>
                            <option value="3 wheeler">3 wheeler</option>
                            <option value="Car">Car</option>
                            <option value="Other">Other</option>
                        </Select>
                        <Select label="Fuel Type" id={`vehicle-fuel-${index}`} value={item.fuelType} onChange={e => handleListChange('vehicleUsage', index, 'fuelType', e.target.value)}>
                             <option value="">Select...</option>
                             <option value="Petrol">Petrol</option>
                             <option value="Diesel">Diesel</option>
                             <option value="Electric">Electric</option>
                        </Select>
                        <Input label="Monthly usage (km)" id={`vehicle-usagekm-${index}`} type="number" value={item.monthlyUsageKm} onChange={e => handleListChange('vehicleUsage', index, 'monthlyUsageKm', e.target.valueAsNumber || '')} />
                        <Input label="Fuel Consumption (L/kWh)" id={`vehicle-fuel-cons-${index}`} type="number" value={item.monthlyFuelConsumption} onChange={e => handleListChange('vehicleUsage', index, 'monthlyFuelConsumption', e.target.valueAsNumber || '')} />
                        <Input label="Monthly expense (₹)" id={`vehicle-expense-${index}`} type="number" value={item.monthlyFuelExpense} onChange={e => handleListChange('vehicleUsage', index, 'monthlyFuelExpense', e.target.valueAsNumber || '')} />
                        <button onClick={() => removeListItem('vehicleUsage', index)} className="h-10 bg-red-500 text-white rounded-md hover:bg-red-600">Remove</button>
                    </div>
                 ))}
                 <button onClick={() => addListItem('vehicleUsage')} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Add Vehicle</button>
            </div>
        </div>
    );
};

export default Step3;