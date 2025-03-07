import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Places from './pages/Places';
import NewPlace from './pages/NewPlace';
import PlaceDetail from './pages/PlaceDetail';
import EditPlace from './pages/EditPlace'; // Add this import
import Auth from './pages/Auth';

// Components
import MainNavigation from './components/Navigation/MainNavigation';

// Context
import { AuthContext } from './context/auth-context';

function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token) {
      setToken(storedData.token);
      setUserId(storedData.userId);
    }
  }, []);
  
  const login = (uid, token) => {
    setToken(token);
    setUserId(uid);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token
      })
    );
  };
  
  const logout = () => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        login: login,
        logout: logout
      }}
    >
      <BrowserRouter>
        <MainNavigation />
        <main>
          <Routes>
            <Route path="/" element={<Places />} />
            <Route path="/places/:placeId" element={<PlaceDetail />} />
            {token && <Route path="/places/new" element={<NewPlace />} />}
            {token && <Route path="/places/:placeId/edit" element={<EditPlace />} />} {/* Add this route */}
            {!token && <Route path="/auth" element={<Auth />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;