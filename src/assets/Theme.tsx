import {createTheme} from "@material-ui/core";

export const theme = createTheme({
    palette: {
        type: 'dark',
        text: {
            primary: '#D8D8D8',
            secondary: '#D8D8D8',
        },
        primary: {
            main: '#b30000',
            contrastText: '#D8D8D8',
        },
        secondary: {
            main: '#000000',
        },
    },
    typography: {
        fontSize: 12,
        fontFamily: `"Special Elite", "Raleway", "Open Sans", "Roboto", sans-serif`,
        h1: {
            fontFamily: `""Special Elite", "sans-serif"`,
        },
        h2: {
            fontFamily: `"Special Elite", "sans-serif"`,
        },
        h3: {
            fontFamily: `"Special Elite", "sans-serif"`,
        },
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 321,
            md: 426,
            lg: 769,
            xl: 1441,
        },
    }
});