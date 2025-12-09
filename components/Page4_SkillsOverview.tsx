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
        let csvContent = "\ufeff"; // Add BOM for Excel compatibility

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
        if (skillData.length > 0) {
            const headers = Object.keys(skillData[0]).join(',');
            csvContent += headers + "\n";
            skillData.forEach(student => {
                const row = Object.values(student).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
                csvContent += row + "\n";
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "class_skills_overview.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadHTML = () => {
        const timestamp = new Date().toLocaleString();

        // Escape content to prevent HTML injection errors
        const safeSummary = summary ? summary.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '尚未生成摘要';

        const htmlContent = `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>電影劇組分組 - 綜合能力報表</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap');
        body { font-family: 'Noto Sans TC', sans-serif; }
        .page-break { page-break-before: always; }
        @media print {
            .no-print { display: none; }
            .print-p-0 { padding: 0; }
            .print-shadow-none { box-shadow: none; }
        }
    </style>
</head>
<body class="bg-gray-100 text-gray-800 p-8 print-p-0">
    <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden print-shadow-none print:w-full">
        <!-- Header -->
        <header class="bg-gray-900 text-white p-8 mb-8 print:bg-gray-900 print:text-white">
            <h1 class="text-3xl font-bold mb-2">電影劇組分組 - 綜合能力報表</h1>
            <p class="text-gray-400">生成時間：${timestamp}</p>
        </header>

        <div class="px-8 pb-8 space-y-12">
            
            <!-- AI Summary Section -->
            <section>
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-cyan-500 pb-2 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    AI 技能摘要
                </h2>
                <div class="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm leading-relaxed whitespace-pre-wrap">
                    ${safeSummary}
                </div>
            </section>

            <!-- High Scorer Chart Section -->
            <section class="break-inside-avoid">
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-cyan-500 pb-2 mb-4 flex items-center gap-2">
                    <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    各職位高分人數分佈 (9-10分)
                </h2>
                <div style="height: 320px; width: 100%;">
                    <canvas id="highScoreChart"></canvas>
                </div>
            </section>

            <!-- Students Detail Section -->
            <section>
                <h2 class="text-2xl font-bold text-gray-800 border-b-2 border-cyan-500 pb-2 mb-6 flex items-center gap-2 page-break">
                    <svg class="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    個別學生技能雷達圖
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    ${skillData.map((student, index) => {
            const scoreList = CREW_ROLES.map(role => `<p>${role}: <span class="font-semibold text-gray-900">${student[role]}</span></p>`).join('');
            return `
                        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm break-inside-avoid">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="text-xl font-bold text-gray-800">${student.姓名}</h3>
                                <span class="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">ID: ${index + 1}</span>
                            </div>
                            <div class="grid grid-cols-5 gap-2 text-sm text-gray-600 mb-4">
                                ${scoreList}
                            </div>
                            <div class="relative" style="height: 250px; width: 100%;">
                                <canvas id="radar-${index}"></canvas>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-100">
                                <p class="text-sm text-gray-500 font-semibold">備註：</p>
                                <p class="text-sm text-gray-700 mt-1 italic">${student.備註 || '無'}</p>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </section>
        </div>
        
        <footer class="text-center p-8 bg-gray-50 text-gray-500 text-sm border-t border-gray-200 no-print">
            <p>本報表由 電影劇組分組精靈 生成</p>
        </footer>
    </div>

    <script>
        // Data passed from React
        const roles = ${JSON.stringify(CREW_ROLES)};
        const chartData = ${JSON.stringify(chartData)};
        const skillData = ${JSON.stringify(skillData)};

        // High Score Bar Chart
        const ctxBar = document.getElementById('highScoreChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.name),
                datasets: [{
                    label: '高分人數 (9-10分)',
                    data: chartData.map(d => d['高分人數 (9-10分)']),
                    backgroundColor: 'rgba(45, 212, 191, 0.6)',
                    borderColor: 'rgb(45, 212, 191)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });

        // Individual Radar Charts
        skillData.forEach((student, index) => {
            const ctxRadar = document.getElementById('radar-' + index).getContext('2d');
            const dataValues = roles.map(role => parseInt(student[role]) || 0);
            
            new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: roles,
                    datasets: [{
                        label: '技能分數',
                        data: dataValues,
                        backgroundColor: 'rgba(45, 212, 191, 0.2)',
                        borderColor: 'rgb(45, 212, 191)',
                        pointBackgroundColor: 'rgb(45, 212, 191)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(45, 212, 191)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            suggestedMin: 0,
                            suggestedMax: 10,
                            ticks: { stepSize: 2, display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        });
    </script>
</body>
</html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "劇組分組_完整網頁報表.html";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
            <div className="flex justify-center gap-4">
                <button
                    onClick={downloadCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors font-semibold"
                >
                    <DownloadIcon className="w-5 h-5" />
                    下載綜合資訊 (CSV)
                </button>
                <button
                    onClick={downloadHTML}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors font-semibold shadow-lg hover:shadow-cyan-500/50"
                >
                    <SparklesIcon className="w-5 h-5" />
                    下載精美網頁報表 (HTML)
                </button>
            </div>
        </div>
    );
};

export default Page4_SkillsOverview;