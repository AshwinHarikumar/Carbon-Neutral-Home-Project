
import React, { useMemo, useState, useRef } from 'react';
import { SurveyData, BillEntry } from '../../types';
import { extractDetailsFromPdf } from '../../services/geminiService';

interface Step4Props {
    data: SurveyData;
    onDataChange: <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => void;
}

const Step4: React.FC<Step4Props> = ({ data, onDataChange }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingError, setProcessingError] = useState<string | null>(null);
    const [processingSuccess, setProcessingSuccess] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBillChange = (index: number, field: keyof BillEntry, value: string | number) => {
        const updatedBills = data.billEstimations.map((bill, i) => {
            if (i === index) {
                const updatedBill = { ...bill, [field]: value };
                if (['fixedCharge', 'meterRent', 'energyCharges', 'duty', 'otherCharges'].includes(field as string)) {
                    const total = (Number(updatedBill.fixedCharge) || 0) + (Number(updatedBill.meterRent) || 0) + (Number(updatedBill.energyCharges) || 0) + (Number(updatedBill.duty) || 0) + (Number(updatedBill.otherCharges) || 0);
                    updatedBill.total = total;
                }
                return updatedBill;
            }
            return bill;
        });
        onDataChange('billEstimations', updatedBills);
    };

    const addBillEntry = () => {
        const newBill: BillEntry = {
            id: `bill-${Date.now()}`,
            billNumber: '', period: '', consumption: '', fixedCharge: '', meterRent: '',
            energyCharges: '', duty: '', otherCharges: '', total: '', remarks: '',
        };
        onDataChange('billEstimations', [...data.billEstimations, newBill]);
    };
    
    const removeBillEntry = (id: string) => {
        onDataChange('billEstimations', data.billEstimations.filter(b => b.id !== id));
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
                    const { billDetails } = await extractDetailsFromPdf(base64String);

                    const newBill: BillEntry = {
                        id: `bill-${Date.now()}`,
                        billNumber: '', period: '', consumption: '', fixedCharge: '', meterRent: '',
                        energyCharges: '', duty: '', otherCharges: '', total: '',
                        remarks: 'Extracted from PDF',
                        ...billDetails
                    };

                    if (newBill.consumption) {
                        onDataChange('billEstimations', [...data.billEstimations, newBill]);
                        setProcessingSuccess("Success! Bill details extracted and added to the table.");
                    } else {
                         setProcessingError("Could not find key details (like consumption) in the PDF. Please add the bill manually.");
                    }

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
            setProcessingError(error instanceof Error ? error.message : "An unknown error occurred.");
            setIsProcessing(false);
        } finally {
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const totals = useMemo(() => {
        return data.billEstimations.reduce((acc, bill) => {
            acc.consumption += Number(bill.consumption) || 0;
            acc.total += Number(bill.total) || 0;
            return acc;
        }, { consumption: 0, total: 0 });
    }, [data.billEstimations]);
    
    const averageDailyConsumption = useMemo(() => {
        const totalConsumption = totals.consumption;
        const totalDays = data.billEstimations.length * 60; // Assuming each bill period is 2 months (60 days)
        return totalDays > 0 ? totalConsumption / totalDays : 0;
    }, [totals.consumption, data.billEstimations.length]);


    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">II. Daily Usage Estimation from Electricity Bill</h2>
            
            <div className="p-4 border-dashed rounded-lg bg-gray-50 text-center">
                 <h3 className="text-lg font-semibold text-gray-700">Add from PDF</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Upload a KSEB bill PDF to automatically add its details to the table.</p>
                 <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    id="pdf-upload-step4"
                    disabled={isProcessing}
                />
                <label
                    htmlFor="pdf-upload-step4"
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

            <p className="text-sm text-gray-600">
                Enter details from the last 1 to 3 electricity bills. If you uploaded a bill in Step 1, the details should appear here.
                You can add more bills manually if needed.
            </p>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Bill No.', 'Period', 'Consumption (kWh)', 'Fixed Charge', 'Meter Rent', 'Energy Charges', 'Duty', 'Other Charges', 'Total', 'Remarks', 'Actions'].map(header => (
                                <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.billEstimations.map((bill, index) => (
                            <tr key={bill.id}>
                                <td className="p-2"><input type="text" value={bill.billNumber} onChange={e => handleBillChange(index, 'billNumber', e.target.value)} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="text" value={bill.period} onChange={e => handleBillChange(index, 'period', e.target.value)} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.consumption} onChange={e => handleBillChange(index, 'consumption', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.fixedCharge} onChange={e => handleBillChange(index, 'fixedCharge', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.meterRent} onChange={e => handleBillChange(index, 'meterRent', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.energyCharges} onChange={e => handleBillChange(index, 'energyCharges', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.duty} onChange={e => handleBillChange(index, 'duty', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.otherCharges} onChange={e => handleBillChange(index, 'otherCharges', e.target.valueAsNumber || '')} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><input type="number" value={bill.total} className="w-24 p-1 border rounded bg-gray-100" readOnly/></td>
                                <td className="p-2"><input type="text" value={bill.remarks} onChange={e => handleBillChange(index, 'remarks', e.target.value)} className="w-24 p-1 border rounded"/></td>
                                <td className="p-2"><button onClick={() => removeBillEntry(bill.id)} className="text-red-600 hover:text-red-900">Remove</button></td>
                            </tr>
                        ))}
                         {data.billEstimations.length === 0 && (
                            <tr>
                                <td colSpan={11} className="text-center p-4 text-gray-500">No bill entries yet. Add one manually or upload a bill.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={() => addBillEntry()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">+ Add Bill Entry Manually</button>
            <div className="mt-6 p-4 bg-gray-100 rounded-lg grid grid-cols-2 gap-4">
                <div className="font-bold text-gray-700">Total Consumption: <span className="text-blue-600">{totals.consumption.toFixed(2)} kWh</span></div>
                <div className="font-bold text-gray-700">Grand Total: <span className="text-blue-600">₹{totals.total.toFixed(2)}</span></div>
                <div className="font-bold text-gray-700 col-span-2">Average daily consumption in kWh (A): <span className="text-blue-600">{averageDailyConsumption.toFixed(2)} kWh</span></div>
            </div>
        </div>
    );
};

export default Step4;
