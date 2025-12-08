
import React, { useState, useCallback } from 'react';
import { generateFormBCScripts } from '../services/geminiService';
import type { ProjectDirector, RoleQuota } from '../types';
import { CREW_ROLES } from '../constants';
import { CodeBlock } from './CodeBlock';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface Page5Props {
    roster: string[];
    directors: ProjectDirector[];
    setDirectors: (directors: ProjectDirector[]) => void;
    setRoleQuotas: (quotas: RoleQuota) => void;
}

const Page5_DefineProjects: React.FC<Page5Props> = ({ roster, directors, setDirectors, setRoleQuotas }) => {
    const [localQuotas, setLocalQuotas] = useState<RoleQuota>(
        CREW_ROLES.reduce((acc, role) => ({ ...acc, [role]: role === '導演' ? 1 : 0 }), {})
    );
    const [scripts, setScripts] = useState<{ formB: string; formC: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDirectorSelect = (studentName: string, isSelected: boolean) => {
        if (isSelected) {
            setDirectors([...directors, { name: studentName, projectName: '' }]);
        } else {
            setDirectors(directors.filter(d => d.name !== studentName));
        }
    };

    const handleProjectNameChange = (directorName: string, projectName: string) => {
        setDirectors(directors.map(d => d.name === directorName ? { ...d, projectName } : d));
    };

    const handleQuotaChange = (role: string, value: string) => {
        const numValue = parseInt(value, 10);
        const newQuotas = { ...localQuotas, [role]: isNaN(numValue) ? 0 : numValue };
        setLocalQuotas(newQuotas);
        setRoleQuotas(newQuotas);
    };

    const handleGenerateScripts = useCallback(async () => {
        if (directors.length === 0 || directors.some(d => !d.projectName.trim())) {
            setError("請至少選擇一位導演並填寫所有專案名稱。");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const generatedScripts = await generateFormBCScripts(directors, roster, CREW_ROLES, localQuotas);
            setScripts(generatedScripts);
        } catch (err) {
            setError("腳本生成失敗，請稍後再試。");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [directors, roster, localQuotas]);

    return (
        <div className="space-y-8">
            {/* Step 1: Select Directors */}
            <div className="p-6 bg-gray-900/50 rounded-lg">
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">1. 選擇本次擔任導演的人選</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {roster.map(student => (
                        <label key={student} className="flex items-center space-x-2 p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-500 bg-gray-600 text-cyan-500 focus:ring-cyan-600"
                                checked={directors.some(d => d.name === student)}
                                onChange={(e) => handleDirectorSelect(student, e.target.checked)}
                            />
                            <span>{student}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Step 2: Project Names */}
            {directors.length > 0 && (
                <div className="p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="text-xl font-semibold text-cyan-300 mb-3">2. 填寫專案（短片）名稱</h3>
                    <div className="space-y-3">
                        {directors.map(dir => (
                            <div key={dir.name} className="flex items-center gap-4">
                                <span className="font-semibold w-24 text-right">{dir.name}</span>
                                <input
                                    type="text"
                                    placeholder="例如：《渡》"
                                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
                                    value={dir.projectName}
                                    onChange={(e) => handleProjectNameChange(dir.name, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Role Quotas */}
            <div className="p-6 bg-gray-900/50 rounded-lg">
                <h3 className="text-xl font-semibold text-cyan-300 mb-3">3. 填寫本次每個職位的名額（每組）</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {CREW_ROLES.map(role => (
                        <div key={role}>
                            <label className="block text-sm font-medium text-gray-400 mb-1">{role}</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
                                value={localQuotas[role]}
                                onChange={(e) => handleQuotaChange(role, e.target.value)}
                                disabled={role === '導演'}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Step 4: Generate Scripts */}
            <div className="flex flex-col items-center gap-4 p-6 bg-gray-700/50 rounded-lg">
                <p className="text-center text-gray-300">完成以上設定後，點擊下方按鈕，AI 將產生兩份 Google Form 腳本：<br/>一份給<strong>工作人員</strong>填寫志願序 (Form B)，一份給<strong>導演</strong>挑選組員 (Form C)。</p>
                <button
                    onClick={handleGenerateScripts}
                    disabled={isLoading || directors.length === 0}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg"
                >
                    {isLoading ? "生成中..." : <><SparklesIcon className="w-6 h-6"/> 產生志願表腳本</>}
                </button>
                 {error && <p className="text-red-400 text-center mt-2">{error}</p>}
            </div>

            {scripts && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-300 mb-3">工作人員志願表 (Form B) 腳本</h3>
                            <CodeBlock code={scripts.formB} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-300 mb-3">導演選組單 (Form C) 腳本</h3>
                            <CodeBlock code={scripts.formC} />
                        </div>
                    </div>
                    <div>
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-3">
                            <DocumentTextIcon className="w-6 h-6" />
                            使用教學
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 bg-gray-900/50 p-6 rounded-lg text-gray-300">
                            <li>前往 <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">script.google.com</a> 並建立一個新專案。</li>
                            <li>將其中一份腳本的程式碼完整複製並貼到程式碼編輯器中。</li>
                            <li>點擊上方的「儲存專案」圖示。</li>
                            <li className="font-semibold text-white">執行工作人員志願表 (Form B) 腳本:</li>
                            <ul className="list-disc list-inside ml-6">
                                <li>確認您已貼上 <strong>Form B</strong> 的腳本。</li>
                                <li>在函式選擇下拉選單中，選擇 `createCrewPreferenceForm` 並點擊「執行」。</li>
                                <li>首次執行需授權。成功後，在「執行紀錄」中會看到 <strong>Form B</strong> 的網址。</li>
                            </ul>
                             <li className="font-semibold text-white">執行導演選組單 (Form C) 腳本:</li>
                             <ul className="list-disc list-inside ml-6">
                                <li>用 <strong>Form C</strong> 的腳本取代編輯器內容並儲存。</li>
                                <li>在函式選擇下拉選단中，選擇 `createDirectorSelectionForm` 並點擊「執行」。</li>
                                <li>成功後，在「執行紀錄」中會看到 <strong>Form C</strong> 的網址。</li>
                            </ul>
                            <li>將兩份表單的網址分別發給對應的人員填寫。</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page5_DefineProjects;
