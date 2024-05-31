import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductCreate from "./components/productCreate";
import ScanQR from "./components/scanQR";
import Introduction from "./components/introduction";


function App() {
  return (
    <div className='App'>
          
      <Router>
        <div>
          <h1 className="text-red-500">Save Food</h1>
          <Routes>
            <Route path="/" element={<Introduction />} />
            <Route path="/product" element={<ProductCreate />} />
            <Route path="/scan" element={<ScanQR />} />
            
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
