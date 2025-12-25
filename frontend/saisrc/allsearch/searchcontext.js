import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        globalSearch,
        setGlobalSearch // Include globalSearch in the context value
      }}>
      {children}
    </SearchContext.Provider>
  );
};
