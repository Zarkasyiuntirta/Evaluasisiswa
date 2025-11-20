
import React, { useState, useMemo } from 'react';
import { User, Student } from '../../types';
import { calculateSummaryScore, calculateExamAverage, calculateTaskScore, calculateAbsensiScore } from '../../utils/calculations';

interface MainMenuProps {
  user: User;
  students: Student[];
}

// Reusable component for stat cards/charts
// Updated to ensure title is centered and width is full for proper positioning
const StatCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/20 p-6 ${className}`}>
        <h3 className="text-sm text-cyan-300 uppercase tracking-widest mb-4 text-center w-full">{title}</h3>
        {children}
    </div>
);

// Helper to render a single layer of the pie chart ring
const PieRingLayer: React.FC<{ 
    data: { value: number, color: string, label: string }[], 
    radius: number, 
    total: number, 
    opacity?: number, 
    brightness?: number 
}> = ({ data, radius, total, opacity = 1, brightness = 100 }) => {
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercentage = 0;

    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{transform: 'rotate(-90deg)'}}>
            <circle cx="50" cy="50" r={radius} stroke="transparent" strokeWidth="10" fill="none" />
            {data.map((slice, index) => {
                if (slice.value === 0) return null;
                const percentage = (slice.value / total) * 100;
                const offset = circumference - (percentage / 100) * circumference;
                const rotation = (accumulatedPercentage / 100) * 360;
                accumulatedPercentage += percentage;
                return (
                    <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={slice.color}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform={`rotate(${rotation} 50 50)`}
                        strokeLinecap="butt"
                        style={{ filter: `brightness(${brightness}%)`, opacity }}
                    />
                );
            })}
        </svg>
    );
}

// New 3D Pie Chart component for Proactiveness
const Proactiveness3DPieChart: React.FC<{ proactiveness: Student['proactiveness'] }> = ({ proactiveness }) => {
    const { bertanya, menjawab, menambahkan } = proactiveness;
    const total = bertanya + menjawab + menambahkan;

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full">
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="10" fill="none" />
                    </svg>
                    <p className="text-4xl font-bold text-gray-500">0</p>
                </div>
                <p className="mt-4 text-sm text-gray-500">No Data</p>
            </div>
        );
    }

    const data = [
        { value: bertanya, color: '#22d3ee', label: 'Bertanya' }, // cyan-400
        { value: menjawab, color: '#60a5fa', label: 'Menjawab' }, // blue-400
        { value: menambahkan, color: '#a78bfa', label: 'Menambahkan' }, // violet-400
    ];

    // We stack layers to create a 3D extrusion effect
    // Layers 0-4 are the "sides" (darker), Layer 5 is the "top" (bright)
    const layers = [0, 1, 2, 3, 4, 5];

    return (
        <div className="flex flex-col items-center justify-center gap-6 w-full">
            {/* Chart with Pulse Animation */}
            <div className="relative w-48 h-48 flex-shrink-0 animate-pulse-light" style={{ perspective: '1000px' }}>
                <div className="relative w-full h-full preserve-3d" style={{ transform: 'rotateX(55deg) rotateZ(0deg)', transformStyle: 'preserve-3d' }}>
                    {/* Render stacked layers for 3D effect */}
                    {layers.map((i) => {
                        const isTop = i === layers.length - 1;
                        const zOffset = i * 2; // Distance between layers
                        const brightness = isTop ? 110 : 60 + (i * 5); // Gradient brightness for side
                        
                        return (
                            <div 
                                key={i} 
                                className="absolute inset-0" 
                                style={{ transform: `translateZ(${zOffset}px)` }}
                            >
                                <PieRingLayer 
                                    data={data} 
                                    radius={40} 
                                    total={total} 
                                    brightness={brightness}
                                />
                            </div>
                        );
                    })}
                    
                    {/* Center Text Floating above */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `translateZ(${layers.length * 2 + 10}px) rotateX(-55deg)` }}>
                        <p className="text-4xl font-bold text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.8)]">{total}</p>
                        <p className="text-center text-xs text-cyan-200 -mt-1 drop-shadow-md">Aksi</p>
                    </div>
                </div>
            </div>
            
            {/* Legend - Centered below */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
                {data.map(slice => (
                     <div key={slice.label} className="flex items-center gap-2">
                        <div className="relative w-4 h-4">
                            <div className="absolute inset-0 rounded-sm transform skew-x-12" style={{ backgroundColor: slice.color, opacity: 0.7 }}></div>
                            <div className="absolute inset-0 rounded-sm transform -skew-x-6 scale-90 border border-white/20" style={{ backgroundColor: slice.color }}></div>
                        </div>
                        <span className="text-gray-300">{slice.label}:</span>
                        <span className="font-bold text-white">{slice.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// New Sunburst Chart Component for Tasks
const TaskSunburstChart: React.FC<{ tasks: { selesai: number } }> = ({ tasks }) => {
    const total = 10; // From constants
    const completed = tasks.selesai;
    const percentage = Math.round((completed / total) * 100);
    
    // Generate segments
    const segments = [];
    for (let i = 0; i < total; i++) {
        const startAngle = (i * 360) / total;
        const endAngle = ((i + 1) * 360) / total;
        // Gap adjustment
        const gap = 2;
        const isCompleted = i < completed;
        
        segments.push({
            start: startAngle + gap,
            end: endAngle - gap,
            color: isCompleted ? (i % 2 === 0 ? '#22d3ee' : '#3b82f6') : 'rgba(75, 85, 99, 0.3)',
            highlight: isCompleted
        });
    }

    // Helper to create arc path
    const createArc = (start: number, end: number, innerR: number, outerR: number) => {
        const startRad = (start - 90) * Math.PI / 180;
        const endRad = (end - 90) * Math.PI / 180;
        const x1 = 50 + outerR * Math.cos(startRad);
        const y1 = 50 + outerR * Math.sin(startRad);
        const x2 = 50 + outerR * Math.cos(endRad);
        const y2 = 50 + outerR * Math.sin(endRad);
        const x3 = 50 + innerR * Math.cos(endRad);
        const y3 = 50 + innerR * Math.sin(endRad);
        const x4 = 50 + innerR * Math.cos(startRad);
        const y4 = 50 + innerR * Math.sin(startRad);
        
        return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
    };

    return (
        <div className="relative w-48 h-48 flex items-center justify-center animate-pulse-light">
             <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                {segments.map((seg, idx) => (
                    <path
                        key={idx}
                        d={createArc(seg.start, seg.end, 25, 45)}
                        fill={seg.color}
                        className={`transition-all duration-500 ${seg.highlight ? 'hover:brightness-125' : ''}`}
                        style={{ 
                            filter: seg.highlight ? 'drop-shadow(0 0 2px rgba(34, 211, 238, 0.5))' : 'none',
                            opacity: 0.9 
                        }}
                    />
                ))}
                {/* Inner decorative ring */}
                 <circle cx="50" cy="50" r="20" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white drop-shadow-md">{calculateTaskScore(tasks)}</span>
                <span className="text-[10px] text-cyan-300 uppercase tracking-wider">Nilai</span>
            </div>
        </div>
    );
}


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

// New Component for the Attendance 3D bar chart (Identical styling)
const AttendanceRankChart: React.FC<{ students: Student[], selectedStudentId?: number }> = ({ students, selectedStudentId }) => {
    const studentScores = useMemo(() => {
        return students
            .map(s => ({
                id: s.id,
                name: s.name,
                score: calculateAbsensiScore(s.attendance.hadir),
                picture: s.picture
            }))
            .sort((a, b) => b.score - a.score);
    }, [students]);

    return (
        <StatCard title="Nilai Daftar Hadir" className="h-full flex flex-col">
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
                <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Menu Utama</h1>
                <p className="text-gray-400">No student data available.</p>
            </div>
        );
    }
    
    const summaryScore = calculateSummaryScore(studentToDisplay);
    const rank = rankings.get(studentToDisplay.id) || 0;
    const taskScore = calculateTaskScore(studentToDisplay.tasks);

    return (
        <div className="h-full flex flex-col gap-8">
            <div>
                <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Menu Utama</h1>

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
                        <StatCard title="Exam Scores">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Mid Sem 1</p>
                                    <p className="text-3xl font-bold text-white">{studentToDisplay.exams.mid1}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Final Sem 1</p>
                                    <p className="text-3xl font-bold text-white">{studentToDisplay.exams.final1}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Mid Sem 2</p>
                                    <p className="text-3xl font-bold text-white">{studentToDisplay.exams.mid2}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Final Sem 2</p>
                                    <p className="text-3xl font-bold text-white">{studentToDisplay.exams.final2}</p>
                                </div>
                            </div>
                        </StatCard>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <StatCard title="Proaktif" className="flex flex-col items-center justify-center">
                                <Proactiveness3DPieChart proactiveness={studentToDisplay.proactiveness} />
                            </StatCard>
                            <StatCard title="Nilai Tugas" className="flex flex-col items-center justify-center">
                                <TaskSunburstChart tasks={studentToDisplay.tasks} />
                            </StatCard>
                        </div>
                    </div>
                </div>
            </div>
             {/* Bottom Section: Attendance Rank Chart */}
             <div className="flex-grow min-h-[300px]">
                <AttendanceRankChart students={students} selectedStudentId={selectedStudentId} />
            </div>
             {/* Bottom Section: All Students Chart */}
            <div className="flex-grow min-h-[300px]">
                <AllStudentsRankChart students={students} selectedStudentId={selectedStudentId} />
            </div>
        </div>
    );
};

export default MainMenu;
