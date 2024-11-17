import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from "./context/UserProvider";
import { SocketProvider } from "./context/SocketProvider";
import { TeamProvider } from "./context/TeamProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <TeamProvider>
        <SocketProvider>
          <ChakraProvider>
            <Box
              bg="gray.800"
              color="white"
              minHeight="100vh"
              boxShadow="inset 0 0 100px rgba(0, 0, 0, 0.7)"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              p={5}
            >
              <App />
            </Box>
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
