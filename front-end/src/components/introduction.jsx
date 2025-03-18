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
    const readerRef = useRef(null);

    const handleProduct = () => {
        navigate("/product");
    };

    // Force un remontage complet du composant pour réinitialiser tous les états
    const forceRemount = () => {
        // On nettoie d'abord complètement le scanner
        if (scannerInstance) {
            try {
                scannerInstance.stop();
                setScannerInstance(null);
            } catch (error) {
                console.error("Erreur arrêt scanner:", error);
            }
        }
        
        // On vide l'élément DOM
        if (readerRef.current) {
            readerRef.current.innerHTML = '';
        }
        
        // On réinitialise l'interface en dernier
        setShowScanner(false);
        
        // Forcer un remontage complet via le router
        navigate('/', { replace: true });
        window.location.reload();
    };

    const startScanner = () => {
        setShowScanner(true);
        
        setTimeout(() => {
            try {
                if (readerRef.current) {
                    readerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                const html5QrCode = new Html5Qrcode("reader");
                setScannerInstance(html5QrCode);
                
                const config = { 
                    fps: 10, 
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
                        const boxSize = Math.min(minDimension, 250);
                        return {
                            width: boxSize,
                            height: boxSize
                        };
                    },
                    aspectRatio: window.innerWidth > 768 ? 1.333 : window.innerHeight / window.innerWidth
                };
                
                html5QrCode.start(
                    { facingMode: "environment" }, 
                    config,
                    (decodedText, result) => {
                        console.log("QR Code Scan Success:", decodedText);
                        onScanSuccess(decodedText);
                    },
                    (errorMessage) => {
                        console.log("QR Code Scan Error:", errorMessage);
                    }
                ).catch(err => {
                    console.error("Error starting scanner:", err);
                    alert("Impossible de démarrer le scanner. Vérifiez les permissions.");
                    forceRemount();
                });
            } catch (error) {
                console.error("Error initializing scanner:", error);
                alert("Impossible de démarrer le scanner. Vérifiez les permissions.");
                forceRemount();
            }
        }, 300);
    };

    const stopScanner = () => {
        // Solution drastique : on force un remontage complet du composant
        forceRemount();
    };

    const onScanSuccess = async (decodedText) => {
        console.log(`QR Code détecté: ${decodedText}`);
        
        try {
            // Arrêter le scanner
            if (scannerInstance) {
                await scannerInstance.stop();
                setScannerInstance(null);
            }
            
            // Fetch product data
            const response = await fetch(`https://savefood-api-2b6c0a130b5f.herokuapp.com/product/scan?ref=${encodeURIComponent(decodedText)}`, {
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
            forceRemount();
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

    // Gestionnaire de redimensionnement
    useEffect(() => {
        const handleResize = () => {
            if (scannerInstance) {
                forceRemount();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [scannerInstance]);

    return (
        <>
            <div className="flex flex-col justify-center items-center w-full px-4 py-6">
                {!showScanner ? (
                    <div className="flex flex-col md:flex-row justify-around items-center w-full gap-6">
                        <button
                            onClick={handleProduct}
                            className="flex flex-col rounded-[15px] items-center justify-center bg-new-product p-4 w-full md:w-auto transition-transform hover:scale-105"
                        >
                            <img src={newProduct} alt="nouveau produit" className="h-[150px] md:h-[250px] w-auto object-contain"/>
                            <span className="mt-2 text-lg font-medium">Nouveau produit</span>
                        </button>
                        <button
                            onClick={startScanner}
                            className="flex flex-col items-center justify-center rounded-[15px] bg-scanner p-4 w-full md:w-auto transition-transform hover:scale-105"
                        >
                            <img src={scan} alt="scanner" className="h-[150px] md:h-[250px] w-auto object-contain"/>
                            <span className="mt-2 text-lg font-medium">Scanner</span>
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
                                ref={(el) => {
                                    scannerRef.current = el;
                                    readerRef.current = el;
                                }}
                                className="w-full rounded-lg overflow-hidden shadow-lg"
                                style={{ 
                                    minHeight: '300px',
                                    height: 'calc(100vw * 0.75)',
                                    maxHeight: '500px'
                                }}
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