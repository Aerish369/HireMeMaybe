import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { applicationsAPI } from '../../api/applications';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { formatDate, formatSalary, getJobTypeLabel, parseError } from '../../utils/helpers';
import { toast } from 'sonner';
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Users
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

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getJob(id);
      setJob(data);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    setIsApplying(true);
    try {
      await applicationsAPI.applyToJob(id);
      setHasApplied(true);
      toast.success('Application submitted successfully!');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-white text-black">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white text-black">
        <div className="text-red-600 mb-4">{error || 'Job not found'}</div>
        <Link to="/jobs">
          <Button variant="primary">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white text-black animate-fade-in">
      {/* Back Button */}
      <Link 
        to="/jobs" 
        className="inline-flex items-center text-gray-700 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="rounded-xl border border-black overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">{job.title}</h1>
                <p className="text-lg text-gray-700 font-medium mt-1">{job.company || 'Company'}</p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  {job.location && (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.job_type && (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-1 rounded bg-gray-200 text-black text-xs">{getJobTypeLabel(job.job_type)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isOwner ? (
                <>
                  <Link to={`/jobs/${id}/edit`}>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              ) : isEmployee() ? (
                hasApplied ? (
                  <Button variant="accent" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={handleApply} loading={isApplying}>
                    <Send className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                )
              ) : !isAuthenticated() && (
                <Link to="/login">
                  <Button variant="primary" size="lg">
                    Sign in to Apply
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="p-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {(job.salary_min || job.salary_max) && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Salary</span>
                </div>
                <p className="font-semibold">{formatSalary(job.salary_min, job.salary_max)}</p>
              </div>
            )}
            {job.experience_level && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Experience</span>
                </div>
                <p className="font-semibold capitalize">{job.experience_level}</p>
              </div>
            )}
            {job.created_at && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted</span>
                </div>
                <p className="font-semibold">{formatDate(job.created_at)}</p>
              </div>
            )}
            {job.openings && (
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  <span>Openings</span>
                </div>
                <p className="font-semibold">{job.openings}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <div className="whitespace-pre-wrap text-gray-700">{job.description}</div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Requirements</h2>
              <div className="whitespace-pre-wrap text-gray-700">{job.requirements}</div>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 rounded bg-gray-200 text-black text-sm">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Company Info */}
          {job.company_description && (
            <div className="border-t border-black pt-8">
              <h2 className="text-xl font-semibold mb-4">About the Company</h2>
              <div className="whitespace-pre-wrap text-gray-700">{job.company_description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
