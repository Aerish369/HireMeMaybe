import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { validateProfile, hasErrors } from '../../utils/validate';
import { parseError } from '../../utils/helpers';
import { User, Phone, MapPin, Briefcase, Building2, FileText, Save } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user, profile, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    bio: '',
    company_name: '',
    website: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        company_name: profile.company_name || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateProfile(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(parseError(result.error));
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-white text-black">
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  const isEmployer = profile?.role === 'employer';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white text-black animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-2 text-gray-700">Manage your personal information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-black shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="px-6 py-8 flex items-center gap-4 border-b border-black">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-10 h-10 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formData.first_name} {formData.last_name || user?.email?.split('@')[0]}</h2>
            <p className="text-gray-700">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-black">
              {isEmployer ? (
                <>
                  <Building2 className="w-3 h-3" /> Employer
                </>
              ) : (
                <>
                  <Briefcase className="w-3 h-3" /> Job Seeker
                </>
              )}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Your first name"
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Your last name"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+1 (555) 000-0000"
                leftIcon={<Phone className="w-5 h-5" />}
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                leftIcon={<MapPin className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> About
            </h3>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          {/* Company Information */}
          {isEmployer && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Your company name"
                />
                <Input
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-black">
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
