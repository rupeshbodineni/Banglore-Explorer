import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { MapPin, User as UserIcon, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="text-primary-600 h-8 w-8" />
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Bangalore<span className="text-primary-600">Explorer</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm shadow-primary-600/20"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
