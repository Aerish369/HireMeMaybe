import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import applicationsAPI from '../../api/applications';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import ApplyModal from '../../components/ApplyModel.jsx';
import { formatRelativeTime, getJobTypeLabel, truncateText, parseError } from '../../utils/helpers';
import { toast } from 'sonner';
import { Search, MapPin, Briefcase, Clock, Building2, ChevronRight, ChevronLeft } from 'lucide-react';

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

  // ✅ ADDED — pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchJobs(currentPage);
    if (isAuthenticated() && isEmployee()) {
      fetchMyApplications();
    }
  }, [currentPage]); // ✅ re-fetch when page changes

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      fetchJobs(1);
    }, 400);

    // Cleanup — cancels the previous timer if user types again before 400ms
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, locationFilter]);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await jobsAPI.getJobs({
        page,
        search: searchQuery,
        location: locationFilter,
      });

      // ✅ handle paginated response from DRF
      if (data?.results) {
        setJobs(data.results);
        setTotalCount(data.count);
        setNextPage(data.next);
        setPrevPage(data.previous);
      } else {
        // fallback if pagination is somehow not active
        setJobs(Array.isArray(data) ? data : []);
      }
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
          .map(app => app.job?.id || app.job?.pk)
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

  // ✅ total pages calculated from count
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader size="lg" text="Loading jobs..." />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-red-600 mb-4">{error}</div>
      <Button onClick={() => fetchJobs(currentPage)}>Try Again</Button>
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
        </div>
      </div>

      {/* ✅ total count from backend */}
      <div className="mb-6 text-gray-500">
        {totalCount} {totalCount === 1 ? 'job' : 'jobs'} found
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map(job => {
              const jobId = job.id || job.pk;
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
                        {job.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />{job.location}
                          </div>
                        )}
                        {job.job_type && (
                          <div className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-200 text-indigo-800">
                            {getJobTypeLabel(job.job_type)}
                          </div>
                        )}
                        {/* ✅ salary_range as plain string */}
                        {job.salary_range && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold">NPR</span> {job.salary_range}
                          </div>
                        )}
                        {/* ✅ category badge */}
                        {job.category && (
                          <div className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                            {job.category.name}
                          </div>
                        )}
                        {job.created_at && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> {formatRelativeTime(job.created_at)}
                          </div>
                        )}
                      </div>

                      {job.description && (
                        <p className="mt-4 text-gray-600">{truncateText(job.description, 180)}</p>
                      )}

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
                      <div className="flex items-center text-indigo-600 font-medium mt-1">
                        <span className="hidden lg:inline mr-2">View Details</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ✅ ADDED — Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={!prevPage}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {/* page numbers */}
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) {
                      acc.push('...');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                          currentPage === item
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )
                }
              </div>

              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!nextPage}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ✅ page indicator */}
          <div className="text-center mt-4 text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </>
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