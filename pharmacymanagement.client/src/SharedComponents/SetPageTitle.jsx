import { createContext, useState, useContext } from 'react';

const PageTitleContext = createContext();

export const PageTitleProvider = ({ children }) => {
    const [pageTitle, setPageTitle] = useState('Default Title');

    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
};

export const usePageTitle = () => useContext(PageTitleContext);