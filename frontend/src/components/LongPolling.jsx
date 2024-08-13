import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Calculator.css";
import LogTable from "./LogTable";

const LongPolling = () => {
  const [expression, setExpression] = useState("");
  const [logs, setLogs] = useState([]);
  const [counter, setCounter] = useState(0);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setFetchingLogs(true);
    setError("");

    try {
      const response = await axios.get(
        "http://localhost:8080/api/logs/long-poll"
      );

      let responseData = response.data;

      // Check if the response is a string (concatenated JSON objects)
      if (typeof responseData === "string") {
        // Split the string into individual JSON objects using a regex pattern
        const logsArray = responseData
          .match(/{[^}]+}/g)
          .map((log) => JSON.parse(log));

        if (Array.isArray(logsArray)) {
          // Combine and sort logs
          const combinedLogs = [...logs, ...logsArray];
          const sortedLogs = combinedLogs.sort(
            (a, b) => new Date(a.createdOn) - new Date(b.createdOn)
          );
          const latestLogs = sortedLogs.slice(-5); // Keep only the latest 5 logs
          setLogs(latestLogs);
        } else {
          console.error("Unexpected response format:", responseData);
          setError("Unexpected response format");
        }
      } else {
        console.error("Unexpected response format:", responseData);
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching logs");
      console.error("Error fetching logs:", error);
    } finally {
      setFetchingLogs(false);
    }
  };

  const sendLogRequest = async (isValid, output) => {
    try {
      await axios.post("http://localhost:8080/api/logs", {
        expression,
        isValid,
        output,
      });
    } catch (error) {
      console.error("Error sending log request:", error);
    }
  };

  const evaluate = async () => {
    try {
      const result = eval(expression); // Be cautious with eval
      setExpression(result.toString());

      // Update counter and check if we need to send the POST request
      setCounter((prevCounter) => {
        const newCounter = prevCounter + 1;
        if (newCounter % 5 === 0) {
          sendLogRequest(true, result); // Send POST request after every 5 evaluations
          fetchLogs(); // Fetch logs immediately after reaching a multiple of 5
        } else {
          sendLogRequest(true, result);
        }
        return newCounter;
      });
    } catch (error) {
      console.error("Evaluation error:", error);
      setExpression("Error");

      // Update counter and check if we need to send the POST request
      setCounter((prevCounter) => {
        const newCounter = prevCounter + 1;
        if (newCounter % 5 === 0) {
          sendLogRequest(false, null); // Send POST request after every 5 evaluations
          fetchLogs(); // Fetch logs immediately after reaching a multiple of 5
        } else {
          sendLogRequest(false, null);
        }
        return newCounter;
      });
    }
  };

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
        {error && <div className="error">{error}</div>}
        {fetchingLogs && <div className="loading">Fetching logs...</div>}
      </div>
    </div>
  );
};

export default LongPolling;
