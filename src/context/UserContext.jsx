import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('kissanUserToken') || '');
  const [loading, setLoading] = useState(true);

  // Restore user from token on load
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
        const res = await fetch(`${baseUrl}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('kissanUserToken');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Error restoring user session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('kissanUserToken', userToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('kissanUserToken');
  };

  return (
    <UserContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
