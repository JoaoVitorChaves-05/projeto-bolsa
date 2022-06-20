import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./Screens/Home.js"
import SignIn from "./Screens/SignIn.js"
import SignUp from "./Screens/SignUp.js"
import Profile from "./Screens/Profile.js"
import Search from "./Screens/Search.js"
import Place from './Screens/Place';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<SignIn />} path="/SignIn" />
        <Route element={<SignUp />} path="/SignUp" />
        <Route element={<Profile />} path="/Profile" />
        <Route element={<Search />} path="/Search" />
        <Route element={<Place />} path="/Place" />
    </Routes>
  </BrowserRouter>
);