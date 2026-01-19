import "./formComponent.css";
export function LoginComponent(){
    return <section className="mainPage">
        <h2>Login</h2>
        <form className="formStyle">
            <label>
                Username:
                <input type="text" required />
            </label>
            <label>
                Password:
                <input type="password" required />
            </label>
            <button type="submit">Log In</button>

        </form>

    </section>
}
