
import React from 'react';
import { SurveyData, ElectricityConnection } from '../../types';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step2Props {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
}

const Step2: React.FC<Step2Props> = ({ data, onDataChange }) => {
    const handleChange = (field: keyof ElectricityConnection, value: string | number) => {
        onDataChange('electricityConnection', { ...data.electricityConnection, [field]: value });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">I. Electricity Connection Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Input label="Name of the consumer" id="consumerName" value={data.electricityConnection.consumerName} onChange={(e) => handleChange('consumerName', e.target.value)} />
                <Input label="Number of family members" id="familyMembers" type="number" value={data.electricityConnection.familyMembers} onChange={(e) => handleChange('familyMembers', e.target.valueAsNumber || '')} />
                <Input label="Consumer number (Unique ID)" id="consumerNumber" value={data.electricityConnection.consumerNumber} onChange={(e) => handleChange('consumerNumber', e.target.value)} />
                <Input label="Tariff Category" id="tariffCategory" value={data.electricityConnection.tariffCategory} onChange={(e) => handleChange('tariffCategory', e.target.value)} />
                <Input label="Name of Electrical Section" id="electricalSection" value={data.electricityConnection.electricalSection} onChange={(e) => handleChange('electricalSection', e.target.value)} />
                <Input label="Connected Load in watts" id="connectedLoadWatts" type="number" value={data.electricityConnection.connectedLoadWatts} onChange={(e) => handleChange('connectedLoadWatts', e.target.valueAsNumber || '')} />
                <Select label="Nature of connection" id="connectionNature" value={data.electricityConnection.connectionNature} onChange={(e) => handleChange('connectionNature', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Single Phase">Single Phase</option>
                    <option value="Three Phase">Three Phase</option>
                </Select>
                <Select label="House Building Type" id="buildingType" value={data.electricityConnection.buildingType} onChange={(e) => handleChange('buildingType', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Tiled Roof">Tiled Roof</option>
                    <option value="Sheet Roof">Sheet Roof</option>
                </Select>
                <Select label="Whether own building or rental basis" id="ownership" value={data.electricityConnection.ownership} onChange={(e) => handleChange('ownership', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Own">Own</option>
                    <option value="Rental">Rental</option>
                </Select>
                <Input label="No of floors" id="floors" type="number" value={data.electricityConnection.floors} onChange={(e) => handleChange('floors', e.target.valueAsNumber || '')} />
                <Input label="Total Building area (m2)" id="buildingArea" type="number" value={data.electricityConnection.buildingArea} onChange={(e) => handleChange('buildingArea', e.target.valueAsNumber || '')} />
                <Select label="Type of Earthing" id="earthingType" value={data.electricityConnection.earthingType} onChange={(e) => handleChange('earthingType', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Plate">Plate Earthing</option>
                    <option value="Pipe">Pipe Earthing</option>
                </Select>
                <Select label="Control Systems" id="controlSystems" value={data.electricityConnection.controlSystems} onChange={(e) => handleChange('controlSystems', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="ELCB">ELCB</option>
                    <option value="RCCB">RCCB</option>
                </Select>
                <Input label="Number of MCBs" id="mcbCount" type="number" value={data.electricityConnection.mcbCount} onChange={(e) => handleChange('mcbCount', e.target.valueAsNumber || '')} />
                 <Select label="Type of Energy Meter" id="energyMeterType" value={data.electricityConnection.energyMeterType} onChange={(e) => handleChange('energyMeterType', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Electromechanical">Electromechanical</option>
                    <option value="Digital">Digital</option>
                    <option value="TOD">TOD</option>
                </Select>
                <Select label="Whether Solar plant installed" id="solarInstalled" value={data.electricityConnection.solarInstalled} onChange={(e) => handleChange('solarInstalled', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </Select>
            </div>
        </div>
    );
};

export default Step2;
