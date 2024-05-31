import {useNavigate, Navigate} from 'react-router-dom';



export function Introduction() {
      
    const Navigate = useNavigate(); 

    const handleScanner = () =>{
        Navigate("/scan");
    }
    const handleProduct = () =>{
      Navigate("/product");
    }

    
  
  
    return (
      <>
        <div className=''> 
          <h1 className="">Faites votre choix</h1>
          
            
              <div className="flex flex-wrap w-4/5">
                <button onClick={handleProduct} className='btn'>Nouveau produit</button>
                <button onClick={handleScanner} className='btn'>Sanner QRCODE</button>                
              </div>               
                          
        </div>
      </>
    );
}

export default Introduction;
