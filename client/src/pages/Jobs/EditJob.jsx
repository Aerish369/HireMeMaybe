import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { validateJob, hasErrors } from '../../utils/validate';
import { parseError } from '../../utils/helpers';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
  Save,
  Building2
} from 'lucide-react';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'full_time',
    description: '',
    requirements: '',
    salary_min: '',
    salary_max: '',
    experience_level: 'mid',
    skills: '',
  });
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
        company: job.company || '',
        location: job.location || '',
        job_type: job.job_type || 'full_time',
        description: job.description || '',
        requirements: job.requirements || '',
        salary_min: job.salary_min || '',
        salary_max: job.salary_max || '',
        experience_level: job.experience_level || 'mid',
        skills: job.skills ? job.skills.join(', ') : '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateJob(formData);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      };

      await jobsAPI.updateJob(id, jobData);
      toast.success('Job updated successfully!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(parseError(err.response?.data) || 'Failed to update job');
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
    <div className="max-w-3xl mx-auto px-4 py-8 bg-white text-black animate-fade-in">
      {/* Back Button */}
      <Link 
        to={`/jobs/${id}`}
        className="inline-flex items-center text-gray-700 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Job
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Job</h1>
        <p className="mt-2 text-gray-700">Update job details</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-gray-100 rounded-xl border border-black overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Job Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <Input
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company name"
                leftIcon={<Building2 className="w-5 h-5" />}
              />
              <Input
                label="Location *"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={errors.location}
                placeholder="e.g. San Francisco, CA or Remote"
                leftIcon={<MapPin className="w-5 h-5" />}
              />
            </div>
          </div>

          {/* Job Type & Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Job Type</label>
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black focus:outline-none transition-all duration-200"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Experience Level</label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black focus:outline-none transition-all duration-200"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Manager</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minimum Salary (USD/year)"
                name="salary_min"
                type="number"
                value={formData.salary_min}
                onChange={handleChange}
                placeholder="e.g. 80000"
              />
              <Input
                label="Maximum Salary (USD/year)"
                name="salary_max"
                type="number"
                value={formData.salary_max}
                onChange={handleChange}
                placeholder="e.g. 120000"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border bg-white text-black placeholder:text-gray-500 focus:outline-none transition-all duration-200 resize-none`}
                  placeholder="Describe the role, responsibilities..."
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-black">{errors.description}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Requirements</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-black bg-white text-black placeholder:text-gray-500 focus:outline-none transition-all duration-200 resize-none"
                  placeholder="List the qualifications, skills, and experience required..."
                />
              </div>
              <div>
                <Input
                  label="Skills (comma-separated)"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, TypeScript, Node.js"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="px-6 py-4 border-t border-black flex justify-end gap-3 bg-gray-100">
          <Link to={`/jobs/${id}`}>
            <Button variant="ghost">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
