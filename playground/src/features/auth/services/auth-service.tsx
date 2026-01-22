import type { RegisterCommand } from "./commands/register-command";
import type { LoginCommand } from "./commands/login-command";
import type { RegisterResponse, LoginResponse } from "../types/auth-types";


const API_URL = import.meta.env.VITE_API_URL; 

export const register: (command: RegisterCommand) => Promise<RegisterResponse> = async (command: RegisterCommand) => {
    
    // sends a POST request to /users
    const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });

    if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Unable to register`);
    }

    return await response.json();
}
//send POST request /login
export const login: (command: LoginCommand) => Promise<LoginResponse> = async (command: LoginCommand) => {
    
    const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    });

    if (!response.ok) {
        throw new Error(`Erreur ${response.status}: Connection failure`);
    }

    return await response.json();
}