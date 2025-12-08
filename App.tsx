
import React, { useState, useCallback } from 'react';
import { Stepper } from './components/Stepper';
import Page1_Roster from './components/Page1_Roster';
import Page2_GenerateSkillForm from './components/Page2_GenerateSkillForm';
import Page3_UploadSkillCsv from './components/Page3_UploadSkillCsv';
import Page4_SkillsOverview from './components/Page4_SkillsOverview';
import Page5_DefineProjects from './components/Page5_DefineProjects';
import Page6_UploadFinalCsvs from './components/Page6_UploadFinalCsvs';
import Page7_Results from './components/Page7_Results';
import { FilmIcon } from './components/icons/FilmIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { SettingsModal } from './components/SettingsModal';
import type { StudentSkill, ProjectDirector, RoleQuota, FinalAssignment } from './types';
import { PAGE_TITLES } from './constants';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [roster, setRoster] = useState<string[]>([]);
    const [skillData, setSkillData] = useState<StudentSkill[]>([]);
    const [directors, setDirectors] = useState<ProjectDirector[]>([]);
    const [roleQuotas, setRoleQuotas] = useState<RoleQuota>({});
    const [csvA, setCsvA] = useState<StudentSkill[]>([]);
    const [csvB, setCsvB] = useState<any[]>([]);
    const [csvC, setCsvC] = useState<any[]>([]);
    const [finalAssignments, setFinalAssignments] = useState<FinalAssignment[]>([]);
    const [assignmentRationale, setAssignmentRationale] = useState<string>('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const totalPages = 7;

    const handleNext = useCallback(() => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    }, []);

    const handleBack = useCallback(() => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }, []);

    const resetAll = useCallback(() => {
        setCurrentPage(1);
        setRoster([]);
        setSkillData([]);
        setDirectors([]);
        setRoleQuotas({});
        setCsvA([]);
        setCsvB([]);
        setCsvC([]);
        setFinalAssignments([]);
        setAssignmentRationale('');
    }, []);


    const renderPage = () => {
        switch (currentPage) {
            case 1:
                return <Page1_Roster roster={roster} setRoster={setRoster} onNext={handleNext} />;
            case 2:
                return <Page2_GenerateSkillForm roster={roster} />;
            case 3:
                return <Page3_UploadSkillCsv setSkillData={setSkillData} onNext={handleNext} />;
            case 4:
                return <Page4_SkillsOverview skillData={skillData} />;
            case 5:
                return <Page5_DefineProjects roster={roster} setDirectors={setDirectors} directors={directors} setRoleQuotas={setRoleQuotas} />;
            case 6:
                return <Page6_UploadFinalCsvs
                    setCsvA={setCsvA}
                    setCsvB={setCsvB}
                    setCsvC={setCsvC}
                    roleQuotas={roleQuotas}
                    directors={directors}
                    onNext={handleNext}
                    setFinalAssignments={setFinalAssignments}
                    setAssignmentRationale={setAssignmentRationale}
                />;
            case 7:
                return <Page7_Results assignments={finalAssignments} rationale={assignmentRationale} onReset={resetAll} />;
            default:
                return <Page1_Roster roster={roster} setRoster={setRoster} onNext={handleNext} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8 relative">
            <button
                onClick={() => setIsSettingsOpen(true)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
                title="設定"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

            <header className="w-full max-w-5xl mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <FilmIcon className="w-12 h-12 text-cyan-400" />
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">電影劇組分組精靈</h1>
                </div>
                <p className="text-lg text-gray-400">先收集大家的偏好，再讓AI助理完成電影劇組的分配工作</p>
            </header>

            <main className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-white/10">
                <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">{PAGE_TITLES[currentPage - 1]}</h2>
                    <Stepper currentPage={currentPage} totalPages={totalPages} />
                    <div className="mt-8">
                        {renderPage()}
                    </div>
                </div>
                <div className="px-6 sm:px-8 py-4 bg-gray-800/50 rounded-b-2xl border-t border-white/10 flex justify-between items-center">
                    <button
                        onClick={handleBack}
                        disabled={currentPage === 1}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                        上一步
                    </button>
                    {currentPage < totalPages && currentPage !== 1 && currentPage !== 3 && currentPage !== 6 && (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                        >
                            下一步
                        </button>
                    )}
                </div>
            </main>
            <footer className="mt-8 text-center text-gray-500 text-sm">
                <p>
                    義守大學電影與電視學系
                    <a
                        href="https://weisfx0705.github.io/chiawei/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline"
                    >
                        陳嘉暐製作
                    </a>
                    （https://weisfx0705.github.io/chiawei/）
                </p>
            </footer>
        </div>
    );
};

export default App;
