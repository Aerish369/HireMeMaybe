import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { toast } from 'sonner';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    required_skills: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const job = await jobsAPI.getJob(id);
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company: job.company_name || '',
        location: job.location || '',
        required_skills: job.required_skills?.map(s => s.name) || [],
      });
    } catch (err) {
      toast.error('Failed to load job details');
      navigate('/employer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.required_skills.includes(skill)) {
      setFormData(prev => ({ ...prev, required_skills: [...prev.required_skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s !== skill)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects 'required_skills' array for JobCreateSerializer
      const jobData = {
        title: formData.title,
        description: formData.description,
        company_name: formData.company,
        location: formData.location,
        required_skills: formData.required_skills,
      };

      await jobsAPI.updateJob(id, jobData);
      toast.success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" text="Loading job..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-gray-50 rounded-xl shadow-sm animate-fade-in">
      <Link to="/employer/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-y ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        <Input
          label="Company *"
          name="company"
          value={formData.company}
          onChange={handleChange}
          error={errors.company}
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-2">Required Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.required_skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-sm">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyPress={handleSkillKeyPress}
              placeholder="Add skill"
            />
            <button type="button" onClick={addSkill} className="flex items-center px-2 text-primary hover:text-primary/80">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link to="/employer/dashboard">
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
