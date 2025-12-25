// UserContext.js
import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInInstitute, setLoggedInInstitute] = useState(null);

  return (
    <UserContext.Provider value={{ loggedInUser, loggedInInstitute, setLoggedInUser, setLoggedInInstitute }}>
      {children}
    </UserContext.Provider>
  );
};
