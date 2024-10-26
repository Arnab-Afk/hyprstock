import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Signin from "./screens/signin";
import Callback from "./components/callback";
import Locality from "./screens/Loclity";
import Dashboard from "./screens/Dashboard";
import AddProduct from "./screens/AddProduct";
import MapsScreen from "./screens/MapsScreen";
import Stats from "./screens/Stats";

import Protected from "./layouts/Protected";
import SidebarLayout from "./layouts/SidebarLayout";

export default function App() {
  // Initialize user data
  return (
    <Router>
      <Routes>
        <Route element={<Protected />}>
          <Route element={<SidebarLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="/addProduct" element={<AddProduct />} />
            <Route path="/locality" element={<Locality />} />
            <Route path="/profile" element={<h1>Profile Page</h1>} />
            <Route path="/settings" element={<h1>Settings Page</h1>} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
            <Route path="/maps" element={<MapsScreen />} />
            <Route path="/stats" element={<Stats />} />
          </Route>
        </Route>
        <Route path="/signin" element={<Signin />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="*" element={<h1>404 Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}
