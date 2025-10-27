import React from 'react';

export function SimpleExpensesList() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Expenses</h3>
        <p className="text-gray-600 mb-4">
          This is a simple test component to verify the page loads.
        </p>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-800">✅ Page is loading successfully!</p>
        </div>
      </div>
    </div>
  );
}
