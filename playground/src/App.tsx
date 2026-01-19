import { useState } from 'react';
import { LoginComponent } from "./features/auth/components/loginComponent";
import RegisterComponent from "./features/auth/components/registerComponent";
import { Dashboard } from './features/dashboard/component/dashboard';


export default function App() {
    // État pour savoir quel écran afficher : 'login', 'register' ou 'dashboard'
    const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
    // Stockage de l'utilisateur connecté
    const [user, setUser] = useState<{ id: number; username: string } | null>(null);

    // Fonction appelée lors d'une connexion réussie
    const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        setView('dashboard'); // On bascule vers le Dashboard [cite: 63, 65]
    };

    const handleLogout = () => {
        setUser(null);
        setView('login');
    };

    return (
        <div className="app">
            {/* Rendu conditionnel selon la vue actuelle */}
            {view === 'login' && (
                <LoginComponent 
                    onLoginSuccess={handleLoginSuccess} 
                    onSwitchToRegister={() => setView('register')} 
                />
            )}

            {view === 'register' && (
                <RegisterComponent 
                    onSwitchToLogin={() => setView('login')} 
                />
            )}

            {view === 'dashboard' && user && (
                <Dashboard 
                    user={user} 
                    onLogout={handleLogout} 
                />
            )}
        </div>
    );
}