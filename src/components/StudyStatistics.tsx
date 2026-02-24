import { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, TrendingUp, Target, Flame, BookOpen, 
  Calendar, BarChart3, Award, Zap, Brain
} from 'lucide-react';
import clsx from 'clsx';

interface StudySession {
  id: string;
  date: string;
  duration: number; // in minutes
  focusSessions: number;
  subject?: string;
}

interface StudyStatisticsProps {
  sessions: StudySession[];
  currentStreak: number;
  longestStreak: number;
}

export default function StudyStatistics({ 
  sessions, 
  currentStreak, 
  longestStreak 
}: StudyStatisticsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's stats
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= today;
    });
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const todayFocusSessions = todaySessions.reduce((sum, s) => sum + s.focusSessions, 0);

    // This week's stats
    const weekSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= weekStart;
    });
    const weekMinutes = weekSessions.reduce((sum, s) => sum + s.duration, 0);
    const weekFocusSessions = weekSessions.reduce((sum, s) => sum + s.focusSessions, 0);

    // This month's stats
    const monthSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= monthStart;
    });
    const monthMinutes = monthSessions.reduce((sum, s) => sum + s.duration, 0);

    // All time stats
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.reduce((sum, s) => sum + s.focusSessions, 0);

    // Daily average (last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysSessions = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo);
    const last30DaysMinutes = last30DaysSessions.reduce((sum, s) => sum + s.duration, 0);
    const dailyAverage = Math.round(last30DaysMinutes / 30);

    // Weekly distribution (for chart)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      const dayStr = day.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => s.date.split('T')[0] === dayStr);
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        minutes: daySessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: daySessions.reduce((sum, s) => sum + s.focusSessions, 0),
      };
    });

    // Subject breakdown
    const subjectMap = new Map<string, number>();
    sessions.forEach(s => {
      const subject = s.subject || 'General';
      subjectMap.set(subject, (subjectMap.get(subject) || 0) + s.duration);
    });
    const subjectBreakdown = Array.from(subjectMap.entries())
      .map(([subject, minutes]) => ({ subject, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    return {
      todayMinutes,
      todayFocusSessions,
      weekMinutes,
      weekFocusSessions,
      monthMinutes,
      totalMinutes,
      totalSessions,
      dailyAverage,
      weeklyData,
      subjectBreakdown,
    };
  }, [sessions]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const maxWeeklyMinutes = Math.max(...stats.weeklyData.map(d => d.minutes), 60);

  // Achievements
  const achievements = useMemo(() => {
    const list = [];
    
    if (currentStreak >= 7) {
      list.push({ icon: Flame, label: 'Week Warrior', desc: '7-day streak', color: 'text-orange-400' });
    }
    if (stats.totalMinutes >= 6000) { // 100 hours
      list.push({ icon: Award, label: 'Century', desc: '100+ hours studied', color: 'text-amber-400' });
    }
    if (stats.totalSessions >= 100) {
      list.push({ icon: Zap, label: 'Power Student', desc: '100+ focus sessions', color: 'text-blue-400' });
    }
    if (longestStreak >= 30) {
      list.push({ icon: Target, label: 'Consistent', desc: '30-day streak achieved', color: 'text-emerald-400' });
    }
    if (stats.dailyAverage >= 60) {
      list.push({ icon: Brain, label: 'Dedicated', desc: '1+ hr daily average', color: 'text-purple-400' });
    }

    return list;
  }, [currentStreak, longestStreak, stats]);

  return (
    <div className="space-y-5">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Clock size={16} />
            <span className="text-xs font-bold">Today</span>
          </div>
          <p className="text-2xl font-black">{formatTime(stats.todayMinutes)}</p>
          <p className="text-xs text-slate-400">{stats.todayFocusSessions} sessions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-bold">This Week</span>
          </div>
          <p className="text-2xl font-black">{formatTime(stats.weekMinutes)}</p>
          <p className="text-xs text-slate-400">{stats.weekFocusSessions} sessions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <Flame size={16} />
            <span className="text-xs font-bold">Current Streak</span>
          </div>
          <p className="text-2xl font-black">{currentStreak}</p>
          <p className="text-xs text-slate-400">days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Target size={16} />
            <span className="text-xs font-bold">Daily Average</span>
          </div>
          <p className="text-2xl font-black">{formatTime(stats.dailyAverage)}</p>
          <p className="text-xs text-slate-400">last 30 days</p>
        </motion.div>
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="gpa-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" />
            <h3 className="font-bold">Weekly Overview</h3>
          </div>
          <span className="text-xs text-slate-400">{formatTime(stats.weekMinutes)} total</span>
        </div>

        <div className="flex items-end gap-2 h-32">
          {stats.weeklyData.map((day, i) => {
            const height = maxWeeklyMinutes > 0 ? (day.minutes / maxWeeklyMinutes) * 100 : 0;
            const isToday = i === new Date().getDay();
            
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{formatTime(day.minutes)}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 4)}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  className={clsx(
                    "w-full rounded-t-lg",
                    isToday 
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' 
                      : 'bg-gradient-to-t from-slate-700 to-slate-600'
                  )}
                />
                <span className={clsx(
                  "text-xs",
                  isToday ? 'text-emerald-400 font-bold' : 'text-slate-500'
                )}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* All-Time Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="gpa-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={18} className="text-blue-400" />
          <h3 className="font-bold">All-Time Stats</h3>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-black text-emerald-400">
              {Math.round(stats.totalMinutes / 60)}
            </p>
            <p className="text-xs text-slate-400">total hours</p>
          </div>
          <div>
            <p className="text-2xl font-black text-blue-400">
              {stats.totalSessions}
            </p>
            <p className="text-xs text-slate-400">focus sessions</p>
          </div>
          <div>
            <p className="text-2xl font-black text-purple-400">
              {longestStreak}
            </p>
            <p className="text-xs text-slate-400">best streak</p>
          </div>
        </div>
      </motion.div>

      {/* Subject Breakdown */}
      {stats.subjectBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-amber-400" />
            <h3 className="font-bold">Top Subjects</h3>
          </div>

          <div className="space-y-3">
            {stats.subjectBreakdown.map((item, i) => {
              const maxMins = stats.subjectBreakdown[0].minutes;
              const width = (item.minutes / maxMins) * 100;
              const colors = [
                'from-emerald-500 to-emerald-600',
                'from-blue-500 to-blue-600',
                'from-purple-500 to-purple-600',
                'from-amber-500 to-amber-600',
                'from-cyan-500 to-cyan-600',
              ];

              return (
                <div key={item.subject}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.subject}</span>
                    <span className="text-xs text-slate-400">{formatTime(item.minutes)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                      className={clsx("h-full rounded-full bg-gradient-to-r", colors[i % colors.length])}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="gpa-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-400" />
            <h3 className="font-bold">Achievements</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {achievements.map((achievement, i) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl"
                >
                  <Icon size={20} className={achievement.color} />
                  <div>
                    <p className="text-sm font-bold">{achievement.label}</p>
                    <p className="text-[10px] text-slate-400">{achievement.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Monthly Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gpa-card border-l-4 border-l-blue-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400 font-bold uppercase mb-1">This Month</p>
            <p className="text-3xl font-black">{formatTime(stats.monthMinutes)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Goal Progress</p>
            <p className="text-lg font-bold text-emerald-400">
              {Math.min(Math.round((stats.monthMinutes / 3000) * 100), 100)}%
            </p>
            <p className="text-[10px] text-slate-500">of 50 hours</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
