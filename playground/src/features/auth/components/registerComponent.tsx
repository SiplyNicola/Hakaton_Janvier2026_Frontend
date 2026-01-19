import './formComponent.css'

function RegisterComponent() {
   
    return (
        <section className="mainPage">
            <h2>Register your account</h2>
            <form className="formStyle">
                <label>
                    Username: 
                    <input type="text" required />
                </label>

                <label>
                    Password: 
                    <input type="password" required />
                </label>

                <label>
                    Confirm Password: 
                    <input type="password"required />
                </label>

                <button type="submit">Sign Up</button>
            </form>
        </section>
    );
}

export default RegisterComponent;