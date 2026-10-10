import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


const ThemeContext = createContext(null);


const THEME_STORAGE_KEY = "task-management-theme";


/* ============================================================
   GET INITIAL THEME
============================================================ */

const getInitialTheme = () => {

    const savedTheme = localStorage.getItem(
        THEME_STORAGE_KEY
    );

    if (
        savedTheme === "light" ||
        savedTheme === "dark"
    ) {
        return savedTheme;
    }

    return "light";
};


/* ============================================================
   THEME PROVIDER
============================================================ */

export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState(
        getInitialTheme
    );


    /* ========================================================
       APPLY THEME
    ======================================================== */

    useEffect(() => {

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        localStorage.setItem(
            THEME_STORAGE_KEY,
            theme
        );

    }, [theme]);


    /* ========================================================
       TOGGLE THEME
    ======================================================== */

    const toggleTheme = () => {

        setTheme((previousTheme) =>
            previousTheme === "light"
                ? "dark"
                : "light"
        );

    };


    return (

        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                toggleTheme
            }}
        >

            {children}

        </ThemeContext.Provider>

    );
};


/* ============================================================
   CUSTOM HOOK
============================================================ */

export const useTheme = () => {

    const context = useContext(
        ThemeContext
    );

    if (!context) {

        throw new Error(
            "useTheme must be used inside ThemeProvider."
        );

    }

    return context;

};


export default ThemeContext;