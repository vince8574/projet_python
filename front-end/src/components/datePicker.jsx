import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import fr from 'date-fns/locale/fr';

const MyDatePicker = ({selectedDate, setSelectedDate}) => {
  
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  
  return (
    <div>
          
      <DatePicker
        className='flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400'
        locale={fr}
        selected={selectedDate}
        value={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        isClearable
        placeholderText="Sélectionnez une date"
        
      />
    
      
    </div>
  );
}

export default MyDatePicker;
