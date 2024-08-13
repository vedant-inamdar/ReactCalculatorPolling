import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./Calculator.css";
import LogTable from "./LogTable";

const WebSocket = () => {
  const [expression, setExpression] = useState("");
  const [logs, setLogs] = useState([]);

  const socket = io("http://localhost:8080"); // Ensure this matches your server's address

  useEffect(() => {
    // Listen for new logs from the server
    socket.on("log", (log) => {
      setLogs((prevLogs) => [log, ...prevLogs]);
    });

    // Fetch the initial logs
    fetchLogs();

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, []);

  const handleClick = (value) => {
    if (!isNaN(value) || value === ".") {
      setExpression((prev) => prev + value);
    } else if (value === "AC") {
      setExpression("");
    } else if (value === "DEL") {
      setExpression((prev) => prev.slice(0, -1));
    } else if (value === "=") {
      evaluate();
    } else {
      if (expression && !isNaN(expression.slice(-1))) {
        setExpression((prev) => prev + value);
      }
    }
  };

  const evaluate = async () => {
    try {
      const res = eval(expression); // Evaluate expression
      setExpression(res.toString()); // Update expression to display the result
      await axios.post("http://localhost:8080/api/logs", {
        expression: expression,
      });
    } catch (error) {
      setExpression("Error");
      await axios.post("http://localhost:8080/api/logs", {
        expression: expression,
        isValid: false,
        output: null,
      });
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  return (
    <div className="holder">
      <div className="calculator">
        <div className="display">
          <input
            type="text"
            className="display-input"
            value={expression}
            readOnly
          />
        </div>
        <div className="buttons">
          <button className="button operator" onClick={() => handleClick("AC")}>
            AC
          </button>
          <button className="button operator" onClick={() => handleClick("%")}>
            %
          </button>
          <button
            className="button operator"
            onClick={() => handleClick("DEL")}
          >
            <span className="material-symbols-outlined">backspace</span>
          </button>
          <button className="button operator" onClick={() => handleClick("/")}>
            /
          </button>
          <button className="button" onClick={() => handleClick("7")}>
            7
          </button>
          <button className="button" onClick={() => handleClick("8")}>
            8
          </button>
          <button className="button" onClick={() => handleClick("9")}>
            9
          </button>
          <button className="button operator" onClick={() => handleClick("*")}>
            *
          </button>
          <button className="button" onClick={() => handleClick("4")}>
            4
          </button>
          <button className="button" onClick={() => handleClick("5")}>
            5
          </button>
          <button className="button" onClick={() => handleClick("6")}>
            6
          </button>
          <button className="button operator" onClick={() => handleClick("-")}>
            -
          </button>
          <button className="button" onClick={() => handleClick("1")}>
            1
          </button>
          <button className="button" onClick={() => handleClick("2")}>
            2
          </button>
          <button className="button" onClick={() => handleClick("3")}>
            3
          </button>
          <button className="button operator" onClick={() => handleClick("+")}>
            +
          </button>
          <button className="button" onClick={() => handleClick("00")}>
            00
          </button>
          <button className="button" onClick={() => handleClick("0")}>
            0
          </button>
          <button className="button" onClick={() => handleClick(".")}>
            .
          </button>
          <button
            className="button operator equal"
            onClick={() => handleClick("=")}
          >
            =
          </button>
        </div>
      </div>
      <div className="logtable">
        <LogTable logs={logs} />
      </div>
    </div>
  );
};

export default WebSocket;
