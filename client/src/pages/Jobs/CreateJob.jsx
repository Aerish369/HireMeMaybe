import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import { toast } from 'sonner';
import { ArrowLeft, Save, X } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();

  // Initial form state with required_skills as empty array
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    required_skills: [], // <-- must be initialized as array
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Skills list fetched from backend, initialize as empty array
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    jobsAPI.getSkills()
      .then(res => {
        if (Array.isArray(res)) {
          setSkills(res);
        } else if (res.results) {
          // If paginated response with 'results' field
          setSkills(res.results);
        } else {
          setSkills([]);
        }
      })
      .catch(() => {
        toast.error("Failed to load skills");
        setSkills([]);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Add skill by ID from dropdown
  const addSkill = (skillId) => {
    if (skillId && !formData.required_skills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillId]
      }));
    }
  };

  // Remove skill by ID
  const removeSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(id => id !== skillId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.company_name.trim()) newErrors.company_name = 'Company is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await jobsAPI.createJob(formData);
      toast.success('Job posted successfully!');
      navigate(`/jobs/${result.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in bg-gray-50 rounded-xl shadow-sm">
      <Link
        to="/employer/dashboard"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Software Engineer"
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Job responsibilities, requirements, etc."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        {/* Company */}
        <Input
          label="Company"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          error={errors.company_name}
          placeholder="Acme Corp"
        />

        {/* Location */}
        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Kathmandu, Nepal"
        />

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Required Skills
          </label>

          {/* Display selected skills */}
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.required_skills.length > 0 ? (
              formData.required_skills.map(id => {
                const skill = skills.find(s => s.id === id);
                if (!skill) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1 bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(id)}
                      className="hover:text-red-600"
                      aria-label={`Remove skill ${skill.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </div>

          {/* Skills dropdown */}
          <select
            onChange={e => {
              const skillId = Number(e.target.value);
              if (!isNaN(skillId)) {
                addSkill(skillId);
              }
              e.target.value = '';
            }}
            className="w-full border rounded px-3 py-2"
            aria-label="Select skill to add"
          >
            <option value="">Select skill</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Link to="/employer/dashboard">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Post Job
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
