import { useContext } from 'react';
import MovieContext from '../context/MovieContext';

/**
 * Custom hook to use movie context
 * @returns {object} Movie context value
 */
export const useMovies = () => {
  const context = useContext(MovieContext);
  
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  
  return context;
};

export default useMovies;