import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { analyzeSkills } from '../services/geminiService';
import { CREW_ROLES } from '../constants';
import type { StudentSkill } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface Page4Props {
    skillData: StudentSkill[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const students = data.students || [];
        return (
            <div className="p-3 bg-gray-700 border border-gray-600 rounded-md shadow-lg text-white">
                <p className="font-bold text-cyan-400">{label}</p>
                <p className="text-sm">{`高分人數: ${data['高分人數 (9-10分)']}`}</p>
                {students.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-500">
                        <p className="text-sm font-semibold">高分學生:</p>
                        <ul className="list-disc list-inside text-sm text-gray-300">
                            {students.map((name: string, index: number) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const Page4_SkillsOverview: React.FC<Page4Props> = ({ skillData }) => {
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentSkill | null>(null);

    const chartData = useMemo(() => {
        if (!skillData.length) return [];
        return CREW_ROLES.map(role => {
            const highScorers = skillData.filter(student => {
                const scoreValue = student[role];
                const score = typeof scoreValue === 'string' ? parseInt(scoreValue, 10) : scoreValue;
                return !isNaN(score) && score >= 9;
            });
            return {
                name: role,
                '高分人數 (9-10分)': highScorers.length,
                students: highScorers.map(s => s.姓名)
            };
        });
    }, [skillData]);

    const radarData = useMemo(() => {
        if (!selectedStudent) return [];
        return CREW_ROLES.map(role => ({
            name: role,
            score: parseInt(String(selectedStudent[role]), 10) || 0,
        }));
    }, [selectedStudent]);

    useEffect(() => {
        if (skillData.length > 0) {
            setIsLoadingSummary(true);
            analyzeSkills(skillData)
                .then(setSummary)
                .finally(() => setIsLoadingSummary(false));
            
            setSelectedStudent(skillData[0]);
        }
    }, [skillData]);
    
    const downloadCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // 1. AI Summary
        csvContent += "類別,內容\n";
        csvContent += `AI摘要,"${summary.replace(/"/g, '""')}"\n\n`;

        // 2. High Scorer Stats
        csvContent += "職位,高分人數 (9-10分),高分學生\n";
        chartData.forEach(row => {
            const studentNames = row.students.join('; ');
            csvContent += `${row.name},${row['高分人數 (9-10分)']},"${studentNames}"\n`;
        });
        csvContent += "\n\n";

        // 3. Full Student Data
        csvContent += "學生詳細資料 (原始問卷結果)\n";
        if(skillData.length > 0) {
            const headers = Object.keys(skillData[0]).join(',');
            csvContent += headers + "\n";
            skillData.forEach(student => {
                const row = Object.values(student).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                csvContent += row + "\n";
            });
        }
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "class_skills_overview.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (skillData.length === 0) {
        return <p className="text-center text-gray-400">沒有可顯示的數據。請返回上一步上傳 CSV 檔案。</p>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-4">
                        <ChartBarIcon className="w-6 h-6" />
                        各職位高分人數分佈
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                            <XAxis dataKey="name" stroke="#A0AEC0" />
                            <YAxis stroke="#A0AEC0" allowDecimals={false} />
                            <Tooltip cursor={{ fill: 'rgba(45, 212, 191, 0.1)' }} content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="高分人數 (9-10分)" fill="#2DD4BF" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="p-6 bg-gray-900/50 rounded-lg">
                    <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-4">
                        <SparklesIcon className="w-6 h-6" />
                        AI 技能摘要
                    </h3>
                    {isLoadingSummary ? (
                         <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
                            <svg className="animate-spin h-8 w-8 text-cyan-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="font-semibold">AI 摘要生成中...</p>
                            <p className="text-sm">請稍候片刻</p>
                        </div>
                    ) : (
                        <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
                    )}
                </div>
            </div>

            <div className="p-6 bg-gray-900/50 rounded-lg">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-cyan-300 mb-4">
                    <UserGroupIcon className="w-6 h-6" />
                    查看個別學生志願
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <label htmlFor="student-select" className="block text-sm font-medium text-gray-400 mb-2">選擇學生</label>
                        <select
                            id="student-select"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-cyan-500"
                            onChange={(e) => setSelectedStudent(skillData.find(s => s.姓名 === e.target.value) || null)}
                            value={selectedStudent?.姓名 || ''}
                        >
                            {skillData.map(s => <option key={s.姓名} value={s.姓名}>{s.姓名}</option>)}
                        </select>
                    </div>
                    {selectedStudent && (
                        <div className="md:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-gray-800 p-4 rounded-md">
                                <h4 className="text-lg font-bold text-white mb-3">{selectedStudent.姓名}</h4>
                                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                    {CREW_ROLES.map(role => (
                                        <div key={role}>
                                            <span className="text-gray-400">{role}: </span>
                                            <span className="font-semibold text-cyan-300">{selectedStudent[role] || 'N/A'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-300">備註：</h5>
                                    <p className="text-gray-400 mt-1 bg-gray-900/50 p-3 rounded text-sm">{selectedStudent.備註 || '無'}</p>
                                </div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-md flex flex-col">
                                 <h5 className="font-semibold text-center text-gray-300 mb-2">個人技能雷達圖</h5>
                                 <div className="flex-grow">
                                    <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                            <PolarGrid stroke="#4A5568" />
                                            <PolarAngleAxis dataKey="name" stroke="#A0AEC0" tick={{ fontSize: 11 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="none" />
                                            <Radar name={selectedStudent.姓名} dataKey="score" stroke="#2DD4BF" fill="#2DD4BF" fillOpacity={0.6} />
                                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4A5568' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                 </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <div className="flex justify-center">
                <button
                    onClick={downloadCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors font-semibold"
                >
                    <DownloadIcon className="w-5 h-5" />
                    下載綜合資訊 (CSV)
                </button>
            </div>
        </div>
    );
};

export default Page4_SkillsOverview;