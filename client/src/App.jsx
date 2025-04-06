import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import Login from './jsx/Login';
import Signin from './jsx/Signin';

function App() {
  return (
    <>
    <Router> 
      <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login/>} />
        <Route path="/signin" element={<Signin/>} />
      </Routes>
    </div>
    </Router>
  </>
  );
}

export default App;
