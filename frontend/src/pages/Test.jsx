import React, { useState } from 'react';
import { movieService } from '../services/movieService';

const Test = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testMovieAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log('Testing movie API with ID: 1');
      const movie = await movieService.getMovieById(1);
      console.log('Movie API result:', movie);
      setResult(movie);
    } catch (err) {
      console.error('Movie API error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-netflix-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <button 
          onClick={testMovieAPI}
          disabled={loading}
          className="btn btn-primary mb-8"
        >
          {loading ? 'Testing...' : 'Test Movie API (ID: 1)'}
        </button>

        {error && (
          <div className="bg-red-900 p-4 rounded mb-4">
            <h3 className="font-bold mb-2">Error:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        {result && (
          <div className="bg-green-900 p-4 rounded">
            <h3 className="font-bold mb-2">Success:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test; 