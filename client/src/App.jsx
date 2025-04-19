import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import ProtectedRoute from './components/protectedRoute';
import Login from './jsx/Login';
import Signin from './jsx/Signin';
import Home from './jsx/Home';
import Viewer from './jsx/Viewer';

function App() {
  return (
    <>
    <Router> 
      <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login/>} />
        <Route path="/signin" element={<Signin/>} />
        {/* Rutas privadas */}
        <Route path="/*" element={
            <ProtectedRoute>
              <>
                <Routes>
                  <Route path="/home" element={<Home/>} />
                  <Route path="/viewer" element={<Viewer/>} />
                </Routes>
              </>
            </ProtectedRoute>
          } />
        
      </Routes>
    </div>
    </Router>
  </>
  );
}

export default App;
