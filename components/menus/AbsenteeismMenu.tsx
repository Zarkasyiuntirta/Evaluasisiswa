
import React, { useState, useEffect } from 'react';
import { Student } from '../../types';
import Table3D, { TableRow3D, TableCell } from '../common/Table3D';
import Modal from '../common/Modal';
import { TOTAL_MEETINGS } from '../../constants';
import { calculateAbsensiScore } from '../../utils/calculations';

interface AbsenteeismMenuProps {
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
}

const AbsenteeismMenu: React.FC<AbsenteeismMenuProps> = ({ students, onUpdateStudents }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    setLocalStudents(JSON.parse(JSON.stringify(students)));
  }, [students]);

  const handleInputChange = (studentId: number, field: keyof Student['attendance'], value: string) => {
    const numericValue = parseInt(value, 10) || 0;
    setLocalStudents(prev =>
      prev.map(student => {
        if (student.id === studentId) {
            const updatedAttendance = { ...student.attendance, [field]: numericValue };
            // Auto-adjust 'hadir' if izin/sakit changes
            if (field !== 'hadir') {
                updatedAttendance.hadir = TOTAL_MEETINGS - (updatedAttendance.izin + updatedAttendance.sakit);
            }
            return { ...student, attendance: updatedAttendance };
        }
        return student;
      })
    );
  };
  
  const handleConfirmSubmit = () => {
    onUpdateStudents(localStudents);
    setIsEditing(false);
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">Absenteeism</h1>
        <div>
            {!isEditing && <button onClick={() => setIsEditing(true)} className="mr-4 px-4 py-2 font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105 transition-all">Revise</button>}
            {isEditing && <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-400 hover:to-blue-400 transform hover:scale-105 transition-all">Submit</button>}
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-cyan-400/20 overflow-hidden p-1">
        <Table3D headers={['Name', 'NIM', 'Izin', 'Sakit', 'Hadir (Actual)', 'Total Meetings', 'Absensi Score']}>
            {localStudents.map(student => (
                <TableRow3D key={student.id}>
                    <TableCell><p className="font-semibold">{student.name}</p></TableCell>
                    <TableCell><p className="text-gray-400">{student.nim}</p></TableCell>
                    <TableCell>
                      {isEditing ? <input type="number" value={student.attendance.izin} onChange={(e) => handleInputChange(student.id, 'izin', e.target.value)} className="w-16 bg-gray-700/50 p-1 rounded"/> : student.attendance.izin}
                    </TableCell>
                    <TableCell>
                      {isEditing ? <input type="number" value={student.attendance.sakit} onChange={(e) => handleInputChange(student.id, 'sakit', e.target.value)} className="w-16 bg-gray-700/50 p-1 rounded"/> : student.attendance.sakit}
                    </TableCell>
                    <TableCell>{student.attendance.hadir}</TableCell>
                    <TableCell>{TOTAL_MEETINGS}</TableCell>
                    <TableCell><p className="font-bold text-lg text-cyan-300">{calculateAbsensiScore(student.attendance.hadir)}</p></TableCell>
                </TableRow3D>
            ))}
        </Table3D>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmSubmit} title="Confirm Changes">
        <p>Are you sure you want to save these attendance records? This action will update the students' scores.</p>
      </Modal>
    </div>
  );
};

export default AbsenteeismMenu;
