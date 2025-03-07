import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './MainNavigation.css';

const MainNavigation = () => {
  const auth = useContext(AuthContext);

  return (
    <header className="main-header">
      <h1 className="main-title">
        <Link to="/">My Places</Link>
      </h1>
      <nav className="nav-links">
        <ul>
          <li>
            <Link to="/">ALL PLACES</Link>
          </li>
          {auth.isLoggedIn && (
            <li>
              <Link to="/places/new">ADD PLACE</Link>
            </li>
          )}
          {!auth.isLoggedIn && (
            <li>
              <Link to="/auth">LOGIN</Link>
            </li>
          )}
          {auth.isLoggedIn && (
            <li>
              <button onClick={auth.logout}>LOGOUT</button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;