import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);

    const [user, setUser] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);


    /* =====================================================
       RESTORE LOGIN SESSION
    ===================================================== */

    useEffect(() => {

        const storedToken =
            localStorage.getItem("token");

        const storedUser =
            localStorage.getItem("user");


        if (storedToken && storedUser) {

            try {

                const parsedUser =
                    JSON.parse(storedUser);


                setToken(storedToken);

                setUser(parsedUser);

                setIsAuthenticated(true);

            } catch (error) {

                console.error(
                    "Failed to restore authentication:",
                    error
                );

                localStorage.removeItem("token");

                localStorage.removeItem("user");

            }

        }

    }, []);


    /* =====================================================
       LOGIN
    ===================================================== */

    const login = (newToken, newUser) => {

        if (!newToken) {

            console.error(
                "Login failed: token is missing."
            );

            return;

        }


        if (!newUser) {

            console.error(
                "Login failed: user information is missing."
            );

            return;

        }


        /* Save in React state */

        setToken(newToken);

        setUser(newUser);

        setIsAuthenticated(true);


        /* Save in browser */

        localStorage.setItem(
            "token",
            newToken
        );

        localStorage.setItem(
            "user",
            JSON.stringify(newUser)
        );

    };


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logout = () => {

        setToken(null);

        setUser(null);

        setIsAuthenticated(false);


        localStorage.removeItem("token");

        localStorage.removeItem("user");

    };


    return (

        <AuthContext.Provider
            value={{
                token,
                user,
                isAuthenticated,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider."
        );

    }


    return context;
};