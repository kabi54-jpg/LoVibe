import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { XMarkIcon, PlusIcon , CheckIcon} from "@heroicons/react/24/solid";

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

export default function TodoWidget({ close, style }) {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const widgetClasses = getWidgetClasses(style);

  const addTodo = () => {
    if (!text.trim()) return;
    setTodos([...todos, { text: text.trim(), completed: false }]);
    setText("");
  };

  const removeTodo = (indexToRemove) => {
    setTodos(todos.filter((_, index) => index !== indexToRemove));
  };
  
  const toggleTodo = (indexToToggle) => {
    setTodos(todos.map((todo, index) => 
      index === indexToToggle 
        ? { ...todo, completed: !todo.completed } 
        : todo
    ));
  };

  const isDarkText = widgetClasses.includes('text-black');
  const inputBgClass = isDarkText ? 'bg-white' : 'bg-gray-800'; 
  const inputTextColorClass = isDarkText ? 'text-black' : 'text-white';
  const buttonClass = 'bg-current/[.15] hover:bg-current/[.3] text-inherit';

  return (
    <Rnd 
      default={{ x: 500, y: 120, width: 300, height: 300 }} 
      bounds="window" 
      minWidth={250}
      minHeight={250}
      className="z-30" 
      dragHandleClassName="widget-drag-handle" 
    >
      <div className={`rounded-xl shadow-xl border border-white/10 h-full p-4 ${widgetClasses}`}>
        
        {/* Header (Drag Handle Area) */}
        <div className="flex justify-between items-center mb-3 widget-drag-handle cursor-move">
          <h2 className="text-lg font-semibold">To-Do List</h2>
          <button onClick={close}><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {/* --- New Task Input --- */}
        <div className="flex gap-2 mb-3">
          <input
            className={`w-full p-2 rounded ${inputBgClass} ${inputTextColorClass} placeholder:opacity-60 focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="New task..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
          />
          <button
            onClick={addTodo}
            className={`${buttonClass} px-3 rounded-lg transition`}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* --- Task List --- */}
        <ul className="space-y-2 overflow-auto max-h-[14rem]">
          {todos.map((todo, i) => (
            <li 
              key={i} 
              className="flex justify-between items-center bg-current/[.15] p-2 rounded hover:bg-current/[.25] transition"
            >
              
              <div className="flex items-center gap-3">
                {/* Checkbox/Tick Container */}
                <div 
                    className={`
                        relative w-5 h-5 flex-shrink-0 rounded 
                        border-2 border-current/50 
                        ${todo.completed ? 'bg-current' : 'bg-transparent'}
                    `}
                >
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(i)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    
                    {/* The Visible Tick Icon */}
                    {todo.completed && (
                        <CheckIcon 
                            className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                        />
                    )}
                </div>

                {/* Text with strikethrough */}
                <span 
                  className={todo.completed ? 'line-through opacity-60' : ''}
                >
                  {todo.text}
                </span>
              </div>
              
              <button 
                onClick={() => removeTodo(i)}
                className="text-red-500 hover:text-red-400 opacity-70 hover:opacity-100 transition"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Rnd>
  );
}
