import React, { useState, useCallback } from 'react';
import { SurveyData, initialSurveyData } from './types';
import { saveSurveyData } from './services/firebaseService';
import Stepper from './components/Stepper';
import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step3 from './components/steps/Step3';
import Step4 from './components/steps/Step4';
import Step5 from './components/steps/Step5';
import Summary from './components/steps/Summary';
import AdminApp from './AdminApp';

const SurveyApp: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [surveyData, setSurveyData] = useState<SurveyData>(initialSurveyData);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    const totalSteps = 6;

    const handleNext = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }, []);

    const handleBack = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    }, []);
    
    const handleDataChange = useCallback(<K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
        setSurveyData(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            await saveSurveyData(surveyData);
            setSaveMessage('Survey data saved successfully!');
        } catch (error) {
            console.error("Failed to save survey data:", error);
            setSaveMessage('Error: Failed to save data. See console for details.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1: return <Step1 data={surveyData} onDataChange={handleDataChange} />;
            case 2: return <Step2 data={surveyData} onDataChange={handleDataChange} />;
            case 3: return <Step3 data={surveyData} onDataChange={handleDataChange} />;
            case 4: return <Step4 data={surveyData} onDataChange={handleDataChange} />;
            case 5: return <Step5 data={surveyData} onDataChange={handleDataChange} />;
            case 6: return <Summary data={surveyData} onDataChange={handleDataChange} onSave={handleSave} isSaving={isSaving} saveMessage={saveMessage} />;
            default: return <div>Unknown Step</div>;
        }
    };
    
    const stepNames = ["Appraiser Info", "Connection Details", "Usage Details", "Bill Estimation", "Equipment Usage", "Summary & Savings"];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-6xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <img 
                        src="./components/assests/NSS.png" 
                        alt="NSS Logo" 
                        className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full"
                    />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Carbon Neutral Home Project</h1>
                        </div>
                    </div>
                    <p className="text-md text-gray-600 mt-2">A comprehensive survey to analyze and improve home energy efficiency.</p>
                </header>

                <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-1/4">
                       <Stepper currentStep={currentStep} steps={stepNames} />
                    </aside>
                    <main className="flex-1 min-w-0">
                        <div className="min-h-[500px]">
                            {renderStep()}
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors duration-200"
                            >
                                Back
                            </button>
                             {saveMessage && <div className={`text-sm font-medium ${saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{saveMessage}</div>}
                            <button
                                onClick={handleNext}
                                disabled={currentStep === totalSteps}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Next
                            </button>
                        </div>
                    </main>
                </div>
                 <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>NSS SSET 182 & 328 - Carbon Neutral Home Project</p>
                </footer>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    if (isAdminRoute) {
        return <AdminApp />;
    }

    return <SurveyApp />;
};


export default App;
