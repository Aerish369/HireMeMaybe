import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import  applicationsAPI  from '../../api/applications';
import Loader from '../../components/ui/Loader.jsx';
import Button from '../../components/ui/Buttons.jsx';
import { formatRelativeTime, getApplicationStatus } from '../../utils/helpers';
import { 
  FileText, 
  Building2, 
  MapPin, 
  Calendar,
  ChevronRight
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationsAPI.getMyApplications();
      setApplications(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-white">
        <Loader size="lg" text="Loading applications..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchApplications} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-white animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-darkText">My Applications</h1>
        <p className="mt-2 text-gray-500">
          Track the status of your job applications
        </p>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-darkText mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-6">
            Start exploring jobs and submit your first application
          </p>
          <Link to="/jobs">
            <Button variant="primary">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => {
            const status = getApplicationStatus(application.status);
            const job = application.job || {};
            
            return (
              <div
                key={application.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {/* Job Header */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-gray-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/jobs/${job.id || application.job_id}`}
                          className="text-lg font-semibold text-darkText hover:text-primary transition-colors"
                        >
                          {job.title || 'Job Title'}
                        </Link>
                        <p className="text-gray-500">{job.company || 'Company'}</p>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                      {job.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {application.applied_at && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Applied {formatRelativeTime(application.applied_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      status.color === 'green' ? 'bg-green-100 text-green-800' :
                      status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {status.label}
                    </span>
                    <Link 
                      to={`/jobs/${job.id || application.job_id}`}
                      className="text-gray-700 font-medium flex items-center hover:text-primary"
                    >
                      <span className="hidden lg:inline mr-1">View</span>
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
