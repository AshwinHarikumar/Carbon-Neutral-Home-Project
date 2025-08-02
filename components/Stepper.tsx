
import React from 'react';

interface StepperProps {
    currentStep: number;
    steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:space-y-6">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <li key={step} className="md:flex-1">
                            <div className="group flex flex-col md:flex-row md:items-center w-full">
                                <span className="flex items-center px-6 py-4 text-sm font-medium">
                                    <span
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300
                                        ${isCompleted ? 'bg-blue-600' : isCurrent ? 'border-2 border-blue-600 bg-white' : 'border-2 border-gray-300 bg-white'}`}
                                    >
                                        {isCompleted ? (
                                            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.454-12.68a.75.75 0 011.04-.208z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <span className={`${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>{stepNumber}</span>
                                        )}
                                    </span>
                                    <span className={`ml-4 text-sm font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {step}
                                    </span>
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Stepper;
