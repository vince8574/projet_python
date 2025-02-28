import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const Camera = ({ 
  onCapture = () => {}, 
  onDelete = () => {} 
}) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  // Démarrer la caméra
  const startCamera = async () => {
    setError(null);
    
    try {
      // Vérifier si l'API est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Votre navigateur ne supporte pas l'accès à la caméra.");
      }

      // Arrêter toute caméra précédente si elle existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Obtenir l'accès à la caméra avec des contraintes basiques
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      // Vérifier que le stream a au moins une piste vidéo
      if (mediaStream.getVideoTracks().length === 0) {
        throw new Error("Aucune piste vidéo disponible");
      }
      
      setStream(mediaStream);
      setCameraActive(true);
      
      // Attacher le stream à l'élément vidéo
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(e => {
          console.error("Erreur lors de la lecture vidéo:", e);
          throw new Error("Impossible de lire le flux vidéo");
        });
      } else {
        throw new Error("L'élément vidéo n'est pas disponible dans le DOM.");
      }
    } catch (err) {
      console.error("Erreur caméra:", err);
      setError(`Erreur d'accès à la caméra: ${err.message || 'Vérifiez vos permissions'}`);
      setCameraActive(false);
      setStream(null);
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Prendre une photo
  const takePhoto = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      setError("La vidéo n'est pas prête. Veuillez patienter ou redémarrer la caméra.");
      return;
    }

    try {
      // Création du canvas pour capturer l'image
      const canvas = document.createElement('canvas');
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Dessiner l'image depuis la vidéo
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      // Convertir en base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Vérifier que l'URL a été générée
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error("Échec de la capture d'image");
      }
      
      // Ajouter à la liste des photos
      const newPhotos = [...photos, dataUrl];
      setPhotos(newPhotos);
      
      // Informer le composant parent
      if (onCapture) {
        onCapture(newPhotos);
      }
    } catch (err) {
      console.error("Erreur lors de la capture:", err);
      setError(`Erreur lors de la capture: ${err.message}`);
    }
  };

  // Supprimer une photo
  const deletePhoto = (index) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    
    // Informer le composant parent
    if (onDelete) {
      onDelete(newPhotos);
    }
  };

  return (
    <div className="camera-container mt-6 space-y-4">
      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Contrôles de la caméra */}
      <div className="camera-controls flex justify-between">
        <button 
          type="button"
          onClick={cameraActive ? stopCamera : startCamera}
          className={`px-4 py-2 rounded-lg text-white ${cameraActive ? 'bg-red-500' : 'bg-blue-500'}`}
        >
          {cameraActive ? 'Arrêter la caméra' : 'Démarrer la caméra'}
        </button>
        
        {cameraActive && (
          <button 
            type="button"
            onClick={takePhoto}
            className="px-4 py-2 rounded-lg bg-green-500 text-white"
          >
            Prendre une photo
          </button>
        )}
      </div>
      
      {/* Aperçu de la caméra */}
      <div 
        className="camera-preview border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ 
          height: '300px', 
          maxWidth: '100%', 
          background: '#000', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          visibility: cameraActive ? 'visible' : 'hidden' // Masquer visuellement si inactif
        }}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          style={{ 
            maxHeight: '100%', 
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </div>
      
      {/* Aperçu des photos */}
      {photos.length > 0 && (
        <div className="photos-preview mt-4">
          <h3 className="text-lg font-semibold mb-2">Photos capturées ({photos.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative border border-gray-300 rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-auto"
                />
                <button
                  type="button"
                  onClick={() => deletePhoto(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Définition des PropTypes
Camera.propTypes = {
  onCapture: PropTypes.func,
  onDelete: PropTypes.func
};

export default Camera;