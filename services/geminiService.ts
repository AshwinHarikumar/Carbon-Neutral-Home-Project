
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SurveyData, SavingOpportunity, BillEntry, ElectricityConnection, EquipmentEntry } from '../types';

// IMPORTANT: Ensure your API key is set in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const generatePrompt = (data: SurveyData): string => {
    const { electricityConnection, equipmentEstimations, billEstimations } = data;
    
    const avgDailyConsumptionKWh = billEstimations.length > 0
        ? billEstimations.reduce((acc, bill) => acc + (Number(bill.consumption) || 0), 0) / billEstimations.length / 60 // 2 months per bill
        : 0;

    const mainAppliances = equipmentEstimations
        .filter(e => (e.powerWatts || 0) > 500)
        .map(e => e.equipment)
        .join(', ');

    return `
        Analyze the following home energy data and provide 3-5 practical, targeted energy-saving suggestions.
        
        Home Profile:
        - Building Type: ${electricityConnection.buildingType}
        - Total Area: ${electricityConnection.buildingArea || 'N/A'} sq meters
        - Number of Family Members: ${electricityConnection.familyMembers}
        - Solar Plant Installed: ${electricityConnection.solarInstalled}
        - Approximate Average Daily Electricity Consumption: ${avgDailyConsumptionKWh.toFixed(2)} kWh
        - High-Power Appliances Noted: ${mainAppliances || 'None specified'}

        For each suggestion, provide a brief description, an estimated daily energy saving in Watt-hours (Wh), a rough required investment in Indian Rupees (₹), and an estimated payback period in months. Be realistic with the numbers.
    `;
};

export const getEnergySavingSuggestions = async (data: SurveyData): Promise<SavingOpportunity[]> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    const prompt = generatePrompt(data);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    suggestion: { type: Type.STRING, description: "The energy saving suggestion." },
                                    energySavingWh: { type: Type.NUMBER, description: "Targeted energy saving per day in Watt-hours (Wh)." },
                                    investment: { type: Type.NUMBER, description: "Estimated investment required in Indian Rupees (₹)." },
                                    paybackMonths: { type: Type.NUMBER, description: "Estimated payback period in months." },
                                    remarks: { type: Type.STRING, description: "Any additional remarks." }
                                }
                            }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text;
        const result = JSON.parse(jsonStr);

        if (result.suggestions && Array.isArray(result.suggestions)) {
            return result.suggestions.map((s: any, index: number) => ({
                id: `gemini-${Date.now()}-${index}`,
                suggestion: s.suggestion || 'N/A',
                energySavingWh: s.energySavingWh || 0,
                investment: s.investment || 0,
                paybackMonths: s.paybackMonths || 0,
                remarks: s.remarks || ''
            }));
        }
        return [];

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get suggestions from Gemini AI. Please check the console for more details.");
    }
};

const sanitizeObject = (obj: any, schema: Record<string, 'string' | 'number'>): any => {
    if (!obj) return {};
    const sanitized: any = {};
    for (const key in schema) {
        const value = obj[key];
        if (schema[key] === 'string') {
            sanitized[key] = value || '';
        } else if (schema[key] === 'number') {
            sanitized[key] = value || 0;
        }
    }
    return sanitized;
};


export const extractDetailsFromPdf = async (pdfBase64: string): Promise<{
    connectionDetails: Partial<ElectricityConnection>,
    billDetails: Partial<BillEntry>
}> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is not configured.");
    }

    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
        },
    };

    const textPart = {
        text: `
          Analyze the provided electricity bill PDF, likely from KSEB (Kerala State Electricity Board).
          Extract the following details and return them in a single JSON object.
          The JSON should have two main keys: 'connectionDetails' and 'billDetails'.
          If a value is not found, return an empty string for string fields, 0 for numeric fields, or 'No' for the solar field.

          For 'connectionDetails', extract:
          - consumerName: Name of the consumer.
          - consumerNumber: The unique consumer number or ID.
          - electricalSection: The name of the electrical section office.
          - tariffCategory: The tariff code or category (e.g., LT-1A).
          - connectedLoadWatts: The sanctioned or connected load. If in kW, convert to Watts.
          - connectionNature: Should be either 'Single Phase' or 'Three Phase'.
          - energyMeterType: Type of meter, like 'Digital', 'Electromechanical', or 'TOD'.
          - solarInstalled: Check for net-metering data like 'Export' energy readings. If present, set this to "Yes", otherwise "No".

          For 'billDetails', extract:
          - billNumber: The Bill Number. Can be the same as consumer number if not distinct.
          - period: The billing period (e.g., 'May-Jun 2023').
          - consumption: Total consumption in kWh for the period. For net-metered bills, this is usually the 'Net' or 'Billed' consumption.
          - fixedCharge: The fixed charge amount.
          - meterRent: The meter rent amount.
          - energyCharges: The total energy charges.
          - duty: The electricity duty amount.
          - total: The total bill amount.
          - otherCharges: Any other charges not covered above. Sum them up if there are multiple.
        `
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, pdfPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        connectionDetails: {
                            type: Type.OBJECT,
                            properties: {
                                consumerName: { type: Type.STRING },
                                consumerNumber: { type: Type.STRING },
                                electricalSection: { type: Type.STRING },
                                tariffCategory: { type: Type.STRING },
                                connectedLoadWatts: { type: Type.NUMBER },
                                connectionNature: { type: Type.STRING },
                                energyMeterType: { type: Type.STRING },
                                solarInstalled: { type: Type.STRING },
                            }
                        },
                        billDetails: {
                            type: Type.OBJECT,
                            properties: {
                                billNumber: { type: Type.STRING },
                                period: { type: Type.STRING },
                                consumption: { type: Type.NUMBER },
                                fixedCharge: { type: Type.NUMBER },
                                meterRent: { type: Type.NUMBER },
                                energyCharges: { type: Type.NUMBER },
                                duty: { type: Type.NUMBER },
                                otherCharges: { type: Type.NUMBER },
                                total: { type: Type.NUMBER },
                            }
                        }
                    }
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);

        const rawConnection = result.connectionDetails;
        const rawBill = result.billDetails;

        const connectionDetails = sanitizeObject(rawConnection, {
            consumerName: 'string', consumerNumber: 'string', electricalSection: 'string',
            tariffCategory: 'string', connectionNature: 'string', energyMeterType: 'string',
            solarInstalled: 'string', connectedLoadWatts: 'number'
        }) as Partial<ElectricityConnection>;

        const billDetails = sanitizeObject(rawBill, {
            billNumber: 'string', period: 'string', remarks: 'string', consumption: 'number',
            fixedCharge: 'number', meterRent: 'number', energyCharges: 'number',
            duty: 'number', otherCharges: 'number', total: 'number'
        }) as Partial<BillEntry>;
        
        // Ensure total is calculated if not provided
        if (!billDetails.total && billDetails.total !== 0) {
            billDetails.total = (Number(billDetails.fixedCharge) || 0) + 
                              (Number(billDetails.meterRent) || 0) + 
                              (Number(billDetails.energyCharges) || 0) + 
                              (Number(billDetails.duty) || 0) + 
                              (Number(billDetails.otherCharges) || 0);
        }
        
        return { connectionDetails, billDetails };

    } catch (error) {
        console.error("Error calling Gemini API for bill extraction:", error);
        throw new Error("Failed to extract details from PDF using Gemini AI. The document might be unreadable or in an unexpected format.");
    }
};
