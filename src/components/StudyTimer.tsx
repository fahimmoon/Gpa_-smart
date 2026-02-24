import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Coffee, BookOpen, Target, 
  Volume2, VolumeX, Settings, ChevronUp, ChevronDown,
  Clock, Flame, Trophy, BarChart3, Zap
} from 'lucide-react';
import clsx from 'clsx';

interface StudySession {
  id: string;
  date: string;
  duration: number; // minutes
  type: 'focus' | 'break';
  completed: boolean;
}

interface StudyTimerProps {
  sessions: StudySession[];
  onAddSession: (session: Omit<StudySession, 'id'>) => void;
}

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_PRESETS = {
  focus: { default: 25, min: 5, max: 60, label: 'Focus', icon: BookOpen, color: 'text-emerald-400' },
  shortBreak: { default: 5, min: 1, max: 15, label: 'Short Break', icon: Coffee, color: 'text-blue-400' },
  longBreak: { default: 15, min: 5, max: 30, label: 'Long Break', icon: Coffee, color: 'text-purple-400' },
};

export default function StudyTimer({ sessions, onAddSession }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus.default * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusToday, setTotalFocusToday] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  
  const [settings, setSettings] = useState({
    focus: TIMER_PRESETS.focus.default,
    shortBreak: TIMER_PRESETS.shortBreak.default,
    longBreak: TIMER_PRESETS.longBreak.default,
    autoStartBreaks: true,
    longBreakInterval: 4,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Calculate today's stats
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => s.date.startsWith(today) && s.type === 'focus' && s.completed);
    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    setTotalFocusToday(totalMinutes);
    
    // Calculate streak (consecutive days with at least one focus session)
    const dates = [...new Set(sessions.filter(s => s.type === 'focus' && s.completed).map(s => s.date.split('T')[0]))].sort().reverse();
    let streak = 0;
    const todayDate = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(todayDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (dates[i] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    setCurrentStreak(streak);
  }, [sessions]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer completed
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Play sound
    if (soundEnabled) {
      playNotificationSound();
    }

    // Record session
    const durationMinutes = mode === 'focus' 
      ? settings.focus 
      : mode === 'shortBreak' 
        ? settings.shortBreak 
        : settings.longBreak;

    onAddSession({
      date: new Date().toISOString(),
      duration: durationMinutes,
      type: mode === 'focus' ? 'focus' : 'break',
      completed: true,
    });

    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);

      // Determine next break type
      if (newSessionsCompleted % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      // After break, go back to focus
      setMode('focus');
      setTimeLeft(settings.focus * 60);
    }

    // Auto-start if enabled
    if (settings.autoStartBreaks && mode === 'focus') {
      setTimeout(() => setIsRunning(true), 1000);
    }

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'focus' ? '🎉 Focus session complete!' : '☕ Break is over!', {
        body: mode === 'focus' ? 'Great work! Time for a break.' : 'Ready to focus again?',
      });
    }
  }, [mode, settings, sessionsCompleted, soundEnabled, onAddSession]);

  const playNotificationSound = () => {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 300);
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (settings[mode] * 60));
  const circumference = 2 * Math.PI * 120;

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    return sessions
      .filter(s => new Date(s.date) >= weekAgo && s.type === 'focus' && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
  };

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Flame size={16} />
            <span className="text-xs font-bold">Streak</span>
          </div>
          <p className="text-2xl font-black">{currentStreak}</p>
          <p className="text-[10px] text-slate-400">days</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
            <Clock size={16} />
            <span className="text-xs font-bold">Today</span>
          </div>
          <p className="text-2xl font-black">{totalFocusToday}</p>
          <p className="text-[10px] text-slate-400">minutes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
            <Trophy size={16} />
            <span className="text-xs font-bold">Sessions</span>
          </div>
          <p className="text-2xl font-black">{sessionsCompleted}</p>
          <p className="text-[10px] text-slate-400">today</p>
        </motion.div>
      </div>

      {/* Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2"
      >
        {(Object.keys(TIMER_PRESETS) as TimerMode[]).map((timerMode) => {
          const { label, icon: Icon, color } = TIMER_PRESETS[timerMode];
          return (
            <button
              key={timerMode}
              onClick={() => handleModeChange(timerMode)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all",
                mode === timerMode
                  ? 'bg-slate-800 ring-2 ring-emerald-500'
                  : 'bg-slate-800/50 hover:bg-slate-800'
              )}
            >
              <Icon size={16} className={mode === timerMode ? color : 'text-slate-400'} />
              <span className={clsx("text-sm font-medium", mode === timerMode ? color : 'text-slate-400')}>
                {label}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Timer Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="gpa-card flex flex-col items-center py-8"
      >
        {/* Circular Progress */}
        <div className="relative w-64 h-64 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={mode === 'focus' ? '#10b981' : mode === 'shortBreak' ? '#3b82f6' : '#8b5cf6'} />
                <stop offset="100%" stopColor={mode === 'focus' ? '#14b8a6' : mode === 'shortBreak' ? '#06b6d4' : '#a855f7'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black tracking-tight">{formatTime(timeLeft)}</span>
            <span className={clsx("text-sm font-medium mt-2", TIMER_PRESETS[mode].color)}>
              {TIMER_PRESETS[mode].label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Reset"
          >
            <RotateCcw size={20} className="text-slate-400" />
          </button>

          <button
            onClick={() => {
              if (!isRunning) {
                startTimeRef.current = Date.now();
              }
              setIsRunning(!isRunning);
            }}
            className={clsx(
              "p-5 rounded-2xl transition-all transform hover:scale-105",
              isRunning
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400'
            )}
          >
            {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <Volume2 size={20} className="text-slate-400" />
            ) : (
              <VolumeX size={20} className="text-slate-400" />
            )}
          </button>
        </div>

        {/* Session Progress Dots */}
        {sessionsCompleted > 0 && (
          <div className="flex gap-2 mt-6">
            {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  "w-3 h-3 rounded-full transition-colors",
                  i < (sessionsCompleted % settings.longBreakInterval) || 
                  (sessionsCompleted % settings.longBreakInterval === 0 && sessionsCompleted > 0)
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
                )}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Settings Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="gpa-card"
      >
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-slate-400" />
            <span className="font-bold">Timer Settings</span>
          </div>
          {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Duration Settings */}
                {(Object.keys(TIMER_PRESETS) as TimerMode[]).map((timerMode) => (
                  <div key={timerMode} className="flex items-center justify-between">
                    <span className="text-sm">{TIMER_PRESETS[timerMode].label}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          [timerMode]: Math.max(TIMER_PRESETS[timerMode].min, prev[timerMode] - 5)
                        }))}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <span className="w-12 text-center font-bold">{settings[timerMode]}m</span>
                      <button
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          [timerMode]: Math.min(TIMER_PRESETS[timerMode].max, prev[timerMode] + 5)
                        }))}
                        className="p-1 rounded bg-slate-700 hover:bg-slate-600"
                      >
                        <ChevronUp size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Auto-start toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <span className="text-sm">Auto-start breaks</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))}
                    className={clsx(
                      "w-12 h-6 rounded-full transition-colors relative",
                      settings.autoStartBreaks ? 'bg-emerald-600' : 'bg-slate-700'
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.autoStartBreaks ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </button>
                </div>

                {/* Long break interval */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Long break after</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        longBreakInterval: Math.max(2, prev.longBreakInterval - 1)
                      }))}
                      className="p-1 rounded bg-slate-700 hover:bg-slate-600"
                    >
                      <ChevronDown size={16} />
                    </button>
                    <span className="w-12 text-center font-bold">{settings.longBreakInterval}</span>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        longBreakInterval: Math.min(8, prev.longBreakInterval + 1)
                      }))}
                      className="p-1 rounded bg-slate-700 hover:bg-slate-600"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Weekly Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="gpa-card"
      >
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-cyan-400" />
          This Week
        </h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-emerald-400">{getWeeklyStats()}</p>
            <p className="text-xs text-slate-400">minutes of focus</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{(getWeeklyStats() / 60).toFixed(1)}h</p>
            <p className="text-xs text-slate-400">total hours</p>
          </div>
        </div>
        
        {/* Mini calendar view */}
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const dayMinutes = sessions
              .filter(s => s.date.startsWith(dateStr) && s.type === 'focus' && s.completed)
              .reduce((sum, s) => sum + s.duration, 0);
            const intensity = Math.min(dayMinutes / 120, 1); // Max 2 hours = full intensity
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    "w-full h-8 rounded-lg transition-colors",
                    intensity === 0 ? 'bg-slate-700' : ''
                  )}
                  style={{
                    backgroundColor: intensity > 0 ? `rgba(16, 185, 129, ${0.2 + intensity * 0.8})` : undefined
                  }}
                  title={`${dayMinutes} minutes`}
                />
                <span className="text-[10px] text-slate-400">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
