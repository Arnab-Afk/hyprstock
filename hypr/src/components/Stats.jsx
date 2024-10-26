import { useState, useEffect } from 'react';

export default function Stats() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem('user'));
  const locality = userData?.locality;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`https://hyprstock.arnabbhowmik019.workers.dev/api/forecasts/${locality}/top-changes/analytics`, {
        });
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    if (locality) {
      fetchAnalytics();
    }
  }, [locality, token]);

  const stats = analyticsData ? [
    { name: 'Total Products', value: analyticsData.analytics.total_products },
    { name: 'Average Change', value: `${analyticsData.analytics.average_change}%` },
    { name: 'Total Predicted Orders', value: analyticsData.analytics.total_predicted_orders },
    { name: 'Volatility', value: analyticsData.analytics.insights.volatility },
  ] : [];

  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          
        </div>

        {/* Top Changes Section */}
        {analyticsData && analyticsData.top_changes && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">Top Changes</h2>
            <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3">
              {analyticsData.top_changes.map((change, index) => (
                <div key={index} className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
                  <p className="text-sm font-medium leading-6 text-gray-400">{change.product_name}</p>
                  <p className="mt-2 flex items-baseline gap-x-2">
                    <span className="text-4xl font-semibold tracking-tight text-white">
                      {change.percentage_change}%
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}