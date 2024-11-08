// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import DashboardPage from "./page/DashboardPage";
import { RetentionPage } from "./page/RetentionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage />}></Route>
        <Route exact path="/dashboard" element={<DashboardPage />}></Route>
        <Route exact path="/retention-page" element={<RetentionPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
