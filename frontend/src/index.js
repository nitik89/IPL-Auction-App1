import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from "./context/UserProvider";
import { SocketProvider } from "./context/SocketProvider";
import { TeamProvider } from "./context/TeamProvider";
import customTheme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <TeamProvider>
        <SocketProvider>
          <ChakraProvider>
            <App />
          </ChakraProvider>
        </SocketProvider>
      </TeamProvider>
    </UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
