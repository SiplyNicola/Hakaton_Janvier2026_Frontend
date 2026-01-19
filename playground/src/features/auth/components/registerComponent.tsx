import { useState } from 'react';
import { register } from '../services/auth-service';
import './formComponent.css';

interface RegisterProps {
    onSwitchToLogin?: () => void;
}

function RegisterComponent({ onSwitchToLogin }: RegisterProps) {
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');
    let [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            await register({
                username: username,
                password: password
            });

            alert("Account created successfully!");
            if (onSwitchToLogin) onSwitchToLogin();

        } catch (error: any) {
            alert("Error : " + error.message);
        }
    };

    return (
        <section className="mainPage">
            <h2>Register</h2>
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

                <label>
                    Confirm Password: 
                    <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                    />
                </label>

                <button type="submit">Register</button>
            </form>
            
            <p className="textParagraph">
                Already have an account ? <button className="linkBtn" onClick={onSwitchToLogin}>Log in</button>
            </p>
        </section>
    );
}

export default RegisterComponent;