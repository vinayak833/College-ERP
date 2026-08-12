import React from "react";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "./LoginPage";

export function ProtectedRoute({ children, students = [], facultyList = [] }) {
  const { isLoggedIn, login, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-600">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold">Verifying ERP Session...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={(res) => {
          login(res.token, res.user);
        }}
        students={students}
        facultyList={facultyList}
      />
    );
  }

  return <>{children}</>;
}
