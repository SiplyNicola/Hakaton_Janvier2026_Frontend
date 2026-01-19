
import { LoginComponent } from "./features/auth/components/loginComponent";
import RegisterComponent from "./features/auth/components/registerComponent";
import NoteFolderManagerComponent from "./features/notes/components/NoteFolderManagerComponent";

export default function App() {
	return (
		<div className="app">
			{/* <LoginComponent /> */}
      <NoteFolderManagerComponent />
		</div>
	);
}