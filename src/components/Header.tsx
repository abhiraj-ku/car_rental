import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Car, User } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-blue-600">
              <Car className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">CarRental</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition duration-200">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'owner' ? (
                  <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-600 transition duration-200">
                    My Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/customer/dashboard" className="text-gray-700 hover:text-blue-600 transition duration-200">
                      Find Cars
                    </Link>
                    <Link to="/my-bookings" className="text-gray-700 hover:text-blue-600 transition duration-200">
                      My Bookings
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition duration-200">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200">
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'owner' ? (
                    <Link 
                      to="/owner/dashboard" 
                      className="text-gray-700 hover:text-blue-600 transition duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link 
                        to="/customer/dashboard" 
                        className="text-gray-700 hover:text-blue-600 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Find Cars
                      </Link>
                      <Link 
                        to="/my-bookings" 
                        className="text-gray-700 hover:text-blue-600 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Bookings
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-blue-600 transition duration-200 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-blue-600 transition duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 inline-block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;