import { useEffect, useState } from "react";
import { UserDataContext } from "../contexts/userContext";
import { Navigate, Outlet } from "react-router-dom";

export default function Protected() {
  const [userData, setUserData] = useState();
  const [isUserCompleted, setIsUserCompleted] = useState(null);

  useEffect(() => {
    const localUserData = localStorage.getItem("user");
    console.log(localUserData);
    // Check if localUserData exists and parse it
    if (localUserData) {
      try {
        const user = JSON.parse(localUserData);
        // Set isUserCompleted based on locality check
        setIsUserCompleted(user.locality !== null);
        console.log(user.locality === null);
        setUserData(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    console.log(userData, isUserCompleted);
  }, [userData, isUserCompleted]);

  if (userData === null) return <Navigate to="/signin" />;

  if (userData === undefined || isUserCompleted === null) {
    return <div>Loading...</div>;
  }

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      {isUserCompleted ? <Outlet /> : <Navigate to="/locality" />}
    </UserDataContext.Provider>
  );
}
