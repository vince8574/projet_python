import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import MyDatePicker from './datePicker';

export function ScanQR() {
    const location = useLocation();
    const data = location.state?.data || {};

    const [afterSubmit, setAfterSubmit] = useState(false);
    const [designation, setDesignation] = useState(localStorage.getItem('designation') || data.designation || '');
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || data.totalLot || '');    
    const [selectedDateFreeze, setSelectedDateFreeze] = useState(localStorage.getItem('selectedDateFreeze') || data.dateFreeze || ""); // État local pour stocker la date sélectionnée
    const [selectedDateDefrost, setSelectedDateDefrost] = useState(null); // État pour la date de décongélation
    const [selectedDateCreation, setSelectedDateCreation] = useState(localStorage.getItem('selectedDateCreation') || data.dateCreation || ""); // État pour la date de décongélation


    const handleSubmit = (event) => {
        event.preventDefault();

        localStorage.setItem('designation', designation);
        localStorage.setItem('totalLot', totalLot);
        localStorage.setItem('selectedDateFreeze', selectedDateFreeze);
        localStorage.setItem('selectedDateDefrost', selectedDateDefrost);


        // If all validations pass
        setAfterSubmit(true);
    }

    return (
        <>
            <div className='w-[80%]'> 
                <h1 className="">{afterSubmit ? 'Produit enregistré' : ''}</h1>
                {!afterSubmit && (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="description" className="text-center size-full">Description</label>
                            <input id="description" type="text" className="border border-black border-solid bg-slate-100 w-[80%] m-auto" value={designation} onChange={(e) => setDesignation(e.target.value)} />
                        </div>
                        <div className='flex flex-wrap'>
                            <span className="mb-8">Produit le:</span>
                            <MyDatePicker selectedDate={selectedDateCreation} setSelectedDate={setSelectedDateCreation} />
                        </div>
                        <div className="flex flex-wrap w-4/5">
                            <span className="justify">Lot :</span>
                            <input type="text" className="border border-black border-solid bg-slate-100 w-[80%] m-auto" value={totalLot} onChange={(e) => setTotalLot(e.target.value)} />
                            <button className="mt-8" type="button">Supprimer</button>
                        </div>
                        <div className='flex flex-wrap'>
                            <span className="mb-8">Congeler le:</span>
                            <MyDatePicker selectedDate={selectedDateFreeze} setSelectedDate={setSelectedDateFreeze} />
                        </div>
                        <div className='flex flex-wrap'>
                            <span className="mb-8">Décongeler le:</span>
                            <MyDatePicker selectedDate={selectedDateDefrost} setSelectedDate={setSelectedDateDefrost} />
                        </div>         
                        <div className='justify mt-8'>
                            <button className="btnSubmit" type="submit">Enregistrer</button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

export default ScanQR;
