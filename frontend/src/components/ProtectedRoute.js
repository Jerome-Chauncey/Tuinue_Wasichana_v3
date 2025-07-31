import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../App";

const API_URL = "https://tuinue-wasichana-v3.onrender.com";

function ProtectedRoute({ children, allowedRole }) {
  const { auth, updateAuth } = useContext(AuthContext);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!auth.token) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/verify-token`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (response.data.valid) {
          setIsValid(true);
        } else {
          throw new Error(response.data.message || "Invalid token");
        }
      } catch (err) {
        setIsValid(false);
        toast.error(err.response?.data?.message || "Session expired. Please log in again.");
        updateAuth(null, null, null, null);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [auth.token, updateAuth]);

  if (isValidating) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (!auth.token || isValid === false) {
    return <Navigate to="/auth" />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    toast.warn(`Access denied. You are not a ${allowedRole}.`, {
      position: "top-right",
    });
    return <Navigate to={auth.role === "donor" ? "/donor" : 
                        auth.role === "charity" ? "/charity" : 
                        auth.role === "admin" ? "/admin" : "/"} />;
  }

  return children;
}

export default ProtectedRoute;