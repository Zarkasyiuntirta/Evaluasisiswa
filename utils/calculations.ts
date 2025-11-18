
import { Student } from '../types';
import { TOTAL_MEETINGS, TOTAL_TASKS } from '../constants';

export const calculateAbsensiScore = (hadir: number): number => {
    if (TOTAL_MEETINGS === 0) return 0;
    return Math.round((hadir / TOTAL_MEETINGS) * 100);
};

export const calculateExamAverage = (scores: Student['exams']): number => {
    return Math.round((scores.mid1 + scores.final1 + scores.mid2 + scores.final2) / 4);
};

export const calculateProactivenessScore = (proactiveness: Student['proactiveness']): number => {
    const totalProactive = proactiveness.bertanya + proactiveness.menjawab + proactiveness.menambahkan;
    return totalProactive > TOTAL_MEETINGS ? 100 : 50;
};

export const calculateTaskScore = (tasks: Student['tasks']): number => {
    if (TOTAL_TASKS === 0) return 0;
    return Math.round((tasks.selesai / TOTAL_TASKS) * 100);
};

export const calculateSummaryScore = (student: Student): number => {
    const absensiValue = calculateAbsensiScore(student.attendance.hadir);
    const examValue = calculateExamAverage(student.exams);
    const proactivenessValue = calculateProactivenessScore(student.proactiveness);
    const taskValue = calculateTaskScore(student.tasks);

    const summary = 
        (absensiValue * 0.10) +
        (examValue * 0.40) +
        (proactivenessValue * 0.20) +
        (taskValue * 0.30);
    
    return Math.round(summary);
};
