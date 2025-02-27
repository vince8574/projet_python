import { Link } from "react-router-dom";
import home from "../assets/home.svg";
import question from "../assets/question.svg";

const Header = () => {
    return (
      <header className="flex justify-between items-center px-[128px] bg-[#B3C2F2] text-[#000] font-poppins w-full mt-auto">
        <ul className="flex items-center justify-between w-full">
          <li>
            <Link to="/">
              <img
                src={home}
                alt="home"
                className="w-12 h-12 ml-4"
              />
            </Link>
          </li>
          <li>
            <p className="text-center px-4 font-poppins font-bold text-[48px]">Save Food</p>
          </li>
          <li>
            <Link to="/apropos">
              <img
                src={question}
                alt="question"
                className="w-12 h-12 mr-4"/>
            </Link>
          </li>
        </ul>
      </header>
    );
  };
  
  export default Header;