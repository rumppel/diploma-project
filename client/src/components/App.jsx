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
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function App() {

  return (
    
    <div style={{marginTop : '-3.5rem'}}>
      <BrowserRouter >
        <Routes>
          <Route path="/" element ={<Header/>} />
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
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
