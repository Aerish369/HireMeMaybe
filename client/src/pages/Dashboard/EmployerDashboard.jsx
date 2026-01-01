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
  Users, 
  Eye, 
  ChevronRight,
  Building2,
  MapPin,
  Edit,
  Trash2,
  ArrowRight
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
      const data = await jobsAPI.getJobs();
      const jobsArray = Array.isArray(data) ? data : data.results || [];
      setJobs(jobsArray);
    } catch (err) {
      console.error('Error fetching jobs:', err);
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
      <div className="flex items-center justify-center min-h-[50vh] bg-white text-black">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white text-black animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.first_name || user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-gray-700">
          Manage your job postings and find great talent
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-100 rounded-xl border border-black p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Active Jobs</p>
              <p className="text-3xl font-bold mt-1">{jobs.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl border border-black p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Total Views</p>
              <p className="text-3xl font-bold mt-1">
                {jobs.reduce((acc, job) => acc + (job.views || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl border border-black p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Total Applicants</p>
              <p className="text-3xl font-bold mt-1">
                {jobs.reduce((acc, job) => acc + (job.applicants_count || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="bg-gray-100 rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Ready to find great talent?</h2>
            <p className="text-gray-700">Post a new job and start receiving applications</p>
          </div>
          <Link to="/jobs/create">
            <Button variant="secondary" size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* My Jobs */}
      <div className="bg-gray-100 rounded-xl border border-black overflow-hidden shadow-sm">
        <div className="p-6 border-b border-black flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            My Job Postings
          </h2>
          <Link to="/jobs/create">
            <Button variant="ghost" size="sm">
              <PlusCircle className="w-4 h-4 mr-2" />
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
          <div className="divide-y divide-black">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{job.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
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
                    <span className="px-2 py-1 text-sm border border-black rounded">
                      {job.applicants_count} applicant{job.applicants_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  <Link 
                    to={`/jobs/${job.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-700" />
                  </Link>
                  <button
                    onClick={(e) => handleDelete(job.id, e)}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-700" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-700" />
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
