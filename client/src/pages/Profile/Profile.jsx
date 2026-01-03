import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { validateProfile, hasErrors } from '../../utils/validate';
import { parseError } from '../../utils/helpers';
import { User, Phone, MapPin, Briefcase, Building2, FileText, Save, Calendar, Code } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient';

const Profile = () => {
  const { user, profile, updateProfile, loading, fetchProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    phone: '',
    birth_date: '',
    location: '',
    skills: [],
    experience: '',
    education: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setFormData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        role: user.role || 'employee',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills.map(s => s.id || s) : [],
        experience: profile.experience || '',
        education: profile.education || '',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const response = await axiosClient.get('/api/skills/');
        setAvailableSkills(response.data);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
        toast.error('Failed to load skills');
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateProfile(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone: formData.phone,
        birth_date: formData.birth_date || null,
        location: formData.location,
        skill_ids: formData.skills,
        experience: formData.experience,
        education: formData.education,
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
        if (fetchProfile) await fetchProfile();
      } else {
        toast.error(parseError(result.error));
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  const isEmployer = formData.role === 'employer';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="px-6 py-8 flex items-center gap-4 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-10 h-10 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{formData.first_name} {formData.last_name || formData.username}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {isEmployer ? <><Building2 className="w-3 h-3" /> Employer</> : <><Briefcase className="w-3 h-3" /> Job Seeker</>}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <User className="w-5 h-5" /> Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="Your username"
                required
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  <option value="">Select role</option>
                  <option value="employee">Employee</option>
                  <option value="employer">Employer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <User className="w-5 h-5" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Your first name" />
              <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Your last name" />
              <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="+1 (555) 000-0000" leftIcon={<Phone className="w-5 h-5 text-indigo-600" />} />
              <Input label="Birth Date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} leftIcon={<Calendar className="w-5 h-5 text-indigo-600" />} />
              <div className="md:col-span-2">
                <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="City, Country" leftIcon={<MapPin className="w-5 h-5 text-indigo-600" />} />
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Briefcase className="w-5 h-5" /> Experience
            </h3>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              placeholder="Describe your work experience..."
            />
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <Code className="w-5 h-5" /> Skills
            </h3>
            {loadingSkills ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="sm" text="Loading skills..." />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSkills.length > 0 ? (
                  availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => handleSkillToggle(skill.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        formData.skills.includes(skill.id)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No skills available. Contact admin to add skills.</p>
                )}
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
              <FileText className="w-5 h-5" /> Education
            </h3>
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
              placeholder="Describe your educational background..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Save className="w-5 h-5 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
