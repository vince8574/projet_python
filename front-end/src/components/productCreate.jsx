import { useState } from 'react';
import MyDatePicker from './datePicker';

export function ProductCreate() {
    const [afterSubmit, setAfterSubmit] = useState(false);
    const [totalLot, setTotalLot] = useState(localStorage.getItem('totalLot') || '');    
    const [selectedDate, setSelectedDate] = useState(null);
    const [isFrozen, setIsFrozen] = useState(null);
    const [dateFreeze, setDateFreeze] = useState(null);
    const [nbFreeze, setNbFreeze] = useState(null);
    const [description, setDescription] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isFrozen === 'oui') {
            setDateFreeze(selectedDate);
        } else {
            setDateFreeze(null);
        }

        const product = {
            
            totalLot,
            dateCreation: selectedDate,
            dateFreeze: isFrozen === 'oui' ? selectedDate : null,
            nbFreeze,
        };

        localStorage.setItem('totalLot', totalLot);
        localStorage.setItem('selectedDate', selectedDate);
        localStorage.setItem('dateFreeze', product.dateFreeze);

        
        
        await sendDataToBackend(product);
        
        localStorage.removeItem('totalLot');
        localStorage.removeItem('dateCreation');
        localStorage.removeItem('dateFreeze');
        setAfterSubmit(true);
    };

    const sendDataToBackend = async (product) => {
        try {
            const response = await fetch('http://127.0.0.1:8080/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });
            const data = await response.json();
            console.log('Success:', data);
            return data
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
      <div className='formulaire'> 
          <h1 className="">{afterSubmit ? 'Produit enregistré' : 'Produit'}</h1>
          {!afterSubmit && (
            <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap w-4/5">
                    <label htmlFor="description" className="customerinfo charm-bold">Description</label>
                    <input id="description" type="text" className="validate charm-regular" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex flex-wrap w-4/5">
                    <label htmlFor="totalLot" className="customerinfo charm-bold">Nombre de lots</label>
                    <input id="totalLot" type="text" className="validate charm-regular" value={totalLot} onChange={(e) => setTotalLot(e.target.value)} />
                </div>
                <div className='picker'>
                    <span>Date de fabrication</span>
                    <MyDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate}/>
                </div>
                <div className="label">
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
                  <label>
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
                <div>
                    <label htmlFor="nbFreeze" className="customerinfo charm-bold">Nombre de lots congelés</label>
                    <input id="nbFreeze" type="text" className="validate charm-regular" value={nbFreeze} onChange={(e) => setNbFreeze(e.target.value)} />
                </div>
                <div className='submit'>
                    <button className="btnSubmit" type="submit">Enregistrer</button>
                </div>
            </form>
          )}
      </div>
    );
}

export default ProductCreate;
