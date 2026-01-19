import { useState } from "react";
import { LoginComponent } from "./features/auth/components/loginComponent";
import RegisterComponent from "./features/auth/components/registerComponent";
import { HomeComponent } from "./features/notes/components/HomeComponent"; // Ton écran principal

export default function App() {
    const [user, setUser] = useState<any>(null); 
    const [isRegistering, setIsRegistering] = useState(false);

    if (user) {
        return <HomeComponent />;
    }

    
    return (
        <div className="app">
            {isRegistering ? (
                <RegisterComponent onSwitchToLogin={() => setIsRegistering(false)} />
            ) : (
                <LoginComponent 
                    onLoginSuccess={(userData) => setUser(userData)} 
                    onSwitchToRegister={() => setIsRegistering(true)}
                />
            )}
        </div>
    );
}