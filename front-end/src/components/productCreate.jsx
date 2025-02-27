import { useState } from 'react';
import MyDatePicker from './datePicker';
import PdfViewer from './pdfviewer';

export function ProductCreate() {
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
        <div className='rounded-2xl m-auto w-[80%] bg-emerald-100'>
            <h1 className="text-center">{afterSubmit ? 'Produit enregistré' : 'Produit'}</h1>
            {!afterSubmit && (
                <form onSubmit={handleSubmit} className='mt-8'>
                    <div className="w-[80%] m-auto flex flex-wrap">
                        <label htmlFor="description" className="text-center size-full">Description</label>
                        <input id="description" type="text" className="border border-black border-solid bg-slate-100 w-[80%] m-auto" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                    </div>
                    <div className="w-[80%] m-auto flex flex-wrap">
                        <label htmlFor="totalLot" className="text-center size-full mt-4">Nombre de lots</label>
                        <input id="totalLot" type="text" className="border border-black border-solid bg-slate-100 w-[80%] m-auto" value={totalLot} onChange={(e) => setTotalLot(e.target.value)} />
                    </div>
                    <div className='text-center size-full mt-4'>
                        <span>Date de fabrication</span>
                        <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
                    </div>
                    <div className="mt-4 size-full text-center">
                        <label className="customerinfo charm-bold">Congelé</label>
                        <div>
                            <label>
                                <input 
                                    type="radio" 
                                    value="oui" 
                                    checked={isFrozen === 'oui'} 
                                    onChange={() => setIsFrozen('oui')} 
                                />
                                Oui
                            </label>
                            <label className='mx-8'>
                                <input 
                                    type="radio" 
                                    value="non" 
                                    checked={isFrozen === 'non'} 
                                    onChange={() => setIsFrozen('non')} 
                                />
                                Non
                            </label>
                        </div>
                    </div>
                    <div className='w-[80%] m-auto flex flex-wrap'>
                        <label htmlFor="nbFreeze" className="text-center size-full mt-4">Nombre de lots congelés</label>
                        <input id="nbFreeze" type="text" className="border border-black border-solid bg-slate-100 w-[80%] m-auto" value={nbFreeze} onChange={(e) => setNbFreeze(e.target.value)} />
                    </div>
                    <div className='submit mt-4 border border-black border-solid bg-purple-200 m-auto text-center w-1/3 rounded-full'>
                        <button className="" type="submit">Enregistrer</button>
                    </div>
                </form>
            )}
            {afterSubmit && pdfUrl && (
                <div className='mt-8'>
                    <h2 className='text-center'>Appuyez sur la touche {`>>`} pour imprimer</h2>
                    {/* <PdfViewer pdfUrl={pdfUrl} /> */}
                    <iframe 
                        src={pdfUrl} 
                        width="600" 
                        height="800" 
                        title="PDF"
                        className='m-auto'
                        type="application/pdf"
                       
                    />
                    {/* <iframe 
                        src="https://docs.google.com/gview?url={pdfUrl}"
                        width="600"
                        height="800"
                        title="PDF"
                    /> */}

                </div>
            )}
        </div>
    );
}

export default ProductCreate;
