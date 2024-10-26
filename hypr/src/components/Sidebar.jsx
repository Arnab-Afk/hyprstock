import { NavLink, Link } from "react-router-dom";
import {
  Home,
  StatusUp,
  LogoutCurve,
  Map,
  Location,
  ElementPlus,
} from "iconsax-react";

const routes = [
  { name: "Home", to: "/", icon: <Home size="28" /> },
  { name: "Statistics", to: "/stats", icon: <StatusUp size="28" /> },
  { name: "Update Location", to: "/locality", icon: <Location size="28" /> },
  { name: "Map", to: "/maps", icon: <Map size="28" /> },
  { name: "New Product", to: "/addProduct", icon: <ElementPlus size="28" /> },
];

export default function Sidebar() {
  return (
    <div className="fixed h-screen w-1/6 p-4 flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 py-12 bg-card rounded-xl font-fira bg-primary/30">
        <div className="flex gap-3 justify-center">
          {/* <img src={EventioLogo} alt="Eventio Logo" className="h-12" /> */}
          <div className="flex flex-col justify-between  font-marcellus">
            <p className="text-primary text-2xl text center font-semibold">
              HyperStocks
            </p>
            <p className="text-foreground text-sm italic">By Team-LGTM</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <NavLink key={route.to} to={route.to} className="text-md">
              {({ isActive }) => (
                <div
                  className={`flex items-center gap-2 p-2 ${isActive ? "text-background bg-foreground/80 rounded-xl" : "text-foreground"}`}
                >
                  {route.icon}
                  {route.name}
                </div>
              )}
            </NavLink>
          ))}
        </div>
        <div className="text-foreground flex items-center gap-2 mt-6">
          <LogoutCurve size="28" />
          <Link to="/signin">Logout</Link>
        </div>
      </div>
    </div>
  );
}
