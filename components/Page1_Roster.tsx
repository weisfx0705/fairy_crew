import React from 'react';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface Page1Props {
    roster: string[];
    setRoster: (roster: string[]) => void;
    onNext: () => void;
}

const Page1_Roster: React.FC<Page1Props> = ({ roster, setRoster, onNext }) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const names = e.target.value.split('\n').filter(name => {
            const trimmedName = name.trim();
            return trimmedName !== '' && trimmedName !== '姓名';
        });
        setRoster(names);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="w-full p-6 bg-gray-700/50 rounded-lg">
                <label htmlFor="roster" className="flex items-center gap-2 text-lg font-semibold text-gray-200 mb-3">
                    <UserGroupIcon className="w-6 h-6 text-cyan-400" />
                    班級名單
                </label>
                <p className="text-sm text-gray-400 mb-4">請在此處貼上全班學生的姓名，每行一個名字。這將用於後續的表單生成。</p>
                <textarea
                    id="roster"
                    rows={10}
                    className="w-full p-3 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors text-gray-200"
                    placeholder="例如：&#10;陳嘉暐&#10;陳家零&#10;陳嘉銘"
                    onChange={handleTextChange}
                    value={roster.join('\n')}
                />
            </div>
            <button
                onClick={onNext}
                disabled={roster.length === 0}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg hover:shadow-cyan-500/50"
            >
                <span>儲存名單並前往下一步</span>
                <ChevronRightIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Page1_Roster;