import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import save from '../assets/save.svg';
import edit from '../assets/edit.svg';

const EditableDescription = ({ designation, setDesignation }) => {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="flex items-center space-x-4">
            <label htmlFor="description" className="w-1/3 text-left font-poppins">
                Description :
            </label>

            {isEditing ? (
                <input
                    id="description"
                    type="text"
                    className="flex-1 border border-black p-2 bg-slate-100"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    onBlur={() => setIsEditing(false)} // Quitte le mode édition si on clique ailleurs
                    autoFocus
                />
            ) : (
                <span
                    className="flex-1 cursor-pointer"
                    onClick={() => setIsEditing(true)}
                >
                    {designation || "Cliquez pour ajouter une description"}
                </span>
            )}

            <button
                className="px-4 py-2 rounded-lg border border-slate-300"
                onClick={() => setIsEditing(true)}
            >
                <img src={edit} alt="Éditer" />
            </button>
        </div>
    );
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        const product = {
            designation,
            totalLot: parseInt(totalLot, 10),
            dateCreation: data.dateCreation,
            dateFreeze: selectedDateFreeze,
            dateDefrost: selectedDateDefrost,
            id: data.id
        };

        await updateProduct(data.id, product);
        setAfterSubmit(true);
    };

    const updateProduct = async (id, product) => {
        try {
            const response = await fetch(`http://localhost:8080/product/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(product)
            });

            const responseData = await response.json();
            console.log('Success:', responseData);
            setPdfUrl(responseData.pdf);
            return responseData;
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleDeleteLot = () => {
        setTotalLot((prevTotalLot) => {
            const newTotalLot = parseInt(prevTotalLot, 10) - 1;
            return newTotalLot >= 0 ? newTotalLot : 0;
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
                {!afterSubmit && (
                    <form onSubmit={handleSubmit} id="myForm" className="space-y-4 mt-8">
                        
                        {/* Description Editable */}
                        <EditableDescription designation={designation} setDesignation={setDesignation} />

                        <div className="flex flex-wrap items-center justify-between">
                            <span className="font-poppins text-left text-lg font-semibold w-1/3 min-w-[200px]">
                                Nombre total de lots :
                            </span>
                            <input 
                                type="text" 
                                className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" 
                                value={totalLot} 
                                onChange={(e) => setTotalLot(e.target.value)} 
                            />
                            <button 
                                className="flex items-center px-8 py-2 gap-3 bg-red-600 text-black rounded-lg text-xl font-bold shadow-lg hover:scale-90 transition" 
                                type="button"
                                onClick={handleDeleteLot}
                            >
                                Supprimer un lot
                            </button>
                        </div>

                        <div className='flex flex-row flex-wrap items-center'>
                            <span className="w-1/4 mb-2 mr-4">Produit le :</span>
                            <label className="w-1/4 mb-2 mr-4">{data.dateCreation}</label>
                        </div>

                        <div className='flex flex-wrap items-center'>
                            <span className="w-1/4 mb-2">Congeler le : {selectedDateFreeze}</span>
                            {!selectedDateFreeze && (
                                <button 
                                    className="flex items-center px-8 py-2 gap-3 bg-blue-500 text-white rounded-lg text-xl font-bold shadow-lg hover:scale-90 transition" 
                                    type="button"
                                    onClick={handleFreeze}
                                >
                                    Congeler
                                </button>
                            )}
                        </div>

                        {selectedDateFreeze && (
                            <div className='flex flex-wrap items-center'>
                                <span className="w-1/4 mb-2">Décongeler le: {selectedDateDefrost}</span>
                                {!selectedDateDefrost && (
                                    <button 
                                        className="flex items-center px-8 py-2 gap-3 bg-green-500 text-white rounded-lg text-xl font-bold shadow-lg hover:scale-90 transition" 
                                        type="button"
                                        onClick={handleDefrost}
                                    >
                                        Décongeler
                                    </button>
                                )}
                            </div>
                        )}
                    </form>
                )}
            </div>

            {!afterSubmit && (
                <div className="mt-16">
                    <button className="flex items-center px-8 py-2 gap-3 bg-save text-black rounded-lg text-xl font-bold shadow-lg hover:scale-125 transition" onClick={handleSubmit}>
                        Enregistrer
                        <img src={save} alt="enregistrer" className="h-6 w-auto" />
                    </button>
                </div>
            )}

            <div>
                <h2 className='text-center'>Photos</h2>
                <div className='flex flex-wrap space-x-4 space-y-4 justify-center'>
                    {data.photos && data.photos.map((photoUrl, index) => (
                        <img key={index} src={photoUrl} alt={`Photo ${index}`} className='max-w-[300px]' />
                    ))}
                </div>
            </div>

            {afterSubmit && pdfUrl && (
                <div className='mt-8'>
                    
                    <iframe 
                        src={pdfUrl} 
                        width="600" 
                        height="800" 
                        title="PDF"
                        className='m-auto'
                    />
                </div>
            )}
        </div>
    );
}

export default ScanQR;
