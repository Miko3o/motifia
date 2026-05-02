import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 shadow-md z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="text-white font-bold text-xl">Motifia</div>
          <div className="space-x-6">
            <Link to="/" className="text-white hover:text-gray-300 transition-colors duration-200">Home</Link>
            <Link to="/grammar" className="text-white hover:text-gray-300 transition-colors duration-200">Grammar</Link>
            <Link to="/dictionary" className="text-white hover:text-gray-300 transition-colors duration-200">Dictionary</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
