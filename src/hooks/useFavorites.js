import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fdc1_favorites';

/**
 * localStorage-backed favorites/bookmarks hook.
 * Supports types: 'driver' | 'circuit' | 'constructor' | 'news'
 *
 * Each favorite: { id, type, label, meta }
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Storage quota exceeded — silently ignore
    }
  }, [favorites]);

  const addFavorite = useCallback((type, id, label, meta = {}) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === id)) return prev; // already exists
      return [...prev, { id, type, label, meta, addedAt: Date.now() }];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const toggleFavorite = useCallback((type, id, label, meta = {}) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === id)) {
        return prev.filter(f => f.id !== id);
      }
      return [...prev, { id, type, label, meta, addedAt: Date.now() }];
    });
  }, []);

  const isFavorite = useCallback((id) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  const getFavoritesByType = useCallback((type) => {
    return favorites.filter(f => f.type === type);
  }, [favorites]);

  const clearAll = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
    clearAll,
  };
}

export default useFavorites;
