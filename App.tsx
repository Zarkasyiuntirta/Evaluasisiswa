
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User, Student } from './types';
import { TEACHER_CREDENTIALS, INITIAL_STUDENTS_DATA } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentsData, setStudentsData] = useState<Student[]>(INITIAL_STUDENTS_DATA);
  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = useCallback((username: string, password: string): void => {
    setLoginError('');
    // Check for teacher
    if (username === TEACHER_CREDENTIALS.username && password === TEACHER_CREDENTIALS.password) {
      setCurrentUser({ username: 'major', role: 'teacher' });
      return;
    }

    // Check for student
    const student = INITIAL_STUDENTS_DATA.find(s => s.name === username && s.nim === password);
    if (student) {
      setCurrentUser({ username: student.name, role: 'student', studentData: student });
      return;
    }

    setLoginError('Wrong username or password.');
  }, []);

  const handleLogout = (): void => {
    setCurrentUser(null);
  };

  const handleUpdateStudents = (updatedStudents: Student[]): void => {
    setStudentsData(updatedStudents);
    // If the logged-in user is a student, update their data in the user object too
    if (currentUser?.role === 'student') {
        const updatedSelf = updatedStudents.find(s => s.id === currentUser.studentData?.id);
        if (updatedSelf) {
            setCurrentUser(prev => prev ? {...prev, studentData: updatedSelf} : null);
        }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] to-[#0f0c29] text-gray-200 font-sans">
      {!currentUser ? (
        <Login onLogin={handleLogin} error={loginError} />
      ) : (
        <Dashboard
          user={currentUser}
          students={studentsData}
          onUpdateStudents={handleUpdateStudents}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;
