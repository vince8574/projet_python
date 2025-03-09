import { useState, useEffect, useRef } from 'react';
import MyDatePicker from './datePicker';
import Camera from './Camera';
import save from '../assets/save.svg';

const ProductCreate = () => {
    const [afterSubmit, setAfterSubmit] = useState(false);
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || '');    
    const [selectedDate, setSelectedDate] = useState(null);
    const [isFrozen, setIsFrozen] = useState(false);
    const [nbFreeze, setNbFreeze] = useState(0);
    const [designation, setDesignation] = useState('');
    const [pdfUrl, setPdfUrl] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Référence pour la section caméra
    const cameraRef = useRef(null);

    // Fonction pour scroller vers la caméra
    const scrollToCamera = () => {
        if (cameraRef.current) {
            cameraRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Gérer les photos capturées par la caméra
    const handleCapturedPhotos = (capturedPhotos) => {
        console.log("Photos reçues du composant Camera:", capturedPhotos.length);
        setPhotos(capturedPhotos);
    };

    // Gérer le démarrage de la caméra
    const handleCameraStart = () => {
        scrollToCamera();
    };

    // Préparer les photos avant l'envoi
    const preparePhotosForUpload = async () => {
        if (!photos || photos.length === 0) {
            console.log("Aucune photo à préparer");
            return [];
        }
        
        console.log(`Préparation de ${photos.length} photos pour l'envoi`);
        
        try {
            // Convertir les images base64 en fichiers Blob
            const files = await Promise.all(photos.map(async (dataUrl, index) => {
                try {
                    // Extraire la partie données du dataURL
                    const base64Data = dataUrl.split(',')[1];
                    if (!base64Data) {
                        throw new Error(`Format d'image invalide pour la photo ${index}`);
                    }
                    
                    // Convertir en binaire
                    const byteString = atob(base64Data);
                    const arrayBuffer = new ArrayBuffer(byteString.length);
                    const intArray = new Uint8Array(arrayBuffer);
                    
                    for (let i = 0; i < byteString.length; i++) {
                        intArray[i] = byteString.charCodeAt(i);
                    }
                    
                    // Créer un blob puis un fichier
                    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
                    return new File([blob], `photo_${index}.jpg`, { type: 'image/jpeg' });
                } catch (err) {
                    console.error(`Erreur lors de la conversion de la photo ${index}:`, err);
                    throw err;
                }
            }));
            
            console.log(`${files.length} photos préparées avec succès`);
            return files;
        } catch (err) {
            console.error("Erreur lors de la préparation des photos:", err);
            setError(`Erreur lors de la préparation des photos: ${err.message}`);
            return [];
        }
    };

    const validateForm = () => {
        // Réinitialiser l'erreur
        setError(null);
        
        // Vérifier les champs obligatoires
        if (!designation.trim()) {
            setError("La description est obligatoire");
            return false;
        }
        
        if (!totalLot || isNaN(parseInt(totalLot, 10)) || parseInt(totalLot, 10) <= 0) {
            setError("Le nombre de lots doit être un nombre positif");
            return false;
        }
        
        if (!selectedDate) {
            setError("La date de fabrication est obligatoire");
            return false;
        }
        
        if (isFrozen && (isNaN(parseInt(nbFreeze, 10)) || parseInt(nbFreeze, 10) < 0)) {
            setError("Le nombre de lots congelés doit être un nombre positif ou zéro");
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Valider le formulaire
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        console.log("Soumission du formulaire...");

        try {
            // Préparation des données du produit
            const product = {
                designation: designation.trim(),
                totalLot: parseInt(totalLot, 10),
                dateCreation: selectedDate.toISOString().split('T')[0],
                dateFreeze: isFrozen ? selectedDate.toISOString().split('T')[0] : "",
                nbFreeze: isFrozen ? (parseInt(nbFreeze, 10) || 0) : 0,
            };

            console.log("Données du produit:", product);

            // Préparer les photos si disponibles
            const photoFiles = await preparePhotosForUpload();
            console.log("Photos préparées:", photoFiles.length);

            // Envoyer les données au backend
            const data = await sendDataToBackend(product, photoFiles);
            if (data && data.pdf) {
                setPdfUrl(data.pdf);
                setAfterSubmit(true);
                console.log("Produit enregistré avec succès");
            } else {
                setError("Erreur lors de l'enregistrement du produit");
            }
        } catch (error) {
            console.error('Error:', error);
            setError(`Erreur: ${error.message || "Une erreur est survenue lors de l'enregistrement"}`);
        } finally {
            setLoading(false);
        }
    };

    const sendDataToBackend = async (product, photoFiles) => {
        try {
          const formData = new FormData();
          
          // Ajouter les données du produit
          formData.append('product', JSON.stringify(product));
          
          // Ajouter les photos
          photoFiles.forEach((file, index) => {
            formData.append(`photo_${index}`, file);
          });
      
          console.log("Envoi FormData avec photos au backend");
          
          
       /*home*/  const response = await fetch('http://192.168.1.28:8080/product/with-photos', {
    // /*    sekoia*/   const response = await fetch('http://192.168.13.70:8080/product/with-photos', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('Success:', data);
          return data;
        } catch (error) {
          console.error('Error:', error);
          throw error;
        }
      };
    // Réinitialiser le formulaire
    const handleReset = () => {
        setAfterSubmit(false);
        setDesignation('');
        setTotalLot('');
        setSelectedDate(null);
        setIsFrozen(false);
        setNbFreeze(0);
        setPdfUrl('');
        setPhotos([]);
        setError(null);
    };

    // Sauvegarder totalLot dans localStorage quand il change
    useEffect(() => {
        if (totalLot) {
            localStorage.setItem('totalLot', totalLot);
        }
    }, [totalLot]);

    return (
        <div className="flex flex-col items-center justify-center w-full p-2 sm:p-4 md:p-6">
            <h1 className="text-center font-bold text-2xl sm:text-3xl md:text-4xl uppercase my-2 sm:my-4">
                {afterSubmit ? '' : 'Produit'}
            </h1>

            <div className="rounded-lg bg-white shadow-lg w-full max-w-5xl p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Afficher les erreurs */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm sm:text-base">
                        <p>{error}</p>
                    </div>
                )}
                
                {!afterSubmit ? (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Champs en ligne */}
                        <div className="flex flex-col space-y-3 sm:space-y-4">
                            {/* Description */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <label htmlFor="description" className="text-left text-base sm:text-lg font-semibold sm:w-1/3 sm:min-w-[150px] md:min-w-[200px]">
                                    Description :
                                </label>
                                <input 
                                    id="description" 
                                    type="text" 
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                                    value={designation} 
                                    onChange={(e) => setDesignation(e.target.value)} 
                                    required
                                />
                            </div>

                            {/* Nombre de lots */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <label htmlFor="totalLot" className="text-left text-base sm:text-lg font-semibold sm:w-1/3 sm:min-w-[150px] md:min-w-[200px]">
                                    Nombre de lots :
                                </label>
                                <input 
                                    id="totalLot" 
                                    type="number" 
                                    className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                                    value={totalLot} 
                                    onChange={(e) => setTotalLot(e.target.value)} 
                                    required
                                    min="1"
                                />
                            </div>

                            {/* Date de fabrication */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <label className="text-left text-base sm:text-lg font-semibold sm:w-1/3 sm:min-w-[150px] md:min-w-[200px]">
                                    Date de fabrication :
                                </label>
                                <div className="flex-1">
                                    <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                                </div>
                            </div>

                            {/* Toggle "Congelé" */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <label className="text-left text-base sm:text-lg font-semibold sm:w-1/3 sm:min-w-[150px] md:min-w-[200px]">
                                    Congelé :
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsFrozen(!isFrozen)}
                                    className={`relative w-12 sm:w-16 h-6 sm:h-8 rounded-full transition-colors duration-300 ${isFrozen ? 'bg-blue-500' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute left-1 top-1 w-4 sm:w-6 h-4 sm:h-6 bg-white rounded-full transition-transform duration-300 ${isFrozen ? 'translate-x-6 sm:translate-x-8' : ''}`}></span>
                                </button>
                            </div>

                            {/* Nombre de lots congelés (Affiché uniquement si congelé = true) */}
                            {isFrozen && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                    <label htmlFor="nbFreeze" className="text-left text-base sm:text-lg font-semibold sm:w-1/3 sm:min-w-[150px] md:min-w-[200px]">
                                        Nombre de lots congelés :
                                    </label>
                                    <input 
                                        id="nbFreeze" 
                                        type="number" 
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400 focus:outline-none" 
                                        value={nbFreeze} 
                                        onChange={(e) => setNbFreeze(e.target.value)} 
                                        min="0"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Composant caméra avec ref pour le scroll */}
                        <div ref={cameraRef} className="mt-4 sm:mt-6 md:mt-8">
                            <h3 className="text-base sm:text-lg font-semibold mb-2">Photos du produit</h3>
                            <Camera 
                                onCapture={handleCapturedPhotos} 
                                onDelete={handleCapturedPhotos}
                                onCameraStart={handleCameraStart}
                            />
                        </div>
                        
                        <div className="mt-8 sm:mt-12 md:mt-16 flex justify-center">
                            <button 
                                type="submit" 
                                className="flex items-center px-4 sm:px-6 md:px-8 py-2 gap-2 sm:gap-3 bg-green-500 text-white rounded-lg text-base sm:text-lg md:text-xl font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                                disabled={loading}
                            >
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                                <img src={save} alt="enregistrer" className="h-4 sm:h-5 md:h-6 w-auto" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="mb-4 sm:mb-6 md:mb-8">
                            <h2 className="text-lg sm:text-xl font-bold text-green-600 mb-2">Produit enregistré avec succès!</h2>
                            <button 
                                onClick={handleReset}
                                className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 bg-blue-500 text-white text-sm sm:text-base rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Créer un nouveau produit
                            </button>
                        </div>
                        
                        {/* Affichage du PDF */}
                        {pdfUrl && (
                            <div className="mt-4 sm:mt-6 md:mt-8">
                                <div className="border rounded-lg overflow-hidden max-w-full">
                                    <iframe 
                                        src={pdfUrl} 
                                        width="100%" 
                                        height="400" 
                                        title="PDF"
                                        className="m-auto"
                                        type="application/pdf"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCreate;