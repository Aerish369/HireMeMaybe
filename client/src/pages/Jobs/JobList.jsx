import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import applicationsAPI from '../../api/applications';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ApplyModal from '../../components/ApplyModel.jsx';
import { formatRelativeTime, formatSalary, getJobTypeLabel, truncateText, parseError } from '../../utils/helpers';
import { toast } from 'sonner';
import { Search, MapPin, Briefcase, Clock, DollarSign, Building2, ChevronRight, Send, CheckCircle } from 'lucide-react';

const JobList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isEmployee } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingTo, setApplyingTo] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
    if (isAuthenticated() && isEmployee()) {
      fetchMyApplications();
    }
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getJobs();
      console.log("Jobs fetched:", data); // 🔹 check backend field names
      const jobList = Array.isArray(data) ? data : data.results || [];
      setJobs(jobList);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const applications = await applicationsAPI.getMyApplications();
      const appliedJobIds = new Set(
        (Array.isArray(applications) ? applications : applications.results || [])
          .map(app => app.job?.id || app.job?.pk) // 🔹 fallback pk
      );
      setAppliedJobs(appliedJobIds);
    } catch {
      console.log('Could not fetch applications');
    }
  };

  const openApplyModal = (e, job) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (file) => {
    if (!selectedJob) return;

    setApplyingTo(selectedJob.id || selectedJob.pk);
    try {
      await applicationsAPI.applyToJob(selectedJob.id || selectedJob.pk, file);
      setAppliedJobs(prev => new Set([...prev, selectedJob.id || selectedJob.pk]));
      toast.success('Application submitted successfully!');
      setApplyModalOpen(false);
      setSelectedJob(null);
    } catch (err) {
      toast.error(parseError(err.response?.data) || 'Failed to apply');
    } finally {
      setApplyingTo(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader size="lg" text="Loading jobs..." />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-red-600 mb-4">{error}</div>
      <Button onClick={fetchJobs}>Try Again</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="mt-2 text-gray-600">Find your next career opportunity</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-300 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search jobs, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5 text-indigo-600" />}
            />
          </div>
          <div>
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              leftIcon={<MapPin className="w-5 h-5 text-indigo-600" />}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 text-gray-500">{filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found</div>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => {
            const jobId = job.id || job.pk; // 🔹 ensure ID exists
            return (
            <Link
              key={jobId}
              to={`/jobs/${jobId}`}
              className="block bg-white rounded-xl border border-gray-300 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-indigo-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{job.title}</h2>
                      <p className="text-gray-600 font-medium">{job.company_name || 'Company'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    {job.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.location}</div>}
                    {job.job_type && <div className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-200 text-indigo-800">{getJobTypeLabel(job.job_type)}</div>}
                    {(job.salary_min || job.salary_max) && <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {formatSalary(job.salary_min, job.salary_max)}</div>}
                    {job.created_at && <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatRelativeTime(job.created_at)}</div>}
                  </div>

                  {job.description && <p className="mt-4 text-gray-600">{truncateText(job.description, 180)}</p>}

                  {job.required_skills && job.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.required_skills.slice(0, 5).map(skill => (
                  <span key={skill.id} className="px-2 py-1 text-xs font-medium rounded bg-indigo-200 text-indigo-800">
                  {skill.name}
                  </span>
                  ))}
                </div>
                )}

                </div>

                <div className="flex flex-col gap-2 lg:self-center items-end">
                  {/* {isEmployee() && (
                    appliedJobs.has(jobId) ? (
                      <Button variant="accent" size="sm" disabled className="bg-green-600 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" /> Applied
                      </Button>
                    ) : (
                      <Button variant="primary" size="sm" onClick={(e) => openApplyModal(e, job)} loading={applyingTo === jobId} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Send className="w-4 h-4 mr-1" /> Apply
                      </Button>
                    )
                  )}
                  {!isAuthenticated() && (
                    <Button variant="primary" size="sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/login'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Send className="w-4 h-4 mr-1" /> Apply
                    </Button>
                  )} */}
                  <div className="flex items-center text-indigo-600 font-medium mt-1">
                    <span className="hidden lg:inline mr-2">View Details</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>
      )}

      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => { setApplyModalOpen(false); setSelectedJob(null); }}
        onSubmit={handleApplySubmit}
        isSubmitting={applyingTo !== null}
        jobTitle={selectedJob?.title}
      />
    </div>
  );
};

export default JobList;
