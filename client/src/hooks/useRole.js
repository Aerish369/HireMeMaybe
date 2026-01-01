import { useAuth } from './useAuth';

export const useRole = () => {
  const { profile, isEmployer, isEmployee } = useAuth();
  
  return {
    role: profile?.role || null,
    isEmployer: isEmployer(),
    isEmployee: isEmployee(),
    hasRole: (requiredRole) => profile?.role === requiredRole,
  };
};

export default useRole;
