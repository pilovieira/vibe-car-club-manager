import { createContext, useContext, useState, useEffect } from 'react';
import { mockService } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Simulating login by picking a user from mock data
    const login = (email) => {
        const members = mockService.getMembers();
        const foundUser = members.find(m => m.email === email);
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('currentUser', JSON.stringify(foundUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('currentUser');
    };

    const checkAuth = () => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
