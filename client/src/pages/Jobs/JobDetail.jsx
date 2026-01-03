import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import applicationsAPI from '../../api/applications'; // updated import
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ApplyModal from '../../components/ApplyModel.jsx';
import { formatDate, formatSalary, getJobTypeLabel, parseError } from '../../utils/helpers';
import { toast } from 'sonner';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Calendar,
  Users,
  Globe
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isEmployee, isEmployer, profile } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getJob(id);
      setJob(data);

      // check if employee has applied
      if (isAuthenticated() && isEmployee()) {
        try {
          const applicationStatus = await applicationsAPI.getApplicationStatus(id);
          setHasApplied(!!applicationStatus?.applied);
        } catch {
          setHasApplied(false);
        }
      }
    } catch (err) {
      setError('Failed to load job details');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const openApplyModal = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setApplyModalOpen(true);
  };

  // 🔥 handleApplySubmit updated for cover_letter + resume
  const handleApplySubmit = async (formData) => {
    setIsApplying(true);

    try {
      await applicationsAPI.applyToJob(id, {
        cover_letter: formData.get('cover_letter'),
        resume: formData.get('resume') || null,
      });
      setHasApplied(true);
      toast.success('Application submitted successfully!');
      setApplyModalOpen(false);
    } catch (err) {
      toast.error(parseError(err.response?.data) || 'Failed to submit application');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    setIsDeleting(true);
    try {
      await jobsAPI.deleteJob(id);
      toast.success('Job deleted successfully');
      navigate('/employer/dashboard');
    } catch (err) {
      toast.error(parseError(err.response?.data) || 'Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = isEmployer() && job?.owner === profile?.user;

  const renderActionButton = () => {
    if (isOwner) {
      return (
        <>
          <Link to={`/jobs/${id}/edit`}>
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            loading={isDeleting} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </>
      );
    }

    if (isEmployee()) {
      return hasApplied ? (
        <Button variant="accent" disabled className="bg-green-600 text-white">
          <CheckCircle className="w-4 h-4 mr-2" /> Applied
        </Button>
      ) : (
        <Button variant="primary" size="lg" onClick={openApplyModal} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Send className="w-4 h-4 mr-2" /> Apply Now
        </Button>
      );
    }

    return !isAuthenticated() && (
      <Link to="/login">
        <Button variant="primary" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Sign in to Apply
        </Button>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">{error || 'Job not found'}</div>
        <Link to="/jobs">
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <Link 
        to="/jobs" 
        className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-200 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-indigo-700" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-lg text-gray-600 font-medium mt-1">{job.company || 'Company'}</p>
                
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.job_type && (
                    <div className="px-2 py-1 text-xs font-medium rounded bg-indigo-200 text-indigo-800">
                      {getJobTypeLabel(job.job_type)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">{renderActionButton()}</div>
          </div>
        </div>

        {/* Job Details */}
        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(job.salary_min || job.salary_max) && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <DollarSign className="w-4 h-4" /> Salary
                </div>
                <p className="font-semibold text-gray-900">{formatSalary(job.salary_min, job.salary_max)}</p>
              </div>
            )}
            {job.experience_level && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Briefcase className="w-4 h-4" /> Experience
                </div>
                <p className="font-semibold text-gray-900 capitalize">{job.experience_level}</p>
              </div>
            )}
            {job.created_at && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar className="w-4 h-4" /> Posted
                </div>
                <p className="font-semibold text-gray-900">{formatDate(job.created_at)}</p>
              </div>
            )}
            {job.openings && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="w-4 h-4" /> Openings
                </div>
                <p className="font-semibold text-gray-900">{job.openings}</p>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 text-xs font-medium rounded bg-indigo-200 text-indigo-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          {job.company_description && (
            <div className="border-t border-gray-300 pt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                {job.company_description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
        isSubmitting={isApplying}
        jobTitle={job?.title}
      />
    </div>
  );
};

export default JobDetail;
