import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import { validateLogin, hasErrors } from '../../utils/validate';
import { parseError } from '../../utils/helpers';
import { Briefcase, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLogin(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    const result = await login(formData);
    
    if (result.success) {
      navigate('/jobs');
    } else {
      setApiError(parseError(result.error));
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex bg-white text-black">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold">JobPortal</span>
            </Link>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-gray-700">
              Sign in to your account to continue
            </p>
          </div>

          {apiError && (
            <div className="mb-6 p-4 rounded-lg border border-black bg-gray-100 text-black text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
              leftIcon={<Lock className="w-5 h-5" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
            >
              Sign In
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-700">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-white text-black">
        <div className="text-center">
          <Briefcase className="w-20 h-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Find Your Dream Job</h2>
          <p className="text-lg opacity-90 max-w-md">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
