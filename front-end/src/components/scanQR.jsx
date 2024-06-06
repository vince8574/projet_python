import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MyDatePicker from './datePicker';

export function ScanQR() {
    const location = useLocation();
    const data = location.state?.data || {};

    const [afterSubmit, setAfterSubmit] = useState(false);
    const [designation, setDesignation] = useState(localStorage.getItem('designation') || data.designation || '');
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || data.totalLot || '');    
    const [selectedDateFreeze, setSelectedDateFreeze] = useState(new Date(localStorage.getItem('selectedDateFreeze') || data.dateFreeze || ""));
    const [selectedDateDefrost, setSelectedDateDefrost] = useState(new Date(localStorage.getItem('selectedDateDefrost') || data.dateDefrost || ""));
    const [selectedDateCreation, setSelectedDateCreation] = useState(new Date(localStorage.getItem('selectedDateCreation') || data.dateCreation || ""));
    const [pdfUrl, setPdfUrl] = useState(""); 

    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const product = {
            designation,
            totalLot: parseInt(totalLot, 10),
            dateCreation: selectedDateCreation.toISOString().split('T')[0],
            dateFreeze : selectedDateFreeze.toISOString().split('T')[0],
            dateDefrost : selectedDateDefrost.toISOString().split('T')[0],
            id : data.id
        };

        localStorage.setItem('designation', designation);
        localStorage.setItem('totalLot', totalLot);
        localStorage.setItem('selectedDateFreeze', selectedDateFreeze);
        localStorage.setItem('selectedDateDefrost', selectedDateDefrost);
        
        await updateProduct(product);
        
        localStorage.removeItem('totalLot');
        localStorage.removeItem('dateCreation');
        localStorage.removeItem('dateFreeze');
        localStorage.removeItem('dateDefrost')
        
        setAfterSubmit(true);
    }
    
    const updateProduct = async (product) => {
        try {
            const response = await fetch('http://localhost:8080/product/scan', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(product)
            });

            const data = await response.json();
            console.log('Success:', data);
            setPdfUrl(data.pdf); // Mettre à jour l'url du pdf
            
            return data;
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };
    
    const handleDeleteLot = () => {
        setTotalLot(prevTotalLot => {
            const newTotalLot = parseInt(prevTotalLot, 10) - 1;
            return newTotalLot >= 0 ? newTotalLot : 0; // Assurer que le totalLot ne devient pas négatif
        });
    }

    return (
        <div className='rounded-2xl m-auto w-[80%] bg-cyan-200'> 
            <h1 className="">{afterSubmit ? 'Produit enregistré' : ''}</h1>
            {!afterSubmit && (
                <form onSubmit={handleSubmit} id="myForm" className="space-y-4 mt-8">
                    <div>
                        <label htmlFor="description" className="block text-center">Description</label>
                        <input 
                            id="description" 
                            type="text" 
                            className="border border-black border-solid bg-slate-100 size-full text-center" 
                            value={designation} 
                            onChange={(e) => setDesignation(e.target.value)} 
                        />
                    </div>
                    <div className='flex flex-wrap items-center'>
                        <span className="w-1/4 mb-2 mr-4">Produit le:</span>
                        <MyDatePicker selectedDate={selectedDateCreation} setSelectedDate={setSelectedDateCreation} />
                    </div>
                    <div className="flex flex-wrap items-center">
                        <span className="w-1/4 mb-2">Nombre total de lots :</span>
                        <input 
                            type="text" 
                            className="border border-black border-solid bg-slate-100 w-[20%]" 
                            value={totalLot} 
                            onChange={(e) => setTotalLot(e.target.value)} 
                        />
                        <button 
                            className="mt-4 border border-black border-solid m-auto text-center w-32 h-32 rounded-full bg-red-600" 
                            type="button"
                            onClick={handleDeleteLot}
                        >
                            Supprimer un lot
                        </button>
                    </div>
                    <div className='flex flex-wrap items-center'>
                        <span className="w-1/4 mb-2">Congeler le:</span>
                        <MyDatePicker selectedDate={selectedDateFreeze} setSelectedDate={setSelectedDateFreeze} />
                    </div>
                    <div className='flex flex-wrap items-center'>
                        <span className="w-1/4 mb-2">Décongeler le:</span>
                        <MyDatePicker selectedDate={selectedDateDefrost} setSelectedDate={setSelectedDateDefrost} />
                    </div>         
                    <div className='mt-4 flex'>
                        <button className='mt-4 border border-black border-solid bg-purple-200 text-center w-1/3 rounded-full m-auto' type="submit">Enregistrer</button>
                    </div>
                </form>
            )}
            <div>
                <h2 className='text-center'>Photos</h2>
                <div className='flex flex-wrap space-x-4 space-y-4 justify-center'>
                    {data.photos && data.photos.map((photoUrl, index) => (
                        <img key={index} src={photoUrl} alt={`Photo ${index}`} width="300" />
                    ))}
                </div>
            </div>
            <div>
                {data.pdf && (
                    <iframe 
                        src={data.pdf} 
                        width="600" 
                        height="800" 
                        title="PDF"
                        className='m-auto mt-4'
                    />
                )}
            </div>
            {afterSubmit && pdfUrl && (
            <div className='mt-8'>
                <h2 className='text-center'>Appuyez sur la touche {`>>`} pour imprimer</h2>
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
