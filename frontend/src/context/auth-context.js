import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  token: null,
  userName: null,
  login: () => {},
  logout: () => {}
});

const AuthProvider = (props) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  
  const login = useCallback((uid, token, name) => {
    setToken(token);
    setUserId(uid);
    setUserName(name);
    
    // Store auth data in localStorage
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token,
        userName: name
      })
    );
  }, []);
  
  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setUserName(null);
    localStorage.removeItem('userData');
  }, []);
  
  // Auto-login if token is stored
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token) {
      login(storedData.userId, storedData.token, storedData.userName);
    }
  }, [login]);
  
  const contextValue = {
    isLoggedIn: !!token,
    token: token,
    userId: userId,
    userName: userName,
    login: login,
    logout: logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;