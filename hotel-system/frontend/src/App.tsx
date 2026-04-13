import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Booking } from "./pages/Booking";
import { Payment } from "./pages/Payment";
import { Success } from "./pages/Success";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { HostDashboard } from "./pages/HostDashboard";
import { HostNewProperty } from "./pages/HostNewProperty";
import { HostProfile } from "./pages/HostProfile";
import { OwnerRoute } from "./components/OwnerRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/host" element={<OwnerRoute><HostDashboard /></OwnerRoute>} />
        <Route path="/host/new-property" element={<OwnerRoute><HostNewProperty /></OwnerRoute>} />
        <Route path="/host/profile" element={<OwnerRoute><HostProfile /></OwnerRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;