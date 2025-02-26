import { useNavigate } from 'react-router-dom';

export function Introduction() {
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
          <div className=" flex flex-col justify-center items-center">
            <div className="flex justify-center gap-8">
              <button
                onClick={handleProduct}
                className="rounded-full w-64 h-64 bg-lime-200 flex items-center justify-center"
              >
                Nouveau produit
              </button>
              <button
                onClick={handleScanner}
                className="rounded-full w-64 h-64 bg-pink-700 flex items-center justify-center"
              >
                Scanner QRCODE
              </button>
            </div>
          </div>
        </>
      );
}

export default Introduction;
