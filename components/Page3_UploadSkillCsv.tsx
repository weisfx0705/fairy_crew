
import React, { useCallback, useState } from 'react';
import FileUpload from './FileUpload';
import type { StudentSkill } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Page3Props {
    setSkillData: (data: StudentSkill[]) => void;
    onNext: () => void;
}

const parseCSV = <T,>(csvText: string): T[] => {
    const lines = csvText.trim().replace(/\r/g, '').split('\n');
    if (lines.length < 2) return [];

    const headerLine = lines.shift()!;
    const headers = headerLine.split(',').map(h => h.trim());

    return lines.map(line => {
        const values = line.split(',').map(v => v.trim());
        const entry = {} as any;
        headers.forEach((header, index) => {
            // A common issue is Google Forms using different names for the same field. Let's normalize.
            if (header.includes("姓名")) entry['姓名'] = values[index];
            else if (header.includes("備註")) entry['備註'] = values[index];
            else {
                entry[header] = values[index];
            }
        });
        return entry as T;
    });
};

const Page3_UploadSkillCsv: React.FC<Page3Props> = ({ setSkillData, onNext }) => {
    const [fileUploaded, setFileUploaded] = useState(false);
    
    const handleFileUpload = useCallback((csvText: string) => {
        const data = parseCSV<StudentSkill>(csvText);
        setSkillData(data);
        setFileUploaded(true);
    }, [setSkillData]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-3">
                    <DocumentTextIcon className="w-6 h-6" />
                    如何取得 CSV 檔案
                </h3>
                <ol className="list-decimal list-inside space-y-3 bg-gray-900/50 p-6 rounded-lg text-gray-300">
                    <li>在您建立的技能調查 Google Form 編輯頁面，點擊上方的「回覆」分頁。</li>
                    <li>點擊綠色的 Google Sheets 圖示，選擇「建立新試算表」來連結。</li>
                    <li>在開啟的 Google Sheet 頁面中，點擊左上角的「檔案」選單。</li>
                    <li>選擇「下載」 &gt; 「逗號分隔值 (.csv)」。</li>
                    <li>將下載好的 CSV 檔案上傳至下方。</li>
                </ol>
            </div>
            
            <FileUpload onFileUpload={handleFileUpload} title="上傳技能調查 CSV (檔案 A)" />

            {fileUploaded && (
                 <div className="flex justify-center pt-4">
                    <button
                        onClick={onNext}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-all font-semibold text-lg shadow-lg hover:shadow-cyan-500/50"
                    >
                        <span>上傳成功，前往技能概覽</span>
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Page3_UploadSkillCsv;
