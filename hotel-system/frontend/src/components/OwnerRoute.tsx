import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";

type OwnerRouteProps = {
  children: ReactElement;
};

export const OwnerRoute = ({ children }: OwnerRouteProps) => {
  const token = localStorage.getItem("authToken");
  const raw = localStorage.getItem("authUser");

  if (!token || !raw) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(raw) as { role?: string };
    if (user.role !== "owner") {
      return <Navigate to="/" replace />;
    }
  } catch {
    return <Navigate to="/" replace />;
  }

  return children;
};
