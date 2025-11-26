import React, { useState as useInternalState } from 'react';
import {
  XMarkIcon, 
  ClockIcon,
  ListBulletIcon,
  MusicalNoteIcon,
  EllipsisVerticalIcon, 
  SunIcon, 
  MoonIcon, 
} from "@heroicons/react/24/solid";

export default function Sidebar({ 
  isOpen, 
  toggle, 
  widgets, 
  toggleWidget, 
  currentStyle,
  setWidgetStyle,
  styleOptions,
}) {
  const [styleMenuOpen, setStyleMenuOpen] = useInternalState(false);
  const sidebarWidth = 'w-64'; 
  
  // Helper to convert constant name to readable text
  const formatName = (key) => {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Helper function to get the icon
  const getWidgetIcon = (key) => {
    switch (key) {
      case 'pomodoro':
        return <ClockIcon className="w-6 h-6" />;
      case 'todo':
        return <ListBulletIcon className="w-6 h-6" />;
      case 'playlist':
        return <MusicalNoteIcon className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-900/80 backdrop-blur-xl shadow-xl border-r border-white/10 
        transition-transform duration-300 ease-in-out z-50 
        ${isOpen ? `translate-x-0 ${sidebarWidth}` : `-translate-x-full ${sidebarWidth}`}
      `}
    >
      <div className="flex items-center justify-end p-4 border-b border-white/10">
        
        <button onClick={toggle} className="text-white hover:text-gray-300">
          <XMarkIcon className="w-6 h-6" /> 
        </button>
      </div>

      {/* Widget Toggles Section */}
      <div className="mt-4 flex flex-col gap-4 text-white px-3">
        
        {/* Render buttons using map */}
        {Object.entries(widgets).map(([key, isVisible]) => (
          <button
            key={key}
            className={`flex items-center gap-3 p-2 rounded-lg transition 
                        ${isVisible ? "bg-white/20" : "hover:bg-white/10"}`}
            
            onClick={() => toggleWidget(key)}
          >
            {getWidgetIcon(key)}
            <span>{formatName(key)}</span>
          </button>
        ))}

        {/* --- Style Selector Dropdown --- */}
        <div className="relative">
            <button
              onClick={() => setStyleMenuOpen(!styleMenuOpen)}
              className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-white/10 transition mt-4 border border-white/10"
            >
              <span className="flex items-left ">
                
                Widget Style: 
              </span>
               <span className="flex items-right gap-2">
                
                 {formatName(currentStyle)}
              </span>
            </button>
            
            {styleMenuOpen && (
              <div className="absolute left-0 mt-2 w-full bg-gray-800 rounded-lg shadow-xl border border-white/10 z-10">
                {Object.values(styleOptions).map(style => (
                  <button
                    key={style}
                    onClick={() => {
                      setWidgetStyle(style);
                      setStyleMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 transition rounded-lg flex items-center gap-2 ${currentStyle === style ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-white/10'}`}
                  >
                    {style.includes('black') ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
                    {formatName(style)}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}