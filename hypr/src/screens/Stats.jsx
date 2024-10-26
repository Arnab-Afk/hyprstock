// import React from "react";
import LineChart from "../charts/LineChart";
import PiChart from "../charts/PiChart";

const StatsScreen = () => {
  return (
    <div className="h-screen ">
      <PiChart />
      <LineChart />
    </div>
  );
};

export default StatsScreen;
