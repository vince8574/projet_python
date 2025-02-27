import { useState } from 'react';
import MyDatePicker from './datePicker';
import PdfViewer from './pdfviewer';
import save from '../assets/save.svg';

const ProductCreate = () => {
    const [afterSubmit, setAfterSubmit] = useState(false);
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || '');    
    const [selectedDate, setSelectedDate] = useState(null);
    const [isFrozen, setIsFrozen] = useState(null);
    const [dateFreeze, setDateFreeze] = useState(null);
    const [nbFreeze, setNbFreeze] = useState(0);
    const [designation, setDesignation] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(""); 

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isFrozen === 'oui') {
            setDateFreeze(selectedDate);
        } else {
            setDateFreeze(null);
        }

        const product = {
            designation,
            totalLot: parseInt(totalLot, 10),
            dateCreation: selectedDate.toISOString().split('T')[0],
            dateFreeze: isFrozen === 'oui' ? selectedDate.toISOString().split('T')[0] : "",
            nbFreeze: parseInt(nbFreeze, 10),
        };

        localStorage.setItem('totalLot', totalLot);
        localStorage.setItem('selectedDate', selectedDate);
        localStorage.setItem('dateFreeze', product.dateFreeze);

        const data = await sendDataToBackend(product);
        if (data) {
            setPdfUrl(data.pdf); // Mettre à jour l'url du pdf
        }

        localStorage.removeItem('totalLot');
        localStorage.removeItem('dateCreation');
        localStorage.removeItem('dateFreeze');
        setAfterSubmit(true);
    };

    const sendDataToBackend = async (product) => {
        console.log(product);
        try {
            const response = await fetch('http://localhost:8080/product/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(product),
            });
            const data = await response.json();
            console.log('Success:', data);
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-center font-bold text-4xl uppercase">{afterSubmit ? 'Produit enregistré' : 'Produit'}</h1>

            <div className="rounded-lg bg-white shadow-lg w-full max-w-5xl p-8 md:px-16 md:py-8 mt-8">
                {!afterSubmit && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Champs en ligne */}
                        <div className="flex flex-col space-y-4">
                            {/* Description */}
                            <div className="flex items-center gap-8">
                                <label htmlFor="description" className="text-left text-lg font-semibold w-1/3 min-w-[200px]">Description :</label>
                                <input id="description" type="text" className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                            </div>

                            {/* Nombre de lots */}
                            <div className="flex items-center gap-8">
                                <label htmlFor="totalLot" className="text-left text-lg font-semibold w-1/3 min-w-[200px]">Nombre de lots :</label>
                                <input id="totalLot" type="text" className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" value={totalLot} onChange={(e) => setTotalLot(e.target.value)} />
                            </div>

                            {/* Date de fabrication */}
                            <div className="flex items-center gap-8">
                                <label className="text-left text-lg font-semibold w-1/3 min-w-[200px]">Date de fabrication :</label>
                                <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} className="flex-1" />
                            </div>

                            {/* Toggle "Congelé" */}
                            <div className="flex items-center gap-8">
                                <label className="text-left text-lg font-semibold w-1/3 min-w-[200px]">Congelé :</label>
                                <button
                                    type="button"
                                    onClick={() => setIsFrozen(!isFrozen)}
                                    className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${isFrozen ? 'bg-freeze' : 'bg-gray-300'}`}
                                >
                                    <span className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isFrozen ? 'translate-x-8' : ''}`}></span>
                                </button>
                            </div>

                            {/* Nombre de lots congelés (Affiché uniquement si congelé = true) */}
                            {isFrozen && (
                                <div className="flex items-center gap-8">
                                    <label htmlFor="nbFreeze" className="text-left text-lg font-semibold w-1/3 min-w-[200px]">Nombre de lots congelés :</label>
                                    <input id="nbFreeze" type="text" className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:bg-freeze" value={nbFreeze} onChange={(e) => setNbFreeze(e.target.value)} />
                                </div>
                            )}
                        </div>
                        <div className="mt-16 flex justify-center">
                            <button className="flex items-center px-8 py-2 gap-3 bg-save text-black rounded-lg text-xl font-bold shadow-lg hover:scale-125">
                                Enregistrer
                                <img src={save} alt="enregistrer" className="h-6 w-auto" />
                            </button>
                        </div>
                    </form>
                )}
            </div>

            
            {/* Affichage du PDF après soumission */}
            {afterSubmit && pdfUrl && (
                <div className="mt-8 text-center">
                    <h2 className="text-lg font-semibold">Appuyez sur la touche {`>>`} pour imprimer</h2>
                    <iframe 
                            src={pdfUrl} 
                            width="600" 
                            height="800" 
                            title="PDF"
                            className='m-auto'
                            type="application/pdf"
                        
                        />
                </div>
            )}
        </div>
    );
};

export default ProductCreate;