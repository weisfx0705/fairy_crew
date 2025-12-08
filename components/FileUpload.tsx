
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CheckIcon } from './icons/CheckIcon';

interface FileUploadProps {
    onFileUpload: (content: string) => void;
    title: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, title }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (file && file.type === "text/csv") {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onFileUpload(text);
                setFileName(file.name);
            };
            reader.readAsText(file);
        } else {
            alert("請上傳一個 CSV 檔案。");
        }
    }, [onFileUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, [handleFile]);
    
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50'
            }`}
        >
            <input
                type="file"
                accept=".csv"
                onChange={handleChange}
                className="hidden"
                ref={fileInputRef}
            />
            <div className="flex flex-col items-center justify-center text-center">
                {fileName ? (
                    <>
                        <CheckIcon className="w-10 h-10 text-green-400 mb-2" />
                        <p className="text-lg font-semibold text-green-300">{title} 上傳成功</p>
                        <p className="text-sm text-gray-400">{fileName}</p>
                    </>
                ) : (
                    <>
                        <UploadIcon className="w-10 h-10 text-gray-500 mb-2" />
                        <p className="text-lg font-semibold text-gray-300">{title}</p>
                        <p className="text-sm text-gray-400">點擊此處或拖曳檔案至此</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
