import { useEffect, useState } from 'react';
import { LoginComponent } from "./features/auth/components/loginComponent";
import RegisterComponent from "./features/auth/components/registerComponent";
import { Dashboard } from './features/dashboard/component/dashboard';
import { useCookies } from 'react-cookie';


export default function App() {
    // State to know which screen to display: 'login', 'register', or 'dashboard'
    const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
    // Storage of the logged-in user
    const [user, setUser] = useState<{ id: number; username: string } | null>(null);
    const [cookies, setCookies, removeCookies] = useCookies(["auth"]);

    // Function called upon a successful login
    const handleLoginSuccess = (userData: any) => {
        setUser(userData);
        setCookies("auth", userData);
        setView('dashboard'); // Switching to the Dashboard view
    };

    const handleLogout = () => {
        setUser(null);
        removeCookies("auth");
        setView('login');
    };

    useEffect(() => {
        if(cookies.auth) {
            setUser(cookies.auth)
            setView("dashboard");
        } else if(view !== "register") {
            setView("login");
        }
    })

    return (
        <div className="app">
            {/* Conditional rendering based on the current view */}
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