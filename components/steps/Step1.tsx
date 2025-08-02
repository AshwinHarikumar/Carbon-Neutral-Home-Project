
import React, { useState, useRef } from 'react';
import { SurveyData, AppraiserInfo, BillEntry, SolarPlantDetail } from '../../types';
import Input from '../common/Input';
import { extractDetailsFromPdf } from '../../services/geminiService';

interface Step1Props {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
}

const Step1: React.FC<Step1Props> = ({ data, onDataChange }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof AppraiserInfo, value: string) => {
        onDataChange('appraiserInfo', { ...data.appraiserInfo, [field]: value });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setProcessingError("Please upload a valid PDF file.");
            return;
        }

        setIsProcessing(true);
        setProcessingError(null);
        setProcessingSuccess(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                try {
                    const base64String = (reader.result as string).split(',')[1];
                    const { connectionDetails, billDetails } = await extractDetailsFromPdf(base64String);

                    // Update connection details from bill
                    const updatedConnectionDetails = { 
                        ...data.electricityConnection, 
                        ...connectionDetails 
                    };
                    onDataChange('electricityConnection', updatedConnectionDetails);

                    // Add new bill entry from bill, only if it has consumption data
                    const newBill: BillEntry = {
                        id: `bill-${Date.now()}`,
                        billNumber: '', period: '', consumption: '', fixedCharge: '', meterRent: '',
                        energyCharges: '', duty: '', otherCharges: '', total: '',
                        remarks: 'Extracted from PDF',
                        ...billDetails
                    };
                    if (newBill.consumption) {
                        onDataChange('billEstimations', [...data.billEstimations, newBill]);
                    }
                    
                    // If solar is detected, pre-fill solar details for Step 3
                    if (updatedConnectionDetails.solarInstalled === 'Yes' && data.solarPlantDetails.length === 0) {
                        const newSolarPlant: SolarPlantDetail = {
                            id: `solar-${Date.now()}`,
                            type: 'On grid', // Assume On-grid if detected from KSEB bill
                            installedCapacity: '',
                            remarks: 'Automatically detected from electricity bill.'
                        };
                        onDataChange('solarPlantDetails', [newSolarPlant]);
                    }
                    
                    setProcessingSuccess("Success! Details for Steps 2, 3 & 4 extracted. Review them in the upcoming steps.");

                } catch (loadError) {
                     console.error(loadError);
                     setProcessingError(loadError instanceof Error ? loadError.message : "An unknown error occurred during processing.");
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.onerror = () => {
                setIsProcessing(false);
                setProcessingError("Failed to read the selected file.");
            }
        } catch (error) {
            console.error(error);
            setProcessingError(error instanceof Error ? error.message : "An unknown error occurred during processing.");
            setIsProcessing(false);
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Appraiser Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Input
                        label="Name of the Appraiser"
                        id="appraiserName"
                        value={data.appraiserInfo.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                    />
                    <Input
                        label="NSS Enrollment ID / KTU Register Number"
                        id="enrollmentId"
                        value={data.appraiserInfo.enrollmentId}
                        onChange={(e) => handleChange('enrollmentId', e.target.value)}
                    />
                    <Input
                        label="NSS Unit No"
                        id="unitNo"
                        value={data.appraiserInfo.unitNo}
                        onChange={(e) => handleChange('unitNo', e.target.value)}
                    />
                    <Input
                        label="Name of the College"
                        id="collegeName"
                        value={data.appraiserInfo.collegeName}
                        onChange={(e) => handleChange('collegeName', e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 p-4 border-dashed rounded-lg bg-gray-50 text-center">
                 <h3 className="text-lg font-semibold text-gray-700">Upload KSEB Bill</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">This will automatically fill in connection & bill details.</p>
                 <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isProcessing}
                />
                <label
                    htmlFor="pdf-upload"
                    className={`inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md text-white ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} shadow-sm transition-colors`}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : 'Upload Bill PDF'}
                </label>
                {processingError && <p className="mt-2 text-sm text-red-600">{processingError}</p>}
                {processingSuccess && <p className="mt-2 text-sm text-green-600">{processingSuccess}</p>}
            </div>
        </div>
    );
};

export default Step1;