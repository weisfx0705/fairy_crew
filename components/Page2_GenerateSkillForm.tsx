
import React, { useState, useCallback } from 'react';
import { generateFormAScript } from '../services/geminiService';
import { CodeBlock } from './CodeBlock';
import { SparklesIcon } from './icons/SparklesIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CREW_ROLES } from '../constants';

interface Page2Props {
    roster: string[];
}

const Page2_GenerateSkillForm: React.FC<Page2Props> = ({ roster }) => {
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleGenerateScript = useCallback(async () => {
        if (roster.length === 0) {
            setError("請先返回步驟一輸入班級名單。");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const generatedScript = await generateFormAScript(roster, CREW_ROLES);
            setScript(generatedScript);
        } catch (err) {
            setError("腳本生成失敗，請稍後再試。");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [roster]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-700/50 rounded-lg">
                <div className="flex-grow">
                    <p className="text-gray-300 mb-4">點擊按鈕，AI 將為您自動撰寫一份 Google Apps Script。您可以使用此腳本快速生成一份技能調查問卷 (Google Form A)，供全班同學填寫。</p>
                    <p className="text-sm text-gray-400">問卷將包含姓名選擇、各項職位技能評分 (1-10分) 以及自我推薦的備註欄位。</p>
                </div>
                <button
                    onClick={handleGenerateScript}
                    disabled={isLoading || roster.length === 0}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-cyan-500/50"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            生成中...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-6 h-6" />
                            產生技能調查表腳本
                        </>
                    )}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {script && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-cyan-300 mb-3">已產生的 Google Apps Script</h3>
                        <CodeBlock code={script} />
                    </div>

                    <div>
                        <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-3">
                            <DocumentTextIcon className="w-6 h-6" />
                            使用教學
                        </h3>
                        <ol className="list-decimal list-inside space-y-3 bg-gray-900/50 p-6 rounded-lg text-gray-300">
                            <li>前往 <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">script.google.com</a> 並建立一個新專案。</li>
                            <li>將上方產生的程式碼完整複製並貼到程式碼編輯器中，取代原有內容。</li>
                            <li>點擊上方的「儲存專案」圖示。</li>
                            <li>在函式選擇下拉選單中，確認選擇了 `createSkillSurveyForm`。</li>
                            <li>點擊「執行」按鈕。第一次執行時，Google 會要求您授權，請跟隨指示完成授權。</li>
                            <li>執行成功後，在下方的「執行紀錄」中會看到表單的網址。</li>
                            <li>將此表單網址分享給全班同學填寫。</li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page2_GenerateSkillForm;
