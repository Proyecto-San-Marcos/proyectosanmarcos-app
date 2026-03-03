import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const login = (credentials) => {
        // Simulated DB fetch. In a real app we'd validate credentials.username/password
        // and fetch the role from the backend.
        // For this minimal setup, we force the role to Presidencia to show all features.
        setUser({
            name: credentials.username || 'Administrador',
            role: 'Presidencia'
        });
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
