import { useState } from 'react';
import { login } from '../services/auth-service';
import "./formComponent.css";

interface LoginProps {
    onLoginSuccess: (user: any) => void;
    onSwitchToRegister?: () => void;
}

export function LoginComponent({ onLoginSuccess, onSwitchToRegister }: LoginProps) {

    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); 
        try {
            const userResponse = await login({ 
                username: username, 
                password: password 
            });
            onLoginSuccess(userResponse);
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <section className="mainPage">
            
            <h2>Login</h2>
            <form className="formStyle" onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </label>
                <label>
                    Password:
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </label>
                <button type="submit">log in</button>
            </form>

            <p className="textParagraph">
                No account ? <button className="linkBtn" onClick={onSwitchToRegister}>Create one</button>
            </p>
        </section>
    );
}