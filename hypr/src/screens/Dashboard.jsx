import React from "react";
import SalesActivity from "../components/SalesActivity";
import ProductDetails from "../components/ProductDetails";
import ProductGrid from "../components/ProductGrid";
import Stats from "../components/Stats";
import ProductsTable from "../components/ProductsTable";
import Emergency from "../components/Emergency";
import Background from "../components/Background";
const Dashboard = () => {
  return (
    <div className="h-screen bg-[#081317]">
      <Stats />

      <div className="p-4">
        <ProductsTable />
        <Background />
      </div>
      {/* <div className='p-4'>
          <Emergency/>
        </div> */}
    </div>
  );
};

export default Dashboard;
