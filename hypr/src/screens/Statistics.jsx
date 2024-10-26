// import React from "react";
import LineChart from "../charts/LineChart";
import PiChart from "../charts/PiChart";

const StatsScreen = () => {
  return (
    <div className="h-screen ">
      <LineChart />
      <PiChart />
    </div>
  );
};

export default StatsScreen;
