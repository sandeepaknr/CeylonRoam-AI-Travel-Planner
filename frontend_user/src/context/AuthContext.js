import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUserState(storedUser);
  }, []);

  // login
  const login = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUserState(data);
  };

  // logout
  const logout = () => {
    localStorage.removeItem("user");
    setUserState(null);
  };

  const setUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    setUserState(data);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
