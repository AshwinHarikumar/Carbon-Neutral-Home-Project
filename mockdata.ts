import { SurveyData } from './types';

const mockSurveys: SurveyData[] = [
    {
        id: undefined,
        submissionDate: new Date('2025-08-01T10:00:00Z').toISOString(),
        appraiserInfo: {
            name: 'Ashwin Harikumar',
            enrollmentId: 'SCM23CS077',
            unitNo: 'Unit-328',
            collegeName: 'SCMS School of Engineering and Technology'
        },
        electricityConnection: {
            consumerName: 'Vijayalakshmi',
            familyMembers: 6,
            consumerNumber: '1156047011364',
            tariffCategory: 'LT-1',
            electricalSection: 'Electrical Section North Paravur',
            connectedLoadWatts: 6790,
            connectionNature: 'Three Phase',
            buildingType: 'Concrete',
            ownership: 'Own',
            floors: 2,
            buildingArea: 2000,
            earthingType: 'Pipe',
            controlSystems: 'ELCB',
            mcbCount: 6,
            energyMeterType: 'Digital',
            solarInstalled: 'Yes'
        },
        solarPlantDetails: [
            {
                type: 'On grid',
                installedCapacity: 3,
                remarks: 'Operational since April 2021'
            }
        ],
        billEstimations: [
            {
                id: 'b1',
                billNumber: '5604250502814',
                period: 'May 2025',
                consumption: 134,
                fixedCharge: 310,
                meterRent: 35,
                energyCharges: 561.9,
                duty: 56.19,
                otherCharges: 10.72,
                total: 974,
                remarks: ''
            },
            {
                id: 'b2',
                billNumber: '5604250600505',
                period: 'June 2025',
                consumption: 158,
                fixedCharge: 260,
                meterRent: 35,
                energyCharges: 705.1,
                duty: 70.51,
                otherCharges: 7.9,
                total: 1079,
                remarks: ''
            },
            {
                id: 'b3',
                billNumber: '5604250700577',
                period: 'July 2025',
                consumption: 161,
                fixedCharge: 235,
                meterRent: 35,
                energyCharges: 0, 
                duty: 0,
                otherCharges: 0,
                total: 270,
                remarks: 'No energy charge listed; likely covered by solar export'
            }
        ],
        equipmentEstimations: [],
        fuelForCooking: [],
        waterUsage: {
            source: 'Municipal water',
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
        savingOpportunities: []
    }
];

export default mockSurveys;
