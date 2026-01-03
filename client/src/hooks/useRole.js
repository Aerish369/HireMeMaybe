import { useAuth } from './useAuth';

export const useRole = () => {
  const { getRole, isEmployer, isEmployee } = useAuth();

  const role = getRole();

  return {
    role,
    isEmployer: isEmployer(),
    isEmployee: isEmployee(),
    hasRole: (requiredRole) => role === requiredRole,
  };
};

export default useRole;