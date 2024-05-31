import { useState } from 'react';
import MyDatePicker from './datePicker';


export function ScanQR() {
    const [afterSubmit, setAfterSubmit] = useState(false);
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || '');    
    const [selectedDate, setSelectedDate] = useState(null); // État local pour stocker la date sélectionnée
    const [isFrozen, setIsFrozen] = useState(null); // État pour les boutons radio
    const [dateFreeze, setDateFreeze] = useState(null); // État pour la date de congélation
    
    const handleSubmit = (event) => {
      event.preventDefault();

      // Mise à jour de dateFreeze si "Oui" est sélectionné
      if (isFrozen === 'oui') {
          setDateFreeze(selectedDate);
      } else {
          setDateFreeze(null);
      }

      localStorage.setItem('totalLot', totalLot);
      localStorage.setItem('selectedDate', selectedDate);
      localStorage.setItem('dateFreeze', isFrozen === 'oui' ? selectedDate : '');

      // If all validations pass
      setAfterSubmit(true);
      // checkDate();
    }  
  
    return (
      <>
        <div className='w-[80%]'> 
          <h1 className="">{afterSubmit ? 'Produit enregistré' : ''}</h1>
          {!afterSubmit && (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap w-4/5">
                <span className="justify">Lot :</span>
                <button className="mt-8" type="button">Supprimer</button>

                
              </div>
              <div className='flex flex-wrap'>
                <span classname="mb-8">Congeler le:</span>
                <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate}/> {/* Utilisez onChange pour mettre à jour l'état de la date sélectionnée */}
              </div>
              <div className='flex flex-wrap'>
                <span classname="mb-8">Décongeler le:</span>
                <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate}/> {/* Utilisez onChange pour mettre à jour l'état de la date sélectionnée */}
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
