import React, { useState, useEffect, useCallback } from "react";
import { Rnd } from "react-rnd";
import { XMarkIcon, Cog6ToothIcon } from "@heroicons/react/24/solid"; 

// Define the cycle modes (Unchanged)
const MODES = {
  WORK: 'Work',
  SHORT_BREAK: 'Short Break',
  LONG_BREAK: 'Long Break',
};

// Default times in minutes (Unchanged)
const DEFAULT_DURATIONS = {
  [MODES.WORK]: 25,
  [MODES.SHORT_BREAK]: 5,
  [MODES.LONG_BREAK]: 15,
};

// Central function to map style key to Tailwind classes (Unchanged)
const getWidgetClasses = (style) => {
  switch (style) {
    case 'black_low_opacity':
      return 'bg-gray-900/60 text-white'; 
    case 'white_low_opacity':
      return 'bg-white/30 text-black'; 
    case 'transparent_black':
      return 'bg-transparent border border-black text-black backdrop-blur-md'; 
    case 'transparent_white':
      return 'bg-transparent border border-white text-white backdrop-blur-md'; 
    default:
      return 'bg-gray-900/60 text-white';
  }
};

const minToSec = (min) => parseInt(min || 0) * 60;

export default function PomodoroWidget({ close, style }) {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState(MODES.WORK);
  const [cycles, setCycles] = useState(0); 
  const [durations, setDurations] = useState(DEFAULT_DURATIONS);
  const [time, setTime] = useState(minToSec(durations[MODES.WORK])); 
  const [showSettings, setShowSettings] = useState(false);
  
  const widgetClasses = getWidgetClasses(style);
  
  const getModeTime = useCallback((currentMode) => minToSec(durations[currentMode]), [durations]);

  // --- Theme Helpers (Unchanged) ---
  const isDarkTheme = style === 'black_low_opacity' || style === 'transparent_black';
  const settingsPanelBg = isDarkTheme ? 'bg-gray-800' : 'bg-white';
  const settingsPanelText = isDarkTheme ? 'text-white' : 'text-black';
  const inputBgClass = isDarkTheme ? 'bg-gray-700' : 'bg-gray-200';
  const inputTextColorClass = isDarkTheme ? 'text-white' : 'text-black';
  const inputStyling = `${inputBgClass} ${inputTextColorClass} placeholder:text-gray-400`;
  
  // Controls Lock Styling (Prevents interaction when settings are open)
  const controlsLockedClass = showSettings ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-current/[.3]';
  
  
  const antiDepressClass = 'shadow-none active:shadow-none active:translate-y-0 active:scale-100';


  // --- Handlers  ---
  const handleCycleEnd = useCallback(() => {
    setRunning(false);
    let nextMode = MODES.WORK;
    let newCycles = cycles;
    if (mode === MODES.WORK) {
      newCycles += 1;
      nextMode = (newCycles % 4 === 0) ? MODES.LONG_BREAK : MODES.SHORT_BREAK;
    } 
    setCycles(newCycles);
    setMode(nextMode);
    setTime(getModeTime(nextMode));
  }, [mode, cycles, getModeTime]);

  useEffect(() => {
    let interval;
    if (running && time > 0) {
      interval = setInterval(() => setTime((t) => t - 1), 1000);
    } else if (time === 0) {
      handleCycleEnd();
    }
    return () => clearInterval(interval);
  }, [running, time, handleCycleEnd]);
  
  const handleStart = () => { 
    if (showSettings) return; 
    if (time > 0) { setRunning(true); } 
    else { setTime(getModeTime(mode)); setRunning(true); }
  };
  const handlePause = () => { setRunning(false); };
  
  const handleReset = () => {
    if (showSettings) return; 
    setRunning(false);
    setMode(MODES.WORK);
    setCycles(0);
    setTime(getModeTime(MODES.WORK));
  };
  
  const handleApplyDurations = () => {
    if (!running) { setTime(getModeTime(mode)); }
    setShowSettings(false);
  };
  
  const handleToggleSettings = () => {
    setShowSettings(s => !s);
    setRunning(false); 
  };
  
  // --- Render ---

  return (
    <Rnd 
      default={{ x: 200, y: 100, width: 280, height: 320 }} 
      bounds="window" 
      minWidth={250}
      minHeight={250}
      className="z-30" 
    >
      <div className={`rounded-xl shadow-xl border border-white/10 h-full p-4 ${widgetClasses}`}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Pomodoro: {mode}</h2>
          <div className="flex gap-2">
             <button 
                onClick={handleToggleSettings} 
                className={`opacity-70 hover:opacity-100 transition ${showSettings ? 'opacity-100 text-indigo-400' : ''}`}
              >
                <Cog6ToothIcon className="w-5 h-5" /> 
              </button>
              <button onClick={close}>
                <XMarkIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
        
        <p className="text-sm opacity-80 mb-2">Completed Cycles: {cycles}</p>

        {/* --- Timer Display --- */}
        <div className="text-center text-5xl font-bold mb-4">
          {String(Math.floor(time / 60)).padStart(2, "0")}:
          {String(time % 60).padStart(2, "0")}
        </div>

        {/* --- Settings Panel (Customizable Durations) --- */}
        {showSettings && (
          <div 
            className={`space-y-2 mb-4 p-3 rounded border border-current/20 ${settingsPanelBg} ${settingsPanelText}`}
          >
            <p className="text-sm font-medium">Set Durations (Minutes)</p>
            {Object.entries(durations).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                    <label className="opacity-80 w-1/2">{key}:</label> 
                    <input
                        type="number"
                        min="1"
                        value={value}
                        onChange={(e) => setDurations({...durations, [key]: e.target.value})}
                        // Inputs: flat look
                        className={`w-1/3 p-1 rounded ${inputStyling} text-center focus:ring-0 focus:outline-none 
                                    shadow-none active:shadow-none`}
                    />
                </div>
            ))}
            <button
              onClick={handleApplyDurations}
              // Apply Button: flat look
              className={`w-full bg-current/[.15] hover:bg-current/[.3] px-3 py-1 rounded-lg transition font-medium mt-2
                         ${antiDepressClass}`}
            >
              Apply Durations
            </button>
          </div>
        )}
        
        {/* --- Control Buttons --- */}
        <div className="flex justify-center gap-2">
          
          <button
            onClick={running ? handlePause : handleStart}
            // Control Button: flat look and lock state
            className={`bg-current/[.15] px-5 py-2 transition font-medium w-24 rounded-full 
                        ${antiDepressClass} ${controlsLockedClass}`}
          >
            {running ? "Pause" : "Start"}
          </button>
          
          <button
            onClick={handleReset}
            // Control Button: flat look and lock state
            className={`bg-current/[.15] px-5 py-2 transition font-medium w-24 rounded-full 
                        ${antiDepressClass} ${controlsLockedClass}`}
          >
            Reset
          </button>
        </div>
      </div>
    </Rnd>
  );
}