import React, { useState, useMemo } from 'react';
import { User, Student } from '../../types';
import { calculateSummaryScore, calculateExamAverage, calculateTaskScore } from '../../utils/calculations';
import { TOTAL_MEETINGS } from '../../constants';

interface MainMenuProps {
  user: User;
  students: Student[];
}

// Reusable component for stat cards/charts
const StatCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/20 p-6 ${className}`}>
        <h3 className="text-sm text-cyan-300 uppercase tracking-widest mb-4">{title}</h3>
        {children}
    </div>
);

// Proactiveness Radar Chart Component
const ProactivenessRadar: React.FC<{ proactiveness: Student['proactiveness'] }> = ({ proactiveness }) => {
    const size = 200;
    const center = size / 2;
    const maxVal = TOTAL_MEETINGS > 0 ? TOTAL_MEETINGS : 15; // Use 15 as a fallback if TOTAL_MEETINGS is 0

    const calculatePoint = (value: number, angle: number, radiusScale: number) => {
        const radius = (value / maxVal) * (center * 0.8) * radiusScale;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    };

    const angles = [
        -Math.PI / 2, // Bertanya (Top)
        (Math.PI * 7) / 6, // Menjawab (Bottom-left)
        -Math.PI / 6, // Menambahkan (Bottom-right)
    ];

    const dataPoints = [
        proactiveness.bertanya,
        proactiveness.menjawab,
        proactiveness.menambahkan
    ].map((val, i) => calculatePoint(val, angles[i], 1)).join(' ');

    const axisPoints = [1, 2, 3].map((_, i) => calculatePoint(maxVal, angles[i], 1));

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background grid lines */}
            <g opacity="0.3">
                {[0.25, 0.5, 0.75, 1].map(scale => (
                    <polygon
                        key={scale}
                        points={[1,2,3].map((_, i) => calculatePoint(maxVal, angles[i], scale)).join(' ')}
                        fill="none"
                        stroke="rgb(34 211 238)"
                        strokeWidth="1"
                    />
                ))}
            </g>

            {/* Axes */}
            <g opacity="0.5">
                {axisPoints.map((point, i) => <line key={i} x1={center} y1={center} x2={point.split(',')[0]} y2={point.split(',')[1]} stroke="rgb(107 114 128)" strokeWidth="1" />)}
            </g>
             {/* Axis Labels */}
            <text x={center} y={15} fill="#e5e7eb" fontSize="12" textAnchor="middle">Bertanya</text>
            <text x={40} y={size - 10} fill="#e5e7eb" fontSize="12" textAnchor="middle">Menjawab</text>
            <text x={size - 40} y={size - 10} fill="#e5e7eb" fontSize="12" textAnchor="middle">Menambahkan</text>

            {/* Data Polygon */}
            <polygon
                points={dataPoints}
                fill="rgba(0, 255, 255, 0.4)"
                stroke="rgb(34 211 238)"
                strokeWidth="2"
            />
        </svg>
    );
};

// New Component for the 3D bar chart
const AllStudentsRankChart: React.FC<{ students: Student[], selectedStudentId?: number }> = ({ students, selectedStudentId }) => {
    const studentScores = useMemo(() => {
        return students
            .map(s => ({
                id: s.id,
                name: s.name,
                score: calculateSummaryScore(s),
                picture: s.picture
            }))
            .sort((a, b) => b.score - a.score);
    }, [students]);

    return (
        <StatCard title="Class Ranking Overview" className="h-full flex flex-col">
            <div className="w-full flex-grow flex items-end justify-center gap-1 px-4 pt-8 pb-4" style={{ perspective: '1000px' }}>
                {studentScores.map((student) => {
                    const barHeight = student.score;
                    const isSelected = student.id === selectedStudentId;

                    return (
                        <div key={student.id} className="group relative h-full flex-1 max-w-[40px] min-w-[15px] flex items-end justify-center">
                             {/* Tooltip */}
                            <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-cyan-500/50 pointer-events-none z-10 w-32 text-center">
                                <img src={student.picture} alt={student.name} className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-cyan-400"/>
                                <p className="text-white font-bold text-sm truncate">{student.name}</p>
                                <p className="text-cyan-300 text-lg font-bold">{student.score}</p>
                            </div>

                            <div
                                className="relative w-full transition-all duration-500 ease-out group-hover:brightness-125"
                                style={{
                                    height: `${barHeight}%`,
                                    transformStyle: 'preserve-3d',
                                    transform: 'rotateX(-20deg)'
                                }}
                            >
                                {/* Front face */}
                                <div className={`absolute inset-0 transition-colors duration-300 transform ${isSelected ? 'bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'bg-gradient-to-b from-cyan-400 to-blue-600'}`} style={{transform: 'translateZ(7.5px)'}}></div>
                                {/* Top face */}
                                <div
                                    className={`absolute left-0 top-0 w-full h-[15px] transition-colors duration-300 ${isSelected ? 'bg-cyan-100' : 'bg-cyan-200'}`}
                                    style={{ transform: 'rotateX(90deg) translateZ(7.5px)' }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </StatCard>
    );
};

// Main Menu Component
const MainMenu: React.FC<MainMenuProps> = ({ user, students }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<number | undefined>(user.role === 'teacher' ? students[0]?.id : user.studentData?.id);

    const rankings = useMemo(() => {
        const sortedStudents = [...students]
            .map(s => ({ id: s.id, score: calculateSummaryScore(s) }))
            .sort((a, b) => b.score - a.score);
        
        const rankMap = new Map<number, number>();
        sortedStudents.forEach((s, index) => {
            rankMap.set(s.id, index + 1);
        });
        return rankMap;
    }, [students]);

    const studentToDisplay = students.find(s => s.id === selectedStudentId);

    if (!studentToDisplay) {
        return (
             <div>
                <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Main Menu</h1>
                <p className="text-gray-400">No student data available.</p>
            </div>
        );
    }
    
    const summaryScore = calculateSummaryScore(studentToDisplay);
    const rank = rankings.get(studentToDisplay.id) || 0;
    const examAverage = calculateExamAverage(studentToDisplay.exams);
    const taskScore = calculateTaskScore(studentToDisplay.tasks);

    return (
        <div className="h-full flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Main Menu</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Student Profile */}
                    <div className="lg:col-span-1">
                        <div className="relative p-8 bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl shadow-cyan-500/20 border border-cyan-400/30 h-full">
                            <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl opacity-20 blur-xl -z-10 animate-pulse"></div>
                            <div className="flex flex-col items-center group" style={{ perspective: '1000px' }}>
                                <img
                                    src={studentToDisplay.picture}
                                    alt={studentToDisplay.name}
                                    className="w-32 h-32 rounded-full border-4 border-cyan-400/50 object-cover mb-4 shadow-lg shadow-cyan-500/30 transition-transform duration-700 ease-in-out group-hover:[transform:rotateY(180deg)] [transform-style:preserve-3d]"
                                />
                                
                                {user.role === 'teacher' ? (
                                    <div className="relative group/select">
                                        <select 
                                            value={selectedStudentId} 
                                            onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                                            className="w-full text-center text-2xl font-bold text-white bg-transparent border-none focus:outline-none mb-1 appearance-none cursor-pointer group-hover/select:text-cyan-300 transition-colors pr-6"
                                        >
                                            {students.map(s => <option key={s.id} value={s.id} className="bg-gray-800 text-white">{s.name}</option>)}
                                        </select>
                                        <svg className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover/select:text-cyan-300 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-bold text-white">{studentToDisplay.name}</h2>
                                )}

                                <p className="text-gray-400 mb-6">NIM: {studentToDisplay.nim}</p>
                                
                                <div className="flex justify-around w-full text-center">
                                    <div>
                                        <p className="text-sm text-cyan-300 uppercase tracking-widest">Score</p>
                                        <p className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{summaryScore}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-cyan-300 uppercase tracking-widest">Rank</p>
                                        <p className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{rank}<span className="text-2xl text-gray-400">/{students.length}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Charts */}
                    <div className="lg:col-span-2 space-y-8">
                        <StatCard title="Exam Average">
                            <div className="flex items-center">
                                <p className="text-3xl font-bold text-white mr-4 w-16 text-right">{examAverage}</p>
                                <div className="w-full bg-gray-700/50 rounded-full h-4">
                                    <div 
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full"
                                        style={{ width: `${examAverage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </StatCard>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <StatCard title="Proactiveness" className="flex justify-center items-center">
                                <ProactivenessRadar proactiveness={studentToDisplay.proactiveness} />
                            </StatCard>
                            <StatCard title="Task Score" className="flex justify-center items-center">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="10" fill="none" />
                                        <circle 
                                            cx="50" cy="50" r="45" 
                                            stroke="url(#taskGradient)" strokeWidth="10" fill="none"
                                            strokeDasharray={2 * Math.PI * 45}
                                            strokeDashoffset={(2 * Math.PI * 45) * (1 - taskScore / 100)}
                                            transform="rotate(-90 50 50)"
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#22d3ee" />
                                                <stop offset="100%" stopColor="#3b82f6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <p className="text-4xl font-bold text-white">{taskScore}</p>
                                </div>
                            </StatCard>
                        </div>
                    </div>
                </div>
            </div>
             {/* Bottom Section: All Students Chart */}
            <div className="flex-grow min-h-[300px]">
                <AllStudentsRankChart students={students} selectedStudentId={selectedStudentId} />
            </div>
        </div>
    );
};

export default MainMenu;