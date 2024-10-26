import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Signin from "./screens/signin";
import Callback from "./components/callback";
import Locality from "./screens/Loclity";
import Dashboard from "./screens/Dashboard";
import AddProduct from "./screens/AddProduct";
import MapsScreen from "./screens/MapsScreen"
export default function App() {
  // Initialize user data
  let isUserCompleted = false;
  const userData = localStorage.getItem("user");
  
  // Check if userData exists and parse it
  if (userData) {
    try {
      const user = JSON.parse(userData);
      // Set isUserCompleted based on locality check
      isUserCompleted = user.locality === null;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<Signin/>} />
        <Route path="/callback" element={<Callback/>} />
        <Route 
          path="/home" 
          element={isUserCompleted ? 
            <Locality/> : 
            <Dashboard/>
          } 
        />
        <Route path="locality" element={<Locality/>} />
        <Route path="/maps" element={<MapsScreen/>} />
        <Route path="/addProduct" element={<AddProduct/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/profile" element={<h1>Profile Page</h1>} />
        <Route path="/settings" element={<h1>Settings Page</h1>} />
        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </Router>
  )
}