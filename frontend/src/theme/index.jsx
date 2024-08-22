import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    // Set the background color to dark
    background: "#1A202C",
  },
  styles: {
    global: {
      // Apply the dark background color to all components
      body: {
        bg: "background",
      },
    },
  },
});

export default customTheme;
