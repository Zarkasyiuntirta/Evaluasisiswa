
import React, { useState, useMemo, FC } from 'react';
import { User, Student, MenuType } from '../types';
import MainMenu from './menus/MainMenu';
import AbsenteeismMenu from './menus/AbsenteeismMenu';
import ExamMenu from './menus/ExamMenu';
import ProactivenessMenu from './menus/ProactivenessMenu';
import TaskMenu from './menus/TaskMenu';
import { HomeIcon, ClipboardListIcon, AcademicCapIcon, SparklesIcon, DocumentTextIcon, LogoutIcon } from './Icons';

interface DashboardProps {
  user: User;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, students, onUpdateStudents, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('main');

  const menuItems = useMemo(() => {
    const allMenus: { id: MenuType; label: string; icon: FC<{className?: string}> }[] = [
      { id: 'main', label: 'Main Menu', icon: HomeIcon },
      { id: 'absenteeism', label: 'Absenteeism', icon: ClipboardListIcon },
      { id: 'exam', label: 'Exam', icon: AcademicCapIcon },
      { id: 'proactiveness', label: 'Proactiveness', icon: SparklesIcon },
      { id: 'task', label: 'Task', icon: DocumentTextIcon },
    ];
    if (user.role === 'student') {
      return allMenus.filter(menu => menu.id === 'main');
    }
    return allMenus;
  }, [user.role]);

  const renderContent = () => {
    switch (activeMenu) {
      case 'main':
        return <MainMenu user={user} students={students} />;
      case 'absenteeism':
        return <AbsenteeismMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'exam':
        return <ExamMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'proactiveness':
        return <ProactivenessMenu students={students} onUpdateStudents={onUpdateStudents} />;
      case 'task':
        return <TaskMenu students={students} onUpdateStudents={onUpdateStudents} />;
      default:
        return <MainMenu user={user} students={students} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black/20 backdrop-blur-lg flex-shrink-0 p-4 border-r border-cyan-400/20">
        <div className="flex flex-col h-full">
            <div className="text-center py-4 mb-8">
                <h1 className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.7)]">DASHBOARD</h1>
                <p className="text-xs text-gray-400">Welcome, {user.username}</p>
            </div>
            <nav className="flex-grow">
            <ul>
                {menuItems.map((item) => (
                <li key={item.id} className="mb-2">
                    <button
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ${
                        activeMenu === item.id
                        ? 'bg-cyan-500/20 text-cyan-300 shadow-inner shadow-cyan-500/20'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                    >
                    <item.icon className="w-5 h-5 mr-3"/>
                    <span>{item.label}</span>
                    </button>
                </li>
                ))}
            </ul>
            </nav>
            <button
                onClick={onLogout}
                className="w-full flex items-center p-3 rounded-lg text-gray-400 hover:bg-red-500/50 hover:text-white transition-all duration-300"
            >
                <LogoutIcon className="w-5 h-5 mr-3"/>
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto" style={{ perspective: '1500px' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
