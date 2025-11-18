
import React from 'react';

interface Table3DProps {
  headers: string[];
  children: React.ReactNode;
}

const Table3D: React.FC<Table3DProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-max text-left border-collapse" style={{ transformStyle: 'preserve-3d' }}>
        <thead className="sticky top-0 z-10">
          <tr className="bg-black/30 backdrop-blur-md">
            {headers.map((header, index) => (
              <th key={index} className="p-4 border-b border-cyan-400/30 text-cyan-300 font-bold uppercase text-sm">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody >
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow3D: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <tr className="bg-gray-800/20 hover:bg-cyan-500/10 transition-all duration-300 transform-gpu hover:scale-[1.02] hover:-translate-y-1" style={{transform: 'translateZ(0)'}}>
            {children}
        </tr>
    );
}

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
    return (
        <td className={`p-4 border-b border-gray-700/50 align-middle ${className}`}>
            {children}
        </td>
    );
}


export default Table3D;
