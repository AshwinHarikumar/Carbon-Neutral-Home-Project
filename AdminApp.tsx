
import React, { useState, useEffect } from 'react';
import LoginPage from './components/admin/LoginPage';
import DashboardPage from './components/admin/DashboardPage';
import { onAuthChange, logoutUser } from './services/firebaseService';
import { User } from 'firebase/auth';

const AdminApp: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthChange((firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            // The onAuthChange listener will handle setting user to null
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading Admin Panel...</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {user ? (
                <DashboardPage onLogout={handleLogout} />
            ) : (
                <LoginPage />
            )}
        </div>
    );
};

export default AdminApp;