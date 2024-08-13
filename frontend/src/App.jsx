import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
// import Calculator from "./components/Calculator";
import ShortPolling from "./components/ShortPolling";
import LongPolling from "./components/LongPolling";
import WebSocket from "./components/WebSocket";
import "./App.css";

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  return isHomePage ? (
    <nav>
      {/* <button onClick={() => navigate("/Calculator")}>Go to Calculator</button> */}
      <button onClick={() => navigate("/ShortPolling")}>ShortPolling</button>
      <button onClick={() => navigate("/LongPolling")}>LongPolling</button>
      <button onClick={() => navigate("/WebSocket")}>WebSocket</button>
    </nav>
  ) : null;
}

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          {/* <Route path="/Calculator" element={<Calculator />} /> */}
          <Route path="/ShortPolling" element={<ShortPolling />} />
          <Route path="/LongPolling" element={<LongPolling />} />
          <Route path="/WebSocket" element={<WebSocket />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
