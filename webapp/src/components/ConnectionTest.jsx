import React, { useEffect, useState } from 'react';
import { runConnectionTests } from '../services/testConnection.js';

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const results = await runConnectionTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        connection: { success: false, message: 'Test failed', error: error.message },
        auth: { success: false, message: 'Test failed', error: error.message },
        allPassed: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run tests automatically when component mounts
    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-800">Testing backend connection...</span>
        </div>
      </div>
    );
  }

  if (!testResults) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Backend Connection Status</h3>
      
      <div className="space-y-3">
        {/* Connection Test */}
        <div className={`p-3 rounded-lg border ${
          testResults.connection.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">API Connection</span>
            <span className={`px-2 py-1 rounded text-sm ${
              testResults.connection.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResults.connection.success ? '✅ Connected' : '❌ Failed'}
            </span>
          </div>
          <p className="text-sm mt-1 text-gray-600">
            {testResults.connection.message}
          </p>
          {testResults.connection.error && (
            <p className="text-sm mt-1 text-red-600">
              Error: {testResults.connection.error}
            </p>
          )}
        </div>

        {/* Auth Test */}
        <div className={`p-3 rounded-lg border ${
          testResults.auth.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Authentication Endpoint</span>
            <span className={`px-2 py-1 rounded text-sm ${
              testResults.auth.success 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {testResults.auth.success ? '✅ Accessible' : '❌ Failed'}
            </span>
          </div>
          <p className="text-sm mt-1 text-gray-600">
            {testResults.auth.message}
          </p>
          {testResults.auth.error && (
            <p className="text-sm mt-1 text-red-600">
              Error: {testResults.auth.error}
            </p>
          )}
        </div>

        {/* Overall Status */}
        <div className={`p-3 rounded-lg border ${
          testResults.allPassed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Overall Status</span>
            <span className={`px-2 py-1 rounded text-sm ${
              testResults.allPassed 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {testResults.allPassed ? '✅ Ready' : '⚠️ Issues Found'}
            </span>
          </div>
          <p className="text-sm mt-1 text-gray-600">
            {testResults.allPassed 
              ? 'Backend is properly connected and ready to use'
              : 'Some connection issues detected. Check your configuration.'
            }
          </p>
        </div>
      </div>

      <button
        onClick={runTests}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Retry Tests
      </button>
    </div>
  );
};

export default ConnectionTest;
