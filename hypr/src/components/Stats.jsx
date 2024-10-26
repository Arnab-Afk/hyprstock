import { useState, useEffect } from "react";

export default function Stats() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user"));
  const locality = userData?.locality;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `https://hyprstock.arnabbhowmik019.workers.dev/api/forecasts/${locality}/top-changes/analytics`,
          {},
        );
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    if (locality) {
      fetchAnalytics();
    }
  }, [locality, token]);

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsData && (
            <>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-sm font-medium leading-6 text-gray-400">
                  Total Products
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                  {analyticsData.analytics.total_products}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-sm font-medium leading-6 text-gray-400">
                  Average Change
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                  {analyticsData.analytics.average_change}%
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-sm font-medium leading-6 text-gray-400">
                  Total Predicted Orders
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                  {analyticsData.analytics.total_predicted_orders}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                <p className="text-sm font-medium leading-6 text-gray-400">
                  Volatility
                </p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                  {analyticsData.analytics.insights.volatility}
                </p>
              </div>
            </>
          )}
        </div> */}

        {analyticsData && analyticsData.top_changes && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Top Changes
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {analyticsData.top_changes.map((change, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg shadow-md"
                >
                  <p className="text-sm font-medium leading-6 text-gray-400">
                    {change.product_name}
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                    {change.percentage_change}%
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
