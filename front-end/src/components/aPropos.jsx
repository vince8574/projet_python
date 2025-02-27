import mail from '../assets/mail.svg';
import linkedin from '../assets/linkedin.svg'; 
import github from '../assets/github.svg';

const Apropos = () => {
    return (
        <div className='flex flex-col items-center gap-8'>
            <h1 className="text-center font-bold text-4xl uppercase">a propos</h1>
            <div className="rounded-lg bg-white shadow-lg w-full max-w-5xl p-8 md:px-16 md:py-8 mt-8 font-poppins text-[24px]">
                <p>Cette application a été créé par Vincent Gaillard dans le but d’aider à la gestion des marchandises au sein d’un restaurant.</p>
                <p>Le front end a été développé en React.JS, Vite et Tailwind css.</p>
                <p>Le back end a été développé en Python avec une architecture MVC et une base de donnée NoSQL sous Firebase.</p>
                <p>Cette application reste en perpétuelle évolution.</p>
            </div>
            <div className='flex flex-row justify-center gap-4'>
                <a href="mailto:vgaillard85@gmail.com" className="flex items-center gap-2">
                    <img src={mail} alt="Mail" className="h-[100px]" />
                    
                </a>
                        
                <a href="https://www.linkedin.com/in/vincent-gaillard-164776287" target="_blank" rel="noopener noreferrer">
                    <img src={linkedin} alt="LinkedIn" className='h-[100px]' />
                </a>
                <a href="https://github.com/vince8574" target="_blank" rel="noopener noreferrer">
                    <img src={github} alt="GitHub" className='h-[100px]' />
                </a>
                        
            </div>
        </div>
    );
};
export default Apropos; 