import { Outlet, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RFQForm from "./pages/RFQForm";

function Layout() {
  return (
    <div className="h-screen flex flex-col">

      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">

        <Sidebar />

        <main
          className="
            flex-1
            overflow-y-auto
            bg-slate-50
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}

function App() {
  return (
    <>
      <Routes>

        <Route path="/" element={<Layout />}>

          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="vendors"
            element={<Vendors />}
          />

          <Route
            path="/rfq-form"
            element={<RFQForm />}
          />
        </Route>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


      </Routes>

      <ToastContainer />

    </>
  );
}

export default App