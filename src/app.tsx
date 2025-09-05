import React from 'react';

interface OwnProps {
    children: React.ReactNode;
}

const App: React.FC<OwnProps> = ({ children }) => {
    return <>{children}</>;
};

export default App
