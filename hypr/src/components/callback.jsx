import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Use the navigate function

  // Function to extract token from URL parameters
  const getTokenFromParams = () => {
    const params = new URLSearchParams(location.search);
    return params.get("token"); // Assuming the token is passed as a query parameter named 'token'
  };

  // Function to send token to backend
  const sendTokenToBackend = async (token) => {
    const url = "https://hyprstock.arnabbhowmik019.workers.dev/auth/google";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleToken: token }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response from backend:", data);
      console.log(data.token);
      localStorage.setItem("token", data.token);
      const userData = await axios.get(
        "https://hyprstock.arnabbhowmik019.workers.dev/api/user",
        {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        },
      );
      console.log(userData);
      // user data in local storage
      localStorage.setItem("user", JSON.stringify(userData.data));
      // Navigate to home
      navigate("/"); // Use navigate instead of window.location
      return data;
      // Handle the response as needed
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    const token = getTokenFromParams();
    if (token) {
      sendTokenToBackend(token); // No need to assign to a variable here
    } else {
      console.error("No token found in URL parameters");
    }
  }, [location]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Processing Token...</h1>
      <p className="mt-4 text-gray-600">
        Please wait while we process your request.
      </p>
    </div>
  );
};

export default Callback;
