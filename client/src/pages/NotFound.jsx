import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-black">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <p className="mb-4 text-2xl text-gray-700">
          Oops! Page not found
        </p>

        <Link
          to="/"
          className="text-black underline hover:text-gray-700"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
