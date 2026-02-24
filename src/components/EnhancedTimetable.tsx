import React, { useState, useMemo, useEffect } from 'react';
import { TimetableEntry, Course } from '../types';
import { 
  Clock, MapPin, Plus, Trash2, Calendar, ChevronLeft, ChevronRight,
  Sun, Moon, Coffee, BookOpen, Timer, AlertCircle, CheckCircle,
  List, Grid3X3, Printer, Filter, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface EnhancedTimetableProps {
  entries: TimetableEntry[];
  courses: Course[];
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type ViewMode = 'week' | 'day' | 'list';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const COURSE_COLORS = [
  'from-emerald-500/20 to-teal-500/20 border-emerald-500',
  'from-blue-500/20 to-cyan-500/20 border-blue-500',
  'from-violet-500/20 to-purple-500/20 border-violet-500',
  'from-orange-500/20 to-amber-500/20 border-orange-500',
  'from-pink-500/20 to-rose-500/20 border-pink-500',
  'from-indigo-500/20 to-blue-500/20 border-indigo-500',
  'from-green-500/20 to-lime-500/20 border-green-500',
  'from-red-500/20 to-orange-500/20 border-red-500',
];

const getDayOfWeek = (): typeof DAYS[number] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  return days[new Date().getDay()] as typeof DAYS[number];
};

const parseTime = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTimeRange = (start: string, end: string): string => {
  return `${start} - ${end}`;
};

const getTimeDiff = (time1: string, time2: string): number => {
  return parseTime(time2) - parseTime(time1);
};

export const EnhancedTimetable: React.FC<EnhancedTimetableProps> = ({ 
  entries, 
  courses, 
  onAddEntry, 
  onDeleteEntry 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDay, setSelectedDay] = useState<typeof DAYS[number]>(getDayOfWeek());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showOnlyToday, setShowOnlyToday] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | 'all'>('all');

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Course color map
  const courseColorMap = useMemo(() => {
    const map = new Map<string, string>();
    courses.forEach((course, index) => {
      map.set(course.id, COURSE_COLORS[index % COURSE_COLORS.length]);
    });
    return map;
  }, [courses]);

  const getCourseName = (courseId: string) => 
    courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  
  const getCourseCode = (courseId: string) => 
    courses.find(c => c.id === courseId)?.code || '???';

  const getCourseColor = (courseId: string) => 
    courseColorMap.get(courseId) || COURSE_COLORS[0];

  // Today's info
  const today = getDayOfWeek();
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(e => e.courseId === selectedCourse);
    }
    return filtered;
  }, [entries, selectedCourse]);

  // Today's classes
  const todayClasses = useMemo(() => 
    filteredEntries
      .filter(e => e.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  , [filteredEntries, today]);

  // Current and next class
  const { currentClass, nextClass, timeUntilNext } = useMemo(() => {
    const now = parseTime(currentTimeStr);
    const current = todayClasses.find(c => 
      parseTime(c.startTime) <= now && parseTime(c.endTime) > now
    );
    const upcoming = todayClasses.filter(c => parseTime(c.startTime) > now);
    const next = upcoming[0];
    
    let timeUntil = '';
    if (next) {
      const mins = parseTime(next.startTime) - now;
      if (mins < 60) {
        timeUntil = `${mins} min`;
      } else {
        timeUntil = `${Math.floor(mins / 60)}h ${mins % 60}m`;
      }
    }
    
    return { currentClass: current, nextClass: next, timeUntilNext: timeUntil };
  }, [todayClasses, currentTimeStr]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const totalMinutes = filteredEntries.reduce((sum, e) => 
      sum + getTimeDiff(e.startTime, e.endTime), 0
    );
    const byDay = DAYS.map(day => ({
      day,
      classes: filteredEntries.filter(e => e.day === day).length,
      minutes: filteredEntries
        .filter(e => e.day === day)
        .reduce((sum, e) => sum + getTimeDiff(e.startTime, e.endTime), 0)
    }));
    
    return {
      totalClasses: filteredEntries.length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      byDay
    };
  }, [filteredEntries]);

  // Free slots
  const findFreeSlots = (day: typeof DAYS[number]) => {
    const dayEntries = filteredEntries
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const slots: { start: string; end: string; duration: number }[] = [];
    let lastEnd = '08:00';
    
    dayEntries.forEach(entry => {
      if (parseTime(entry.startTime) > parseTime(lastEnd) + 30) {
        const duration = getTimeDiff(lastEnd, entry.startTime);
        if (duration >= 30) {
          slots.push({ start: lastEnd, end: entry.startTime, duration });
        }
      }
      lastEnd = entry.endTime;
    });
    
    // After last class
    if (parseTime(lastEnd) < parseTime('18:00') && dayEntries.length > 0) {
      slots.push({ start: lastEnd, end: '18:00', duration: getTimeDiff(lastEnd, '18:00') });
    }
    
    return slots;
  };

  // Navigate days
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentIndex = DAYS.indexOf(selectedDay);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % 7 
      : (currentIndex - 1 + 7) % 7;
    setSelectedDay(DAYS[newIndex]);
  };

  // Day entries for selected view
  const selectedDayEntries = useMemo(() => 
    filteredEntries
      .filter(e => e.day === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  , [filteredEntries, selectedDay]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar size={20} className="text-emerald-500" />
            Weekly Schedule
          </h3>
          <p className="text-sm text-slate-400">{todayStr}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddEntry}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Add Class
          </button>
        </div>
      </div>

      {/* Today's Status Card */}
      {today !== 'Sunday' && today !== 'Saturday' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            "gpa-card border-l-4",
            currentClass ? 'border-l-emerald-500' : nextClass ? 'border-l-amber-500' : 'border-l-slate-500'
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={clsx(
                "p-3 rounded-xl",
                currentClass ? 'bg-emerald-900/30' : nextClass ? 'bg-amber-900/30' : 'bg-slate-800'
              )}>
                {currentClass ? (
                  <BookOpen size={24} className="text-emerald-400" />
                ) : nextClass ? (
                  <Timer size={24} className="text-amber-400" />
                ) : (
                  <Coffee size={24} className="text-slate-400" />
                )}
              </div>
              <div>
                {currentClass ? (
                  <>
                    <p className="text-xs text-emerald-400 font-bold uppercase">In Class Now</p>
                    <p className="font-bold text-lg">{getCourseName(currentClass.courseId)}</p>
                    <p className="text-sm text-slate-400">
                      {currentClass.startTime} - {currentClass.endTime}
                      {currentClass.location && ` • ${currentClass.location}`}
                    </p>
                  </>
                ) : nextClass ? (
                  <>
                    <p className="text-xs text-amber-400 font-bold uppercase">Next Class in {timeUntilNext}</p>
                    <p className="font-bold text-lg">{getCourseName(nextClass.courseId)}</p>
                    <p className="text-sm text-slate-400">
                      {nextClass.startTime} - {nextClass.endTime}
                      {nextClass.location && ` • ${nextClass.location}`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 font-bold uppercase">No More Classes</p>
                    <p className="font-bold text-lg">You're Free!</p>
                    <p className="text-sm text-slate-400">Enjoy your day</p>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-slate-400">
                {todayClasses.length} classes today • {weeklyStats.totalHours}h this week
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* View Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-slate-800 rounded-xl p-1">
          {(['week', 'day', 'list'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1",
                viewMode === mode ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              {mode === 'week' && <Grid3X3 size={14} />}
              {mode === 'day' && <Calendar size={14} />}
              {mode === 'list' && <List size={14} />}
              <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </button>
          ))}
        </div>
        
        {/* Course Filter */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="input-field text-sm py-1.5"
          aria-label="Filter by course"
        >
          <option value="all">All Courses</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
          ))}
        </select>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-7 gap-3"
        >
          {DAYS.map((day, dayIndex) => {
            const dayEntries = filteredEntries
              .filter(e => e.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            const isToday = day === today;

            return (
              <div key={day} className="flex flex-col gap-2">
                <h4 className={clsx(
                  "text-xs font-black uppercase tracking-widest text-center py-2 rounded-lg",
                  isToday ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-500'
                )}>
                  {SHORT_DAYS[dayIndex]}
                  {isToday && <span className="ml-1">•</span>}
                </h4>
                <div className={clsx(
                  "flex flex-col gap-2 min-h-[120px] p-2 rounded-xl border border-dashed",
                  isToday ? 'bg-emerald-900/10 border-emerald-800' : 'bg-slate-900/50 border-slate-800'
                )}>
                  <AnimatePresence mode="popLayout">
                    {dayEntries.map((entry, index) => {
                      const colorClass = getCourseColor(entry.courseId);
                      const isNow = isToday && currentClass?.id === entry.id;
                      const duration = getTimeDiff(entry.startTime, entry.endTime);
                      
                      return (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.02 }}
                          className={clsx(
                            "group relative p-2.5 rounded-xl border-l-4 transition-all",
                            `bg-gradient-to-r ${colorClass}`,
                            isNow && 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950'
                          )}
                        >
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                            aria-label="Delete entry"
                          >
                            <Trash2 size={10} />
                          </button>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {entry.startTime}
                            </span>
                            <span className="text-[9px] text-slate-500">{duration}m</span>
                          </div>
                          <div className="text-xs font-bold leading-tight mb-0.5">
                            {getCourseCode(entry.courseId)}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {getCourseName(entry.courseId)}
                          </div>
                          {entry.location && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-slate-500">
                              <MapPin size={8} /> {entry.location}
                            </div>
                          )}
                          {isNow && (
                            <div className="absolute top-1 right-1">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {dayEntries.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-slate-500 italic">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Day Navigator */}
          <div className="flex items-center justify-between bg-slate-800 rounded-xl p-2">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={clsx(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    selectedDay === day 
                      ? 'bg-emerald-600 text-white' 
                      : day === today 
                        ? 'bg-emerald-900/50 text-emerald-400' 
                        : 'text-slate-400 hover:bg-slate-700'
                  )}
                >
                  {SHORT_DAYS[i].charAt(0)}
                </button>
              ))}
            </div>
            <button
              onClick={() => navigateDay('next')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Next day"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <h4 className="font-bold text-lg">{selectedDay}'s Schedule</h4>

          {/* Timeline View */}
          <div className="relative">
            {selectedDayEntries.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Coffee size={40} className="mx-auto mb-3 opacity-50" />
                <p>No classes on {selectedDay}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEntries.map((entry, index) => {
                  const colorClass = getCourseColor(entry.courseId);
                  const duration = getTimeDiff(entry.startTime, entry.endTime);
                  const isNow = selectedDay === today && currentClass?.id === entry.id;
                  const isPast = selectedDay === today && parseTime(entry.endTime) < parseTime(currentTimeStr);
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={clsx(
                        "flex gap-4 p-4 rounded-xl border-l-4 transition-all group",
                        `bg-gradient-to-r ${colorClass}`,
                        isNow && 'ring-2 ring-emerald-400',
                        isPast && 'opacity-50'
                      )}
                    >
                      <div className="text-center">
                        <p className="text-lg font-mono font-bold">{entry.startTime}</p>
                        <p className="text-xs text-slate-500">to</p>
                        <p className="text-sm font-mono text-slate-400">{entry.endTime}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono">
                            {getCourseCode(entry.courseId)}
                          </span>
                          <span className="text-xs text-slate-500">{duration} min</span>
                          {isNow && (
                            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded animate-pulse">
                              NOW
                            </span>
                          )}
                          {isPast && (
                            <CheckCircle size={14} className="text-slate-500" />
                          )}
                        </div>
                        <p className="font-bold">{getCourseName(entry.courseId)}</p>
                        {entry.location && (
                          <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {entry.location}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all self-start"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Free Slots */}
          {selectedDayEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gpa-card"
            >
              <h5 className="font-bold mb-3 flex items-center gap-2">
                <Coffee size={16} className="text-slate-400" />
                Free Time Slots
              </h5>
              <div className="flex flex-wrap gap-2">
                {findFreeSlots(selectedDay).map((slot, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 bg-slate-800 rounded-lg text-sm"
                  >
                    <span className="font-mono">{slot.start} - {slot.end}</span>
                    <span className="text-slate-500 ml-2">({Math.round(slot.duration / 60 * 10) / 10}h)</span>
                  </div>
                ))}
                {findFreeSlots(selectedDay).length === 0 && (
                  <p className="text-slate-500 text-sm">No significant breaks</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {DAYS.map(day => {
            const dayEntries = filteredEntries
              .filter(e => e.day === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));
            
            if (dayEntries.length === 0) return null;
            
            const isToday = day === today;
            const totalMins = dayEntries.reduce((sum, e) => sum + getTimeDiff(e.startTime, e.endTime), 0);
            
            return (
              <div key={day}>
                <div className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-lg mb-2",
                  isToday ? 'bg-emerald-900/30' : 'bg-slate-800/50'
                )}>
                  <h4 className={clsx(
                    "font-bold text-sm",
                    isToday && 'text-emerald-400'
                  )}>
                    {day}
                    {isToday && <span className="ml-2 text-xs font-normal">(Today)</span>}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {dayEntries.length} classes • {Math.round(totalMins / 60 * 10) / 10}h
                  </span>
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-slate-800">
                  {dayEntries.map((entry, index) => {
                    const colorClass = getCourseColor(entry.courseId);
                    const isNow = isToday && currentClass?.id === entry.id;
                    
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-xl group",
                          `bg-gradient-to-r ${colorClass}`,
                          isNow && 'ring-2 ring-emerald-400'
                        )}
                      >
                        <div className="text-center min-w-[80px]">
                          <p className="font-mono text-sm">{entry.startTime}</p>
                          <p className="text-[10px] text-slate-500">{entry.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm">{getCourseCode(entry.courseId)}</p>
                          <p className="text-xs text-slate-400 truncate">{getCourseName(entry.courseId)}</p>
                        </div>
                        {entry.location && (
                          <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1">
                            <MapPin size={10} /> {entry.location}
                          </p>
                        )}
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 bg-red-900/30 text-red-400 rounded-lg transition-all"
                          aria-label="Delete entry"
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Weekly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="gpa-card"
      >
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Clock size={18} className="text-violet-400" />
          Weekly Summary
        </h4>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weeklyStats.byDay.map((day, index) => (
            <div key={day.day} className="text-center">
              <p className="text-[10px] text-slate-500 mb-1">{SHORT_DAYS[index]}</p>
              <div 
                className={clsx(
                  "h-16 rounded-lg flex items-end justify-center transition-all",
                  day.day === today ? 'bg-emerald-900/30' : 'bg-slate-800/50'
                )}
              >
                <div 
                  className={clsx(
                    "w-full rounded-lg transition-all",
                    day.classes > 0 ? 'bg-gradient-to-t from-violet-600 to-purple-500' : ''
                  )}
                  style={{ height: `${Math.min((day.minutes / 300) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs font-bold mt-1">{day.classes}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Total: {weeklyStats.totalClasses} classes</span>
          <span className="text-slate-400">{weeklyStats.totalHours} hours/week</span>
        </div>
      </motion.div>
    </div>
  );
};
