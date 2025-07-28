import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for using localStorage with React state
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if key doesn't exist
 * @returns {[any, Function, Function]} [storedValue, setValue, removeValue]
 */
export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for storing and retrieving objects in localStorage
 * @param {string} key - Storage key
 * @param {object} initialValue - Initial object value
 * @returns {[object, Function, Function, Function]} [object, updateObject, resetObject, removeObject]
 */
export const useLocalStorageObject = (key, initialValue = {}) => {
  const [storedObject, setStoredObject, removeStoredObject] = useLocalStorage(key, initialValue);

  // Update specific properties of the object
  const updateObject = useCallback((updates) => {
    setStoredObject(prevObject => ({
      ...prevObject,
      ...updates
    }));
  }, [setStoredObject]);

  // Reset object to initial value
  const resetObject = useCallback(() => {
    setStoredObject(initialValue);
  }, [setStoredObject, initialValue]);

  return [storedObject, updateObject, resetObject, removeStoredObject];
};

/**
 * Hook for storing arrays in localStorage
 * @param {string} key - Storage key
 * @param {Array} initialValue - Initial array value
 * @returns {[Array, Function, Function, Function, Function]} [array, addItem, removeItem, updateItem, clearArray]
 */
export const useLocalStorageArray = (key, initialValue = []) => {
  const [storedArray, setStoredArray, removeStoredArray] = useLocalStorage(key, initialValue);

  // Add item to array
  const addItem = useCallback((item) => {
    setStoredArray(prevArray => [...prevArray, item]);
  }, [setStoredArray]);

  // Remove item from array by index or by predicate function
  const removeItem = useCallback((indexOrPredicate) => {
    setStoredArray(prevArray => {
      if (typeof indexOrPredicate === 'number') {
        return prevArray.filter((_, index) => index !== indexOrPredicate);
      } else if (typeof indexOrPredicate === 'function') {
        return prevArray.filter(item => !indexOrPredicate(item));
      }
      return prevArray;
    });
  }, [setStoredArray]);

  // Update item in array by index
  const updateItem = useCallback((index, newItem) => {
    setStoredArray(prevArray => 
      prevArray.map((item, i) => i === index ? newItem : item)
    );
  }, [setStoredArray]);

  // Clear all items from array
  const clearArray = useCallback(() => {
    setStoredArray([]);
  }, [setStoredArray]);

  return [storedArray, addItem, removeItem, updateItem, clearArray];
};

export default useLocalStorage;