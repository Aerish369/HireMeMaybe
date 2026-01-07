import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import  applicationsAPI  from '../../api/applications';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Buttons.jsx';
import { formatRelativeTime } from '../../utils/helpers';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  ChevronRight,
  Building2,
  Search,
  ArrowRight
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { profile, user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsData, appsData] = await Promise.all([
        jobsAPI.getJobs(),
        applicationsAPI.getMyApplications(),
      ]);
      
      const jobsArray = Array.isArray(jobsData) ? jobsData : jobsData.results || [];
      const appsArray = Array.isArray(appsData) ? appsData : appsData.results || [];
      
      setRecentJobs(jobsArray.slice(0, 5));
      setApplications(appsArray);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const pendingApps = applications.filter(a => a.status === 'pending').length;
  const reviewedApps = applications.filter(a => a.status === 'reviewed' || a.status === 'shortlisted').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-gray-50">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">
          Welcome back, {profile?.first_name || user?.email?.split('@')[0]}!
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-black">Find Your Dream Job</h2>
        </div>
        <Link to="/jobs">
          <Button variant="primary" size="lg">
            <Search className="w-5 h-5 mr-2" />
            Browse Jobs
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-500">
              <Briefcase className="w-5 h-5 text-primary" />
              Latest Jobs
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentJobs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No jobs available at the moment
              </div>
            ) : (
              recentJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-gray-500">{job.title}</p>
                      <p className="text-sm text-gray-500 truncate">{job.company}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <Link className="font-medium text-sm flex items-center justify-center text-blue-500 hover:underline" to="/jobs">
              View all jobs
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-500">
              <FileText className="w-5 h-5 text-primary" />
              Recent Applications
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {applications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No applications yet
              </div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <Link
                  key={app.id}
                  to={`/jobs/${app.job?.id || app.job_id}`}
                  className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate text-gray-500">{app.job?.title || 'Job'}</p>
                      <p className="text-sm text-gray-500">{formatRelativeTime(app.applied_at)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-sm rounded border ${
                    app.status === 'pending'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : app.status === 'reviewed' || app.status === 'shortlisted'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-red-100 border-red-300 text-red-800'
                  }`}>
                    {app.status}
                  </span>
                </Link>
              ))
            )}
          </div>
          {applications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link to="/my-applications" className="font-medium text-sm flex items-center justify-center text-blue-500 hover:underline">
                View all applications
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
