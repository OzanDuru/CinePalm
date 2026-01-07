import colors from "./colors";
import spacing from "./spacing";
import typography from "./typography";

const theme = {
  colors,
  spacing,
  typography,
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
  },
  shadow: {
    soft: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  },
};

export default theme;
