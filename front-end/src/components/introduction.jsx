import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import scan from '../assets/scan-ico.png';
import newProduct from '../assets/edit_document.svg';
import { Html5Qrcode } from 'html5-qrcode';

const Introduction = () => {
    const navigate = useNavigate();
    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef(null);
    const [scannerInstance, setScannerInstance] = useState(null);

    const handleProduct = () => {
        navigate("/product");
    };

    const startScanner = () => {
        setShowScanner(true);
        
        setTimeout(() => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                setScannerInstance(html5QrCode);
                
                const config = { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.333 // 4:3 aspect ratio
                };
                
                html5QrCode.start(
                    { facingMode: "environment" }, 
                    config,
                    (decodedText, result) => {
                        console.log("QR Code Scan Success:", decodedText);
                        console.log("Scan Result:", result);
                        onScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        console.log("QR Code Scan Error:", errorMessage);
                    }
                ).catch(err => {
                    console.error("Error starting scanner:", err);
                });
            } catch (error) {
                console.error("Error initializing scanner:", error);
                alert("Impossible de démarrer le scanner. Vérifiez les permissions.");
            }
        }, 100);
    };

    const stopScanner = () => {
        if (scannerInstance) {
            scannerInstance.stop().then(() => {
                console.log('Scanner arrêté avec succès');
                setScannerInstance(null);
            }).catch(error => {
                console.error('Erreur lors de l\'arrêt du scanner:', error);
            });
        }
        setShowScanner(false);
    };

    const onScanSuccess = async (decodedText) => {
        console.log(`QR Code détecté: ${decodedText}`);
        
        try {
            // Arrêter le scanner
            if (scannerInstance) {
                await scannerInstance.stop();
            }
            
            // Fetch product data
            const response = await fetch(`http://localhost:8080/product/scan?ref=${encodeURIComponent(decodedText)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la récupération du produit');
            }
            
            const data = await response.json();
            
            // Navigation vers la page de scan avec les données du produit
            navigate("/scan", { state: { data } });
        } catch (error) {
            console.error('Erreur détaillée:', error);
            setShowScanner(false);
            alert(`Erreur: ${error.message}`);
        }
    };

    // Nettoyage lors du démontage du composant
    useEffect(() => {
        return () => {
            if (scannerInstance) {
                scannerInstance.stop().catch(error => {
                    console.error('Erreur lors de l\'arrêt du scanner:', error);
                });
            }
        };
    }, [scannerInstance]);

    return (
        <>
            <div className="flex flex-col justify-center items-center w-full">
                {!showScanner ? (
                    <div className="flex justify-around items-center w-full">
                        <button
                            onClick={handleProduct}
                            className="flex flex-col rounded-[15px] items-center justify-center bg-new-product"
                        >
                            <img src={newProduct} alt="nouveau produit" className="h-[250px]"/>
                            Nouveau produit
                        </button>
                        <button
                            onClick={startScanner}
                            className="flex flex-col items-center justify-center rounded-[15px] bg-scanner"
                        >
                            <img src={scan} alt="scanner" className="w-auto h-[250px]"/>
                            Scanner
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full">
                        <button 
                            onClick={stopScanner}
                            className="mb-4 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Retour
                        </button>
                        <div className="w-full max-w-lg">
                            <div 
                                id="reader" 
                                ref={scannerRef} 
                                className="w-full"
                                style={{ minHeight: '400px' }}
                            ></div>
                        </div>
                        <p className="mt-4 text-center font-medium">Positionnez le QR code devant la caméra</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Introduction;