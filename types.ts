
export interface AppraiserInfo {
    name: string;
    enrollmentId: string;
    unitNo: string;
    collegeName: string;
}

export interface ElectricityConnection {
    consumerName: string;
    familyMembers: number | '';
    consumerNumber: string;
    tariffCategory: string;
    electricalSection: string;
    connectedLoadWatts: number | '';
    connectionNature: 'Single Phase' | 'Three Phase' | '';
    buildingType: 'Concrete' | 'Tiled Roof' | 'Sheet Roof' | '';
    ownership: 'Own' | 'Rental' | '';
    floors: number | '';
    buildingArea: number | ''; // in sq meters
    earthingType: 'Plate' | 'Pipe' | '';
    controlSystems: 'ELCB' | 'RCCB' | '';
    mcbCount: number | '';
    energyMeterType: 'Electromechanical' | 'Digital' | 'TOD' | '';
    solarInstalled: 'Yes' | 'No' | '';
}

export interface SolarPlantDetail {
    id: string;
    type: 'Off grid' | 'On grid' | 'Hybrid' | '';
    installedCapacity: number | '';
    remarks: string;
}

export interface FuelForCooking {
    type: 'Firewood' | 'LPG Cylinder' | 'Biogas' | 'Induction Cooker' | 'Others';
    consumption: number | '';
    units: 'Kg' | 'Cylinders' | 'Hours';
    remarks: string;
}

export interface WaterUsage {
    source: 'Open well' | 'Bore well' | 'Underground tank' | 'Municipal water' | '';
    municipalConsumption: number | ''; // kilo liters
    municipalBill: number | ''; // rupees
    tankCapacity: number | ''; // Liters
    pumpCapacity: number | ''; // HP
    fillTime: number | ''; // Hours
    pumpFrequency: number | ''; // times per day
    dailyPowerConsumption: number | ''; // kWh
    annualPowerConsumption: number | ''; // kWh
    remarks: string;
}

export interface VehicleUsage {
    type: '2 wheeler' | '3 wheeler' | 'Car' | 'Other';
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | '';
    monthlyUsageKm: number | '';
    monthlyFuelConsumption: number | ''; // Liters or kWh
    monthlyFuelExpense: number | ''; // rupees
    remarks: string;
}

export interface BillEntry {
    id: string;
    billNumber: string;
    period: string;
    consumption: number | '';
    fixedCharge: number | '';
    meterRent: number | '';
    energyCharges: number | '';
    duty: number | '';
    otherCharges: number | '';
    total: number | '';
    remarks: string;
}

export interface EquipmentEntry {
    id: string;
    equipment: string;
    dailyUsageHours: number | '';
    powerWatts: number | '';
    energyConsumptionWh: number | '';
    remarks: string;
}

export interface SavingOpportunity {
    id: string;
    suggestion: string;
    energySavingWh: number | '';
    investment: number | '';
    paybackMonths: number | '';
    remarks: string;
}

export interface SurveyData {
    id?: string;
    submissionDate?: string;
    appraiserInfo: AppraiserInfo;
    electricityConnection: ElectricityConnection;
    solarPlantDetails: SolarPlantDetail[];
    fuelForCooking: FuelForCooking[];
    waterUsage: WaterUsage;
    vehicleUsage: VehicleUsage[];
    billEstimations: BillEntry[];
    equipmentEstimations: EquipmentEntry[];
    savingOpportunities: SavingOpportunity[];
}

export const initialSurveyData: SurveyData = {
    appraiserInfo: { name: '', enrollmentId: '', unitNo: '', collegeName: '' },
    electricityConnection: {
        consumerName: '',
        familyMembers: '',
        consumerNumber: '',
        tariffCategory: '',
        electricalSection: '',
        connectedLoadWatts: '',
        connectionNature: '',
        buildingType: '',
        ownership: '',
        floors: '',
        buildingArea: '',
        earthingType: '',
        controlSystems: '',
        mcbCount: '',
        energyMeterType: '',
        solarInstalled: ''
    },
    solarPlantDetails: [],
    fuelForCooking: [],
    waterUsage: {
        source: '',
        municipalConsumption: '',
        municipalBill: '',
        tankCapacity: '',
        pumpCapacity: '',
        fillTime: '',
        pumpFrequency: '',
        dailyPowerConsumption: '',
        annualPowerConsumption: '',
        remarks: ''
    },
    vehicleUsage: [],
    billEstimations: [],
    equipmentEstimations: [],
    savingOpportunities: []
};