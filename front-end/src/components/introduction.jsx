import { useNavigate } from 'react-router-dom';
import scan from '../assets/scan-ico.png';
import newProduct from '../assets/edit_document.svg';

const Introduction = () => {
    const navigate = useNavigate();

    const sendDataToBackend = async () => {
        try {
            const response = await fetch('http://localhost:8080/product/scan', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
            });
            const data = await response.json();
            console.log('Success:', data);
            return data;
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleScanner = async () => {
        const data = await sendDataToBackend();
        navigate("/scan", { state: { data } });
    }

    const handleProduct = () => {
        navigate("/product");
    }

    return (
        <>
          <div className=" flex flex-col justify-center items-center w-full">
            <div className="flex justify-around items-center w-full">
              <button
                onClick={handleProduct}
                className="flex flex-col rounded-[15px] items-center justify-center bg-new-product"
              >
                <img src={newProduct} alt="nouveau produit" className="h-[250px]"/>
                Nouveau produit
              </button>
              <button
                onClick={handleScanner}
                className="flex flex-col items-center justify-center rounded-[15px] bg-scanner"
              >
                <img src={scan} alt="scanner" className="w-auto h-[250px]"/>
                Scanner
              </button>
            </div>
          </div>
  </>
    );
}
export default Introduction;
