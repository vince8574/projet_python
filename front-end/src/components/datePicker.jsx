import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from 'date-fns/locale/fr';

export function MyDatePicker({selectedDate, setSelectedDate}) {
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  return (
    <div>
          
      <DatePicker
        className='validate charm-bold'
        locale={fr}
        selected={selectedDate}
        value={selectedDate}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        isClearable
        placeholderText="Sélectionnez une date"
        
      />
    
      
    </div>
  );
}

export default MyDatePicker;
