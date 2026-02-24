import React from 'react';
import { Semester } from '../types';
import { calculateSemesterGPA } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface GPAChartProps {
  semesters: Semester[];
}

export const GPAChart: React.FC<GPAChartProps> = ({ semesters }) => {
  const data = semesters
    .filter(s => s.courses.some(c => c.grade !== ''))
    .map(s => ({
      name: s.name,
      gpa: parseFloat(calculateSemesterGPA(s.courses).toFixed(2))
    }));

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-slate-500 italic">
        Add some grades to see your GPA trend!
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 4.3]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
            }}
          />
          <Area 
            type="monotone" 
            dataKey="gpa" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorGpa)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
