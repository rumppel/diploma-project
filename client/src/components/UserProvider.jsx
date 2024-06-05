// UserProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const UserProvider = ({ children }) => {
  const [userData, setUser] = useState(null);

  useEffect(() => {
    if (!userData) {
      axios.get(`${backendUrl}/getsession`, { withCredentials: true })
        .then(result => {
          const userData = result.data;
          setUser(userData);
        })
        .catch(err => console.log(err));
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
