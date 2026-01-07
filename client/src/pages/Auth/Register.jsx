import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import { validateRegistration, hasErrors } from '../../utils/validate';
import { parseError } from '../../utils/helpers';
import {
  Briefcase,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateRegistration(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/jobs');
      } else {
        setApiError(parseError(result.error));
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 bg-blue-500 text-white rounded-l-3xl">
        <div className="text-center">
          <Briefcase className="w-20 h-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-lg opacity-90 max-w-md">
            Whether you're looking for talent or opportunity, we've got you
            covered.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-black">HireMeMaybe</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-gray-600">Join our community</p>

          {apiError && (
            <div className="mt-4 p-3 rounded bg-red-50 border border-red-300 text-red-700 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm text-gray-900 font-medium mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'employee' }))}
                  className={`p-4 rounded-lg border-2 flex justify-center gap-2 font-medium transition ${
                    formData.role === 'employee'
                      ? 'border-primary bg-blue-500 text-primary'
                      : 'border-gray-300 text-gray-900 hover:bg-primary/5'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Employee
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: 'employer' }))}
                  className={`p-4 rounded-lg border-2 flex justify-center gap-2 font-medium transition ${
                    formData.role === 'employer'
                      ? 'border-primary bg-blue-500 text-primary'
                      : 'border-gray-300 text-gray-900 hover:bg-primary/5'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  Employer
                </button>
              </div>
            </div>

            {/* Username */}
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="john_doe"
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
            />

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="At least 8 characters"
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              variant="primary"
              loading={isSubmitting}
            >
              Create Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <p className="mt-8 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
