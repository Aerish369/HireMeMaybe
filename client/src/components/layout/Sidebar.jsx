import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Briefcase, 
  User, 
  FileText, 
  PlusCircle, 
  LayoutDashboard,
} from 'lucide-react';

const Sidebar = () => {
  const { isEmployer, isEmployee, isAuthenticated } = useAuth();

  if (!isAuthenticated()) return null;

  const linkClass = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive 
      ? 'bg-primary text-white' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-primary'
    }
  `;

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {isEmployer() && (
          <>
            <NavLink to="/employer/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/jobs/create" className={linkClass}>
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Post a Job</span>
            </NavLink>
            <NavLink to="/jobs" className={linkClass}>
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">All Jobs</span>
            </NavLink>
          </>
        )}

        {isEmployee() && (
          <>
            <NavLink to="/employee/dashboard" className={linkClass}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </NavLink>
            <NavLink to="/jobs" className={linkClass}>
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Browse Jobs</span>
            </NavLink>
            <NavLink to="/my-applications" className={linkClass}>
              <FileText className="w-5 h-5" />
              <span className="font-medium">My Applications</span>
            </NavLink>
          </>
        )}

        <div className="pt-4 mt-4 border-t border-gray-200">
          <NavLink to="/profile" className={linkClass}>
            <User className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
