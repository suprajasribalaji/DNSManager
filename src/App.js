import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
import { Spin } from 'antd';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import SignUp from './pages/SignUp.tsx';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userAuth) => {
      if (userAuth) {
        setUser(true);
        setLoading(false);
      } else {
        setUser(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthRoute element={<Login />} />} />
        <Route path="/signup" element={<AuthRoute element={<SignUp />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      </Routes>
    </Router>
  );

  function AuthRoute({ element }) {
    return user ? <Navigate to="/dashboard" /> : element;
  }

  function ProtectedRoute({ element }) {
    return user ? element : <Navigate to="/" />;
  }
}

export default App;
