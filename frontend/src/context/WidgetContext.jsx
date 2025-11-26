import { createContext, useContext, useState } from "react";

const WidgetContext = createContext();

export const WidgetProvider = ({ children }) => {
  const [visibleWidgets, setVisibleWidgets] = useState({
    pomodoro: true,
    todo: true,
    playlist: true,
  });

  const toggleWidget = (name) => {
    setVisibleWidgets((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <WidgetContext.Provider value={{ visibleWidgets, toggleWidget }}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => useContext(WidgetContext);
