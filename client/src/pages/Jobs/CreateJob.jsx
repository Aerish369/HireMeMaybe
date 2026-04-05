import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import { toast } from 'sonner';
import { ArrowLeft, Save, X } from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    location: '',
    required_skills: [],
    salary_range: '',
    category: '',   // ✅ ADDED
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);  // ✅ ADDED

  useEffect(() => {
    // Fetch skills
    jobsAPI.getSkills()
      .then(res => {
        if (Array.isArray(res)) setSkills(res);
        else if (res?.results) setSkills(res.results);
        else setSkills([]);
      })
      .catch(() => toast.error('Failed to load skills'));

    // ✅ ADDED — Fetch categories
    jobsAPI.getCategories()
      .then(res => {
        if (Array.isArray(res)) setCategories(res);
        else if (res?.results) setCategories(res.results);
        else setCategories([]);
      })
      .catch(() => toast.error('Failed to load categories'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const addSkill = (skillId) => {
    if (skillId && !formData.required_skills.includes(skillId)) {
      setFormData(prev => ({
        ...prev,
        required_skills: [...prev.required_skills, skillId],
      }));
    }
  };

  const removeSkill = (skillId) => {
    setFormData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(id => id !== skillId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.company_name.trim()) newErrors.company_name = 'Company is required';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        company_name: formData.company_name,
        location: formData.location,
        required_skills: formData.required_skills.map(Number),
        salary_range: formData.salary_range,
        category: formData.category ? Number(formData.category) : null,  // ✅ ADDED
      };

      await jobsAPI.createJob(payload);
      toast.success('Job posted successfully!');
      navigate('/jobs');
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to create job'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-gray-50 rounded-xl shadow-sm">
      <Link
        to="/employer/dashboard"
        className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Software Engineer"
        />

        <div>
          <label className="block text-sm text-gray-900 font-medium mb-2">Description</label>
          <textarea
            name="description"
            rows={6}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Job responsibilities, requirements, etc."
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <Input
          label="Company"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          error={errors.company_name}
          placeholder="Acme Corp"
        />

        <Input
          label="Salary Range"
          name="salary_range"
          value={formData.salary_range}
          onChange={handleChange}
          placeholder="e.g. 50,000 - 80,000 NPR"
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Kathmandu, Nepal"
        />

        {/* ✅ ADDED — Category dropdown */}
        <div>
          <label className="block text-sm text-gray-900 font-medium mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border text-gray-900 rounded px-3 py-2"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm text-gray-900 font-medium mb-2">Required Skills</label>

          <div className="flex flex-wrap gap-2 mb-2">
            {formData.required_skills.length ? (
              formData.required_skills.map(id => {
                const skill = skills.find(s => s.id === id);
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-sm"
                  >
                    {skill?.name}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => removeSkill(id)}
                    />
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
              if (id) addSkill(id);
              e.target.value = '';
            }}
          >
            <option value="">Select skill</option>
            {skills.map(skill => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex text-gray-900 gap-3 pt-4">
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