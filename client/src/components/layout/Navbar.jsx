import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Buttons.jsx';
import { Briefcase, User, LogOut, Menu, X, Building2, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, profile, logout, isAuthenticated, isEmployer, isEmployee } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/jobs" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Browse Jobs
            </Link>
            
            {isAuthenticated() && (
              <>
                {isEmployer() && (
                  <>
                    <Link 
                      to="/employer/dashboard" 
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/jobs/create" 
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Post Job
                    </Link>
                  </>
                )}
                
                {isEmployee() && (
                  <>
                    <Link 
                      to="/employee/dashboard" 
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/my-applications" 
                      className="text-muted-foreground hover:text-foreground transition-colors font-medium"
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
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{profile?.first_name || user?.email?.split('@')[0]}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
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
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <Link 
              to="/jobs" 
              className="block py-2 text-foreground font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Jobs
            </Link>
            
            {isAuthenticated() ? (
              <>
                {isEmployer() && (
                  <>
                    <Link 
                      to="/employer/dashboard" 
                      className="block py-2 text-foreground font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/jobs/create" 
                      className="block py-2 text-foreground font-medium"
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
                      className="block py-2 text-foreground font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/my-applications" 
                      className="block py-2 text-foreground font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      My Applications
                    </Link>
                  </>
                )}
                
                <Link 
                  to="/profile" 
                  className="block py-2 text-foreground font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center py-2 text-destructive font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth>Log In</Button>
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
