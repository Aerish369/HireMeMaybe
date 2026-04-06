import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Buttons.jsx';
import { formatRelativeTime } from '../../utils/helpers';
import { toast } from 'sonner';
import { 
  Briefcase, 
  PlusCircle, 
  Building2,
  MapPin,
  ChevronRight
} from 'lucide-react';

const EmployerDashboard = () => {
  const { profile, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    setLoading(true);
    try {
      // ✅ FIXED — dedicated endpoint returns ALL jobs by this employer
      // no pagination, no is_active filter, no client-side filtering needed
      const data = await jobsAPI.getMyJobs();
      const jobsArray = Array.isArray(data) ? data : data.results || [];
      setJobs(jobsArray);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobsAPI.deleteJob(jobId);
      setJobs(jobs.filter(j => j.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Welcome back, {profile?.user?.first_name || user?.email?.split('@')[0]}!
        </h1>
      </div>

      {/* Quick Action */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Ready to find great talent?</h2>
        </div>
        <Link to="/jobs/create">
          <Button variant="primary" size="lg">
            <PlusCircle className="w-5 h-5 mr-2" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* My Jobs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-black">
            <Briefcase className="w-5 h-5 text-primary" />
            My Job Postings
            {/* ✅ show total count */}
            {jobs.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-sm bg-indigo-100 text-indigo-700 rounded-full">
                {jobs.length}
              </span>
            )}
          </h2>
          <Link to="/jobs/create">
            <Button variant="ghost" size="sm">
              <PlusCircle className="w-4 h-4 mr-2 text-black" />
              Add New
            </Button>
          </Link>
        </div>
        
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs posted yet</h3>
            <p className="text-gray-700 mb-6">
              Create your first job posting to start receiving applications
            </p>
            <Link to="/jobs/create">
              <Button variant="primary">
                <PlusCircle className="w-5 h-5 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate text-black">{job.title}</p>
                      {/* ✅ show inactive badge so employer knows which jobs are inactive */}
                      {!job.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full flex-shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      )}
                      <span>{formatRelativeTime(job.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.applicants_count > 0 && (
                    <span className="px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100">
                      {job.applicants_count} applicant{job.applicants_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;