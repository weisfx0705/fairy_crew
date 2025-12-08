
import React from 'react';

interface StepperProps {
    currentPage: number;
    totalPages: number;
}

export const Stepper: React.FC<StepperProps> = ({ currentPage, totalPages }) => {
    return (
        <div className="w-full">
            <div className="flex items-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <React.Fragment key={page}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                    currentPage >= page ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-300'
                                }`}
                            >
                                {page}
                            </div>
                        </div>
                        {page < totalPages && (
                            <div
                                className={`flex-1 h-1 transition-all duration-300 ${
                                    currentPage > page ? 'bg-cyan-500' : 'bg-gray-600'
                                }`}
                            ></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
