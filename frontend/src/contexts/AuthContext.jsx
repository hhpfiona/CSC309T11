import React, { createContext, useContext, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const AuthContext = createContext(null);

/*
 * This provider should export a `user` context state that is 
 * set (to non-null) when:
 *     1. a hard reload happens while a user is logged in.
 *     2. the user just logged in.
 * `user` should be set to null when:
 *     1. a hard reload happens when no users are logged in.
 *     2. the user just logged out.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const fetchProfile = async (token) => {
        const res = await fetch(`${BACKEND_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("invalid‑token");
        const { user } = await res.json();
        setUser(user);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          fetchProfile(token).catch(() => {
            localStorage.removeItem("token");
            setUser(null);
          });
        }
    }, []);

    /*
     * Logout the currently authenticated user.
     *
     * @remarks This function will always navigate to "/".
     */
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    /**
     * Login a user with their credentials.
     *
     * @remarks Upon success, navigates to "/profile". 
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {string} - Upon failure, Returns an error message.
     */
    const login = async (username, password) => {
        const res = await fetch(`${BACKEND_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
    
        if (!res.ok) {
          const { message } = await res.json();
          return message;                 
        }
    
        const { token } = await res.json();
        localStorage.setItem("token", token);
        await fetchProfile(token);
        navigate("/profile");
    };

    /**
     * Registers a new user. 
     * 
     * @remarks Upon success, navigates to "/".
     * @param {Object} userData - The data of the user to register.
     * @returns {string} - Upon failure, returns an error message.
     */
    const register = async (data) => {
        const res = await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
    
        if (!res.ok) {
          const { message } = await res.json();
          return message;
        }
    
        navigate("/success");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
