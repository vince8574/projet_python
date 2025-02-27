import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductCreate from "./components/productCreate";
import ScanQR from "./components/scanQR";
import Introduction from "./components/introduction";
import Footer from "./components/footer";
import Header from "./components/header";





function App() {
  return (
    
          
      <Router>
        <div className="min-h-screen bg-body flex flex-col justify-center items-center">
          <Header className="w-full"/>
          <div  className="flex flex-col justify-center items-center px-4 md:px-16 lg:px-32 xl:px-64 flex-grow mb-16 w-full" id="root">
          <Routes>
            <Route path="/" element={<Introduction />} />
            <Route path="/product" element={<ProductCreate />} />
            <Route path="/scan" element={<ScanQR />} />            
          </Routes>
        </div>
        <Footer className="w-full mt-auto"/>
        </div>
      </Router>
    
  );
}

export default App;
