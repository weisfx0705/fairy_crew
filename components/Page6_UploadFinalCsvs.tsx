
import React, { useState, useCallback } from 'react';
import FileUpload from './FileUpload';
import { performCrewAssignment } from '../services/geminiService';
import type { StudentSkill, RoleQuota, ProjectDirector, FinalAssignment } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface Page6Props {
    setCsvA: (data: StudentSkill[]) => void;
    setCsvB: (data: any[]) => void;
    setCsvC: (data: any[]) => void;
    roleQuotas: RoleQuota;
    directors: ProjectDirector[];
    onNext: () => void;
    setFinalAssignments: (assignments: FinalAssignment[]) => void;
    setAssignmentRationale: (rationale: string) => void;
}

const parseCSV = <T,>(csvText: string): T[] => {
    const lines = csvText.trim().replace(/\r/g, '').split('\n');
    if (lines.length < 2) return [];
    const headerLine = lines.shift()!;
    const headers = headerLine.split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const entry = {} as any;
        headers.forEach((header, index) => {
            entry[header] = values[index];
        });
        return entry as T;
    });
};

const Page6_UploadFinalCsvs: React.FC<Page6Props> = ({
    setCsvA, setCsvB, setCsvC, roleQuotas, directors, onNext, setFinalAssignments, setAssignmentRationale
}) => {
    const [files, setFiles] = useState({ a: false, b: false, c: false });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [localCsvA, setLocalCsvA] = useState<any[]>([]);
    const [localCsvB, setLocalCsvB] = useState<any[]>([]);
    const [localCsvC, setLocalCsvC] = useState<any[]>([]);


    const handleUploadA = useCallback((csvText: string) => {
        const data = parseCSV<StudentSkill>(csvText);
        setCsvA(data);
        setLocalCsvA(data);
        setFiles(f => ({ ...f, a: true }));
    }, [setCsvA]);

    const handleUploadB = useCallback((csvText: string) => {
        const data = parseCSV(csvText);
        setCsvB(data);
        setLocalCsvB(data);
        setFiles(f => ({ ...f, b: true }));
    }, [setCsvB]);

    const handleUploadC = useCallback((csvText:string) => {
        const data = parseCSV(csvText);
        setCsvC(data);
        setLocalCsvC(data);
        setFiles(f => ({ ...f, c: true }));
    }, [setCsvC]);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await performCrewAssignment(localCsvA, localCsvB, localCsvC, roleQuotas, directors);
            if(result.assignments && result.assignments.length > 0) {
                setFinalAssignments(result.assignments);
                setAssignmentRationale(result.rationale);
                onNext();
            } else {
                setError(result.rationale || "分析失敗，未產生任何分組結果。");
            }
        } catch (err) {
            setError("執行分析時發生錯誤，請稍後再試。");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const allFilesUploaded = files.a && files.b && files.c;

    return (
        <div className="space-y-6">
            <p className="text-center text-gray-300">請依照指示，將從 Google Form A, B, C 所下載的三份 CSV 檔案分別上傳。</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FileUpload onFileUpload={handleUploadA} title="上傳技能調查 CSV (A)" />
                <FileUpload onFileUpload={handleUploadB} title="上傳工作人員志願 CSV (B)" />
                <FileUpload onFileUpload={handleUploadC} title="上傳導演選組 CSV (C)" />
            </div>

            {error && <p className="text-red-400 text-center font-semibold">{error}</p>}
            
            <div className="flex justify-center pt-4">
                <button
                    onClick={handleAnalysis}
                    disabled={!allFilesUploaded || isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-cyan-500/50"
                >
                    {isLoading ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            AI配對中...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-6 h-6" />
                            分析資料並產生分組
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Page6_UploadFinalCsvs;
