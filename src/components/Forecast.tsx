import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertCircle, History } from 'lucide-react';
import { Semester } from '../types';
import { calculateSemesterGPA } from '../utils';

interface ForecastProps {
  currentCredits: number;
  currentPoints: number;
  semesters: Semester[];
}

export const Forecast: React.FC<ForecastProps> = ({ currentCredits, currentPoints, semesters }) => {
  const [targetCGPA, setTargetCGPA] = useState<string>('3.5');
  const [plannedCredits, setPlannedCredits] = useState<string>('15');
  const [expectedGPA, setExpectedGPA] = useState<string>('3.8');

  const currentCGPA = currentCredits > 0 ? currentPoints / currentCredits : 0;

  // Calculate required GPA to hit target CGPA
  const calculateRequiredGPA = () => {
    const target = parseFloat(targetCGPA);
    const planned = parseFloat(plannedCredits);
    
    if (isNaN(target) || isNaN(planned) || planned <= 0) return null;

    const totalTargetPoints = target * (currentCredits + planned);
    const requiredPoints = totalTargetPoints - currentPoints;
    const requiredGPA = requiredPoints / planned;

    return requiredGPA;
  };

  // Calculate resulting CGPA if expected GPA is achieved
  const calculateResultingCGPA = () => {
    const expected = parseFloat(expectedGPA);
    const planned = parseFloat(plannedCredits);

    if (isNaN(expected) || isNaN(planned) || planned <= 0) return null;

    const newTotalPoints = currentPoints + (expected * planned);
    const newTotalCredits = currentCredits + planned;

    return newTotalPoints / newTotalCredits;
  };

  const requiredGPA = calculateRequiredGPA();
  const resultingCGPA = calculateResultingCGPA();

  const historicalAverage = useMemo(() => {
    const pastSemesters = semesters.filter(s => s.courses.some(c => c.grade !== ''));
    if (pastSemesters.length === 0) return 0;
    
    const gpas = pastSemesters.map(s => calculateSemesterGPA(s.courses));
    return gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
  }, [semesters]);

  const historicalForecastCGPA = useMemo(() => {
    const planned = parseFloat(plannedCredits);
    if (isNaN(planned) || planned <= 0 || historicalAverage === 0) return null;

    const newTotalPoints = currentPoints + (historicalAverage * planned);
    const newTotalCredits = currentCredits + planned;

    return newTotalPoints / newTotalCredits;
  }, [currentPoints, currentCredits, plannedCredits, historicalAverage]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Target CGPA Calculator */}
        <div className="gpa-card bg-white dark:bg-slate-900 border-t-4 border-t-emerald-500">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target size={20} className="text-emerald-500" />
            Target CGPA Calculator
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Find out what GPA you need in your upcoming courses to reach your goal.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Target CGPA</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                max="4" 
                value={targetCGPA} 
                onChange={(e) => setTargetCGPA(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Planned Credits</label>
              <input 
                type="number" 
                step="1" 
                min="1" 
                value={plannedCredits} 
                onChange={(e) => setPlannedCredits(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium mb-1">Required GPA</p>
              {requiredGPA !== null ? (
                requiredGPA > 4.0 ? (
                  <div className="flex items-start gap-2 text-red-500">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">Impossible. You need a {requiredGPA.toFixed(2)} GPA, which is over 4.0.</p>
                  </div>
                ) : requiredGPA < 0 ? (
                  <p className="text-2xl font-black text-emerald-500">0.00</p>
                ) : (
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{requiredGPA.toFixed(2)}</p>
                )
              ) : (
                <p className="text-slate-400 italic">Enter valid numbers</p>
              )}
            </div>
          </div>
        </div>

        {/* Future CGPA Predictor */}
        <div className="gpa-card bg-white dark:bg-slate-900 border-t-4 border-t-blue-500">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Future CGPA Predictor
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            See how your CGPA will change if you achieve a specific GPA in your next courses.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Expected GPA</label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                max="4" 
                value={expectedGPA} 
                onChange={(e) => setExpectedGPA(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Planned Credits</label>
              <input 
                type="number" 
                step="1" 
                min="1" 
                value={plannedCredits} 
                onChange={(e) => setPlannedCredits(e.target.value)}
                className="input-field"
              />
            </div>
            
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium mb-1">Resulting CGPA</p>
              {resultingCGPA !== null ? (
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{resultingCGPA.toFixed(2)}</p>
                  <p className="text-sm font-bold text-slate-400 mb-1">
                    {resultingCGPA > currentCGPA ? '↑ Up' : resultingCGPA < currentCGPA ? '↓ Down' : '− Same'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic">Enter valid numbers</p>
              )}
            </div>
          </div>
        </div>

        {/* Historical Forecast */}
        <div className="gpa-card bg-white dark:bg-slate-900 border-t-4 border-t-purple-500 md:col-span-2">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <History size={20} className="text-purple-500" />
            Historical Forecast
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Predicts your future CGPA based on your historical average semester GPA.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium mb-1">Historical Average GPA</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {historicalAverage > 0 ? historicalAverage.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium mb-1">Planned Credits</p>
              <p className="text-2xl font-black text-slate-700 dark:text-slate-300">
                {plannedCredits || '0'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">Predicted CGPA</p>
              {historicalForecastCGPA !== null ? (
                <div className="flex items-end gap-3">
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{historicalForecastCGPA.toFixed(2)}</p>
                  <p className="text-xs font-bold text-purple-400/80 mb-1">
                    {historicalForecastCGPA > currentCGPA ? '↑ Up' : historicalForecastCGPA < currentCGPA ? '↓ Down' : '− Same'}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic">N/A</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
