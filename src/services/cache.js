export const cachedFetch = async (key, fetchFn, ttlMinutes) => {
  const fullKey = `fdc1_${key}`;
  const cached = localStorage.getItem(fullKey);
  
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      const now = new Date().getTime();
      if (now - timestamp < ttlMinutes * 60 * 1000) {
        return data;
      }
    } catch (e) {
      console.warn('Cache parse error, ignoring cache for', fullKey);
    }
  }

  const data = await fetchFn();
  
  try {
    localStorage.setItem(fullKey, JSON.stringify({
      data,
      timestamp: new Date().getTime()
    }));
  } catch (e) {
    console.warn('Cache save error (quota exceeded?):', e);
  }
  
  return data;
};

export const clearAllCache = () => {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('fdc1_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
};
