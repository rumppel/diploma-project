import Home from './Home';
import Login from './Login';
import Register from './Register';
import CreateSession from './CreateSession';
import Header from './Header';
import Profile from './Profile';
import Moderate from './Moderate';
import UkraineMap from './UkraineMap';
import Statistics from './Statistics';
import HowToHelp from './HowToHelp';
import Sitemap from './Sitemap';
import {BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

function App() {
  
  return (
    
    <div style={{marginTop : '-3.5rem'}}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/register" element ={<Register/>} />
          <Route path="/create-session" element ={<CreateSession/>} />
          <Route path="/register" element ={<Register/>} />
          <Route path="/login" element ={<Login />} />
          <Route path="/home" element ={<Home/>} />
          <Route path="/profile" element ={<Profile/>} />
          <Route path="/moderate" element ={<Moderate/>} />
          <Route path="/map" element ={<UkraineMap/>} />
          <Route path="/statistics" element ={<Statistics/>} />
          <Route path="/howtohelp" element ={<HowToHelp/>} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
