
import React from 'react';
import type { FinalAssignment } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface Page7Props {
    assignments: FinalAssignment[];
    rationale: string;
    onReset: () => void;
}

const Page7_Results: React.FC<Page7Props> = ({ assignments, rationale, onReset }) => {

    const downloadResults = () => {
        let content = "電影劇組分組結果\n\n";
        content += `AI 分配依據摘要:\n${rationale}\n\n`;
        content += "--------------------------------------\n\n";

        assignments.forEach(project => {
            content += `專案名稱: ${project.projectName}\n`;
            content += `導演: ${project.director}\n`;
            content += "劇組成員:\n";
            project.crew.forEach(member => {
                content += `  - ${member.role}: ${member.student}\n`;
            });
            content += "\n--------------------------------------\n\n";
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'film_crew_assignments.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (assignments.length === 0) {
        return (
            <div className="text-center">
                <p className="text-xl text-gray-400 mb-6">目前沒有分組結果。可能是分析失敗或尚未進行分析。</p>
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors font-semibold"
                >
                    返回第一步
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="p-6 bg-gray-800/80 rounded-lg border border-cyan-900/30 shadow-sm">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-4 border-b border-cyan-900/30 pb-2">
                    <SparklesIcon className="w-6 h-6" />
                    AI 分配依據摘要與完整邏輯
                </h3>
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed text-base">
                    {rationale}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-center text-white mb-6">最終分組結果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((project, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6 ring-1 ring-white/10 flex flex-col">
                            <h4 className="text-xl font-bold text-cyan-400 truncate mb-1">{project.projectName}</h4>
                            <p className="text-gray-400 mb-4">導演：<span className="font-semibold text-white">{project.director}</span></p>
                            <div className="flex-grow space-y-2 border-t border-gray-700 pt-4">
                                {project.crew.map((member, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-400">{member.role}:</span>
                                        <span className="font-medium text-gray-200">{member.student || <span className="text-yellow-400">（待分配）</span>}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6">
                <button
                    onClick={downloadResults}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors font-semibold"
                >
                    <DownloadIcon className="w-5 h-5" />
                    下載分組結果
                </button>
                <button
                    onClick={onReset}
                    className="w-full sm:w-auto px-6 py-3 bg-cyan-700 text-white rounded-md hover:bg-cyan-600 transition-colors font-semibold"
                >
                    重新開始一次
                </button>
            </div>
        </div>
    );
};

export default Page7_Results;
