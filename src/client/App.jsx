import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeContextProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import "./App.css";

// El tema ahora se gestiona en ThemeContext

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <Layout>
          <Outlet />
        </Layout>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
