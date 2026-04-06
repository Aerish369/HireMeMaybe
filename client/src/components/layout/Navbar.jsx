import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { jobsAPI } from '../../api/jobs';
import Button from '../ui/Buttons.jsx';
import { Briefcase, User, LogOut, Menu, X, Building2, FileText, Sparkles, Tag, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout, isAuthenticated, isEmployer, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  // Fetch categories once on mount
  useEffect(() => {
    jobsAPI.getCategories()
      .then(res => {
        const list = Array.isArray(res) ? res : res.results || [];
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCategoryClick = () => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HireMeMaybe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/jobs"
              className="text-gray-500 hover:text-primary transition-colors font-medium"
            >
              Browse Jobs
            </Link>

            {/* ✅ Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCategoriesOpen(prev => !prev)}
                className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors font-medium"
              >
                <Tag className="w-4 h-4" />
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/jobs/category/${cat.id}`}
                      onClick={handleCategoryClick}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  {/* Not Specified category */}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      to="/jobs/category/none"
                      onClick={handleCategoryClick}
                      className="block px-4 py-2 text-sm text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      Not Specified
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated() && (
              <>
                {isEmployer() && (
                  <>
                    <Link
                      to="/employer/dashboard"
                      className="text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/jobs/create"
                      className="text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                      Post Job
                    </Link>
                  </>
                )}

                {isEmployee() && (
                  <>
                    <Link
                      to="/employee/dashboard"
                      className="text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/jobs/recommended"
                      className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                      <Sparkles className="w-4 h-4" />
                      Recommended
                    </Link>
                    <Link
                      to="/my-applications"
                      className="text-gray-500 hover:text-primary transition-colors font-medium"
                    >
                      My Applications
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated() ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{profile?.user?.first_name || user?.email?.split('@')[0]}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-primary">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-500 hover:text-primary">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-darkText" />
            ) : (
              <Menu className="w-6 h-6 text-darkText" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/jobs"
              className="block py-2 text-darkText font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>

            {/* ✅ Mobile Categories — collapsible */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(prev => !prev)}
                className="flex items-center gap-2 py-2 text-darkText font-medium w-full"
              >
                <Tag className="w-4 h-4" />
                Categories
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="pl-6 space-y-1 mt-1">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/jobs/category/${cat.id}`}
                      onClick={handleCategoryClick}
                      className="block py-1.5 text-sm text-gray-600 hover:text-indigo-600"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    to="/jobs/category/none"
                    onClick={handleCategoryClick}
                    className="block py-1.5 text-sm text-gray-400 hover:text-indigo-600"
                  >
                    Not Specified
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated() ? (
              <>
                {isEmployer() && (
                  <>
                    <Link
                      to="/employer/dashboard"
                      className="block py-2 text-darkText font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/jobs/create"
                      className="block py-2 text-darkText font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Post Job
                    </Link>
                  </>
                )}

                {isEmployee() && (
                  <>
                    <Link
                      to="/employee/dashboard"
                      className="block py-2 text-darkText font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/jobs/recommended"
                      className="block py-2 text-darkText font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Recommended Jobs
                    </Link>
                    <Link
                      to="/my-applications"
                      className="block py-2 text-darkText font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      My Applications
                    </Link>
                  </>
                )}

                <Link
                  to="/profile"
                  className="block py-2 text-darkText font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </Link>

                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center py-2 text-red-500 font-medium hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth className="text-gray-500 hover:text-primary">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;