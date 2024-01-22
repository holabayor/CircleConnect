import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Success from "./pages/Auth/Success";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import Test from "./pages/Test";
import Circle from "./pages/Circle";
import Discover from "./pages/Discover";
import SocketContext from "./contexts/SocketContext";

// TODO: Implement Lazy loading
const App = () => {
	const User = useSelector((state) => state.user);

	return (
		<div className="max-w-screen-2xl mx-auto">
			<SocketContext>
				<Routes>
					<Route path="/" element={<Index />} />
					<Route path="/discover" element={<Discover />} />
					<Route path="/circle/:id" element={<Circle />} />
					<Route path="/test" element={<Test />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/auth/success" element={<Success />} />
				</Routes>
			</SocketContext>
		</div>
	);
};

export default App;
