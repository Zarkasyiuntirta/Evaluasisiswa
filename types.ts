
export interface Attendance {
  hadir: number;
  izin: number;
  sakit: number;
}

export interface ExamScores {
  mid1: number;
  final1: number;
  mid2: number;
  final2: number;
}

export interface Proactiveness {
  bertanya: number;
  menjawab: number;
  menambahkan: number;
}

export interface Tasks {
  selesai: number;
}

export interface Student {
  id: number;
  name: string;
  nim: string;
  picture: string;
  attendance: Attendance;
  exams: ExamScores;
  proactiveness: Proactiveness;
  tasks: Tasks;
}

export type UserRole = 'teacher' | 'student';

export interface User {
  username: string;
  role: UserRole;
  studentData?: Student;
}

export type MenuType = 'main' | 'absenteeism' | 'exam' | 'proactiveness' | 'task';
