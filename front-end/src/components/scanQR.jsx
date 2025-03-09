import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import save from '../assets/save.svg';
import edit from '../assets/edit.svg';
import Camera from './Camera';

const EditableDescription = ({ designation, setDesignation }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="flex items-center space-x-4">
            <label htmlFor="description" className="w-1/3 text-left text-lg font-poppins font-bold">
                Description :
            </label>

            {isEditing ? (
                <input
                    id="description"
                    type="text"
                    className="flex-1 border border-black p-2 bg-slate-100 text-lg font-poppins"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    onBlur={() => setIsEditing(false)} // Quitte le mode édition si on clique ailleurs
                    autoFocus
                />
            ) : (
                <span
                    className="flex-1 cursor-pointer text-lg font-poppins"
                    onClick={() => setIsEditing(true)}
                >
                    {designation || "Cliquez pour ajouter une description"}
                </span>
            )}

            <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-300"
                onClick={() => setIsEditing(true)}
            >
                <img src={edit} alt="Éditer" />
            </button>
        </div>
    );
};

// Add prop validation
EditableDescription.propTypes = {
    designation: PropTypes.string,
    setDesignation: PropTypes.func.isRequired
};

const ScanQR = () => {
    const location = useLocation();
    const data = location.state?.data || {};

    const [afterSubmit, setAfterSubmit] = useState(false);
    const [designation, setDesignation] = useState(data.designation || '');
    const [totalLot, setTotalLot] = useState(data.totalLot || '');
    const [selectedDateFreeze, setSelectedDateFreeze] = useState(data.dateFreeze || '');
    const [selectedDateDefrost, setSelectedDateDefrost] = useState(data.dateDefrost || '');
    const [pdfUrl, setPdfUrl] = useState('');
    const [photos, setPhotos] = useState(data.photos || []);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showHistoricalPdf, setShowHistoricalPdf] = useState(false);
    
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
        // Merge with existing photos instead of replacing them
        setPhotos(prevPhotos => [...prevPhotos, ...capturedPhotos]);
    };

    // Gérer le démarrage de la caméra
    const handleCameraStart = () => {
        scrollToCamera();
    };

    // Fonction pour supprimer une photo
    const deletePhoto = (index) => {
        setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    };

    // Fonction pour formater une date au format dd/MM/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR'); // Format dd/MM/yyyy
        } catch (error) {
            console.error("Error formatting date:", error);
            return dateString;
        }
    };

    // Formatage de la date de création
    const formattedCreationDate = formatDate(data.dateCreation);

    // Fonction pour basculer entre les PDFs
    const toggleHistoricalPdf = () => {
        setShowHistoricalPdf(!showHistoricalPdf);
    };

    // Add this preparePhotosForUpload function back, with improvements:
const preparePhotosForUpload = async () => {
    if (!photos || photos.length === 0) {
      console.log("Aucune photo à préparer");
      return [];
    }
    
    console.log(`Préparation de ${photos.length} photos pour l'envoi`);
    
    try {
      // Convertir les images en fichiers
      const files = await Promise.all(photos.map(async (photoData, index) => {
        try {
          // Vérifier si c'est une URL (photo existante) ou une donnée base64 (nouvelle photo)
          if (typeof photoData === 'string') {
            if (photoData.startsWith('http')) {
              // C'est une URL, on la garde pour le tracking mais on retourne un objet spécial
              console.log(`Photo ${index} est une URL existante`);
              return { isExisting: true, url: photoData };
            } else if (photoData.startsWith('data:image')) {
              // C'est une donnée base64, on la traite
              // Extraire la partie données du dataURL
              const base64Data = photoData.split(',')[1];
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
              const file = new File([blob], `photo_${index}.jpg`, { type: 'image/jpeg' });
              return { isNew: true, file };
            }
          } else if (photoData && photoData.file) {
            // If it's already a file object structure
            return { isNew: true, file: photoData.file };
          }
          
          console.error(`Format non reconnu pour la photo ${index}`);
          return null;
        } catch (err) {
          console.error(`Erreur lors de la conversion de la photo ${index}:`, err);
          return null;
        }
      }));
      
      // Filter out null values
      return files.filter(item => item !== null);
    } catch (err) {
      console.error("Erreur lors de la préparation des photos:", err);
      setError(`Erreur lors de la préparation des photos: ${err.message}`);
      return [];
    }
  };
  
  // Update the handleSubmit function with proper photo handling
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Process photos first
      const processedPhotos = await preparePhotosForUpload();
      console.log(`Processed ${processedPhotos.length} photos`);
      
      // Create FormData object
      const formData = new FormData();
      
      // Get existing photo URLs (needed for backend to know which photos to keep)
      const existingPhotoUrls = processedPhotos
        .filter(photo => photo.isExisting)
        .map(photo => photo.url);
      
      // Prepare product data
      const productData = {
        id: data.id,
        ref: data.ref,
        designation: designation,
        totalLot: totalLot,
        dateCreation: data.dateCreation,
        dateFreeze: selectedDateFreeze,
        dateDefrost: selectedDateDefrost,
        nbFreeze: data.nbFreeze || 0,
        existingPhotos: existingPhotoUrls
      };
      
      // Add product data to FormData
      formData.append('product', JSON.stringify(productData));
      
      // Add new photos to FormData
      const newPhotos = processedPhotos.filter(photo => photo.isNew);
      if (newPhotos.length > 0) {
        newPhotos.forEach((photo, index) => {
          formData.append(`photos`, photo.file);
        });
      }
      
      // Log what we're sending
      console.log("Sending product data:", productData);
      console.log(`Sending ${newPhotos.length} new photos`);
      
      // Send the request with proper error handling
      const response = await fetch('http://localhost:8080/product/update-with-photos', {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Update successful:", result);
      setAfterSubmit(true);
      setPdfUrl(result.pdf || '');
      
    } catch (error) {
      console.error("Error updating product:", error);
      setError(`Failed to update product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

    const handleDeleteLot = () => {
        setTotalLot((prevTotalLot) => {
            const newTotalLot = parseInt(prevTotalLot, 10) - 1;
            return newTotalLot >= 0 ? newTotalLot.toString() : "0";
        });
    };

    const handleFreeze = () => {
        const currentDate = new Date().toLocaleDateString('fr-FR'); // Format dd/MM/yyyy
        setSelectedDateFreeze(currentDate);
    };

    const handleDefrost = () => {
        const currentDate = new Date().toLocaleDateString('fr-FR'); // Format dd/MM/yyyy
        setSelectedDateDefrost(currentDate);
    };

    return (
        <div className='flex flex-col justify-center items-center w-full m-auto'>
            <h1 className="uppercase font-poppins font-bold text-center text-4xl">
                {afterSubmit ? 'Produit enregistré' : 'fiche produit'}
            </h1>

            <div className='rounded-lg bg-white shadow-lg w-full max-w-5xl p-8 md:px-16 md:py-8 mt-8'>
                {/* Afficher les erreurs */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm sm:text-base">
                        <p>{error}</p>
                    </div>
                )}
                
                {!afterSubmit && (
                    <form onSubmit={handleSubmit} id="myForm" className="space-y-4 mt-8">
                        
                        {/* Description Editable */}
                        <EditableDescription designation={designation} setDesignation={setDesignation} />

                        <div className="flex flex-wrap items-center justify-between">
                            <span className="font-poppins text-left font-bold w-1/3 min-w-[200px]">
                                Nombre total de lots :
                            </span>
                            <span className="flex-1 px-4 py-2">{totalLot}</span>
                            <button 
                                className="flex items-center px-8 py-2 gap-3 bg-red-600 text-black rounded-lg text-xl font-bold shadow-lg hover:scale-90 transition" 
                                type="button"
                                onClick={handleDeleteLot}
                            >
                                Supprimer un lot
                            </button>
                        </div>

                        {/* Section des dates avec alignement uniforme */}
                        <div className="space-y-4">
                            {/* Date de création formatée - uniformisé avec les autres dates */}
                            <div className='flex items-center'>
                                <span className="w-1/4 font-poppins font-bold">Produit le :</span>
                                <span className="w-3/4">{formattedCreationDate}</span>
                            </div>

                            {/* Date de congélation */}
                            <div className='flex items-center'>
                                <span className="w-1/4 font-poppins font-bold">Congeler le :</span>
                                <span className="w-3/4 flex items-center">
                                    {selectedDateFreeze}
                                    {!selectedDateFreeze && (
                                        <button 
                                            className="px-4 py-2 bg-freeze text-black rounded-lg text-sm font-poppins font-bold shadow-md hover:scale-95 transition" 
                                            type="button"
                                            onClick={handleFreeze}
                                        >
                                            Congeler
                                        </button>
                                    )}
                                </span>
                            </div>

                            {/* Date de décongélation (visible seulement si la date de congélation est définie) */}
                            {selectedDateFreeze && (
                                <div className='flex items-center'>
                                    <span className="w-1/4 font-poppins font-bold">Décongeler le :</span>
                                    <span className="w-3/4 flex items-center">
                                        {selectedDateDefrost}
                                        {!selectedDateDefrost && (
                                            <button 
                                                className="px-4 py-2 bg-defrost text-black rounded-lg text-sm font-poppins font-bold shadow-md hover:scale-95 transition" 
                                                type="button"
                                                onClick={handleDefrost}
                                            >
                                                Décongeler
                                            </button>
                                        )}
                                    </span>
                                </div>
                            )}
                            
                            {/* Bouton pour afficher l'historique si disponible */}
                            {data.historique && (
                                <div className='flex items-center mt-4'>
                                    <span className="w-1/4 font-poppins font-bold">Historique :</span>
                                    <button 
                                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md hover:scale-95 transition" 
                                        type="button"
                                        onClick={toggleHistoricalPdf}
                                    >
                                        {showHistoricalPdf ? "Masquer l'historique" : "Afficher l'historique"}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Affichage de l'historique PDF si bouton activé */}
                        {showHistoricalPdf && data.historique && (
                            <div className='mt-4 border border-gray-300 rounded-lg p-4'>
                                <h3 className="text-lg font-semibold mb-2">Historique du produit</h3>
                                <iframe 
                                    src={data.historique} 
                                    width="100%" 
                                    height="500" 
                                    title="Historique PDF"
                                    className='rounded-lg'
                                />
                            </div>
                        )}
                        
                        {/* Affichage des photos existantes */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Photos existantes</h3>
                            <div className='flex flex-wrap gap-4 justify-start'>
                                {photos && photos.length > 0 ? (
                                    photos.map((photoUrl, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={photoUrl}
                                                alt={`Photo ${index}`}
                                                className='h-48 w-auto object-cover rounded-lg shadow-md'
                                            />
                                            {!afterSubmit && (
                                                <button
                                                    onClick={() => deletePhoto(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Aucune photo disponible</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Composant caméra avec ref pour le scroll */}
                        <div ref={cameraRef} className="mt-8">
                            <h3 className="text-lg font-semibold mb-2">Ajouter des photos</h3>
                            <Camera 
                                onCapture={handleCapturedPhotos}
                                onDelete={handleCapturedPhotos}
                                onCameraStart={handleCameraStart}
                                initialPhotos={photos}
                            />
                        </div>
                    </form>
                )}
            </div>

            {!afterSubmit && (
                <div className="mt-16">
                    <button 
                        className="flex items-center px-8 py-2 gap-3 bg-save text-black rounded-lg text-xl font-bold shadow-lg hover:scale-125 transition" 
                        type="submit"
                        form="myForm"
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                        <img src={save} alt="enregistrer" className="h-6 w-auto" />
                    </button>
                </div>
            )}

            {afterSubmit && pdfUrl && (
                <div className='mt-8'>
                    <div className="flex justify-center space-x-4 mb-4">
                        <button 
                            onClick={() => setShowHistoricalPdf(false)}
                            className={`px-4 py-2 rounded-lg ${!showHistoricalPdf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Fiche Produit
                        </button>
                        {data.historique && (
                            <button 
                                onClick={() => setShowHistoricalPdf(true)}
                                className={`px-4 py-2 rounded-lg ${showHistoricalPdf ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                            >
                                Historique
                            </button>
                        )}
                    </div>
                    <iframe 
                        src={showHistoricalPdf ? data.historique : pdfUrl} 
                        width="600" 
                        height="800" 
                        title={showHistoricalPdf ? "Historique PDF" : "PDF"}
                        className='m-auto'
                    />
                </div>
            )}
        </div>
    );
}

export default ScanQR;