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
            <div className='bg-teal-100 min-h-screen flex flex-col'>
                <h1 className="size-full text-center">Faites votre choix</h1>
                <div className="pb-8 mt-8 flex size-full justify-around">
                    <button onClick={handleProduct} className='rounded-full w-64 h-64 bg-lime-200'>Nouveau produit</button>
                    <button onClick={handleScanner} className='rounded-full w-64 h-64 bg-pink-700'>Scanner QRCODE</button>
                </div>
            </div>
        </>
    );
}

export default Introduction;
