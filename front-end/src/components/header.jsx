import { Link } from "react-router-dom";
import home from "../assets/home.svg";
import question from "../assets/question.svg";

const Header = () => {
    return (
      <header className="flex justify-between items-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-2 bg-[#B3C2F2] text-[#000] font-poppins w-full mt-auto shadow-md">
        <ul className="flex items-center justify-between w-full">
          <li>
            <Link to="/">
              <img
                src={home}
                alt="home"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-transform hover:scale-110"
              />
            </Link>
          </li>
          <li>
            <p className="text-center px-2 sm:px-4 font-poppins font-bold text-xl sm:text-2xl md:text-3xl">Save Food</p>
          </li>
          <li>
            <Link to="/apropos">
              <img
                src={question}
                alt="question"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-transform hover:scale-110"/>
            </Link>
          </li>
        </ul>
      </header>
    );
  };
  
  export default Header;