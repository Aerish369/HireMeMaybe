import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { toast } from 'sonner';
import { ArrowLeft, Save, X } from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    required_skills: [],
    salary_range: '',         // ✅ ADDED
  });

  const [skills, setSkills] = useState([]);  // ✅ ADDED — for skill dropdown
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJob();
    // ✅ ADDED — fetch all skills for the dropdown
    jobsAPI.getSkills()
      .then(res => {
        if (Array.isArray(res)) setSkills(res);
        else if (res?.results) setSkills(res.results);
        else setSkills([]);
      })
      .catch(() => toast.error('Failed to load skills'));
  }, [id]);

  const fetchJob = async () => {
    try {
      const job = await jobsAPI.getJob(id);
      setFormData({
        title: job.title || '',
        description: job.description || '',
        company: job.company_name || '',
        location: job.location || '',
        required_skills: job.required_skills?.map(s => s.id) || [],  // ✅ FIXED — IDs not names
        salary_range: job.salary_range || '',                          // ✅ ADDED
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

  // ✅ FIXED — works with skill IDs
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
    if (!formData.company.trim()) newErrors.company = 'Company is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        company_name: formData.company,
        location: formData.location,
        required_skills: formData.required_skills.map(Number),
        salary_range: formData.salary_range,  // ✅ ADDED
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

      <h1 className="text-2xl font-bold mb-6 text-black">Edit Job</h1>

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

        {/* ✅ ADDED — Salary Range */}
        <Input
          label="Salary Range"
          name="salary_range"
          value={formData.salary_range}
          onChange={handleChange}
          placeholder="e.g. 50,000 - 80,000 NPR"
        />

        {/* ✅ FIXED — Skills using dropdown + IDs */}
        <div>
          <label className="block text-sm text-gray-900 font-medium mb-2">Required Skills</label>

          <div className="flex flex-wrap gap-2 mb-2">
            {formData.required_skills.length ? (
              formData.required_skills.map(id => {
                const skill = skills.find(s => s.id === id);
                return (
                  <span key={id} className="flex items-center gap-1 bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-sm">
                    {skill?.name}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(id)} />
                  </span>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No skills selected</p>
            )}
          </div>

          <select
            className="w-full border text-gray-900 rounded px-3 py-2"
            onChange={(e) => {
              const id = Number(e.target.value);
              if (id && !formData.required_skills.includes(id)) {
                setFormData(prev => ({
                  ...prev,
                  required_skills: [...prev.required_skills, id]
                }));
              }
              e.target.value = '';
            }}
          >
            <option value="">Add a skill</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>{skill.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4 text-black">
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