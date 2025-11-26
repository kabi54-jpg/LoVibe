
export const saveWidgetState = (key, state) => {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error("Error saving widget state", err);
  }
};

export const loadWidgetState = (key, defaultState) => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultState;
    return JSON.parse(stored);
  } catch (err) {
    console.error("Error loading widget state", err);
    return defaultState;
  }
};
