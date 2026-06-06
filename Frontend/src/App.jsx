import { Outlet, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Vendors from "./pages/Vendors";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RFQForm from "./pages/RFQForm";
import QuotationForm from "./pages/QuotationForm";
import Quotations from "./pages/Quotations";
import Approvals from "./pages/Approvals";
import ApprovalDetails from "./pages/ApprovalDetails";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";

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
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="vendors"
            element={<Vendors />}
          />

          <Route
            path="/rfq"
            element={<RFQForm />}
          />

          <Route
            path="/quotation-form"
            element={<QuotationForm />}
          />

          <Route
            path="/quotations"
            element={<Quotations />}
          />

          <Route
            path="/approvals"
            element={<Approvals />}
          />

          <Route
            path="/approval-detail/:id"
            element={<ApprovalDetails />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/order-invoice/:id"
            element={<Invoices />}
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