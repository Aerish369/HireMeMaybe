import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Input from '../../components/ui/input.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { formatRelativeTime, formatSalary, getJobTypeLabel, truncateText } from '../../utils/helpers';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2,
  ChevronRight
} from 'lucide-react';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.getJobs();
      setJobs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || 
                           job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-white text-black">
        <Loader size="lg" text="Loading jobs..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white text-black">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchJobs} variant="primary">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-white text-black animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Browse Jobs</h1>
        <p className="mt-2 text-gray-700">Find your next career opportunity</p>
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-black p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search jobs, companies, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
            />
          </div>
          <div>
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              leftIcon={<MapPin className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 text-gray-700">
        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
      </div>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
          <p className="text-gray-700">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-white rounded-xl border border-black p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Job Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold hover:text-black transition-colors">
                        {job.title}
                      </h2>
                      <p className="font-medium text-gray-700">{job.company || 'Company'}</p>
                    </div>
                  </div>

                  {/* Job Meta */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-700">
                    {job.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.job_type && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{getJobTypeLabel(job.job_type)}</span>
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                    )}
                    {job.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{formatRelativeTime(job.created_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  {job.description && (
                    <p className="mt-4 text-gray-700">{truncateText(job.description, 180)}</p>
                  )}

                  {/* Tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-2 py-1 rounded bg-gray-200 text-black text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center font-medium lg:self-center text-black">
                  <span className="hidden lg:inline mr-2">View Details</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
