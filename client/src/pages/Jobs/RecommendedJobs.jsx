import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Buttons.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { formatRelativeTime, truncateText } from '../../utils/helpers';
import { toast } from 'sonner';
import {
  Sparkles,
  MapPin,
  Clock,
  Building2,
  ChevronRight,
  Star,
} from 'lucide-react';

const RecommendedJobs = () => {
  const navigate = useNavigate();
  const { isEmployee, profile } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect non-employees away
    if (profile && !isEmployee()) {
      navigate('/jobs');
      return;
    }
    fetchRecommendedJobs();
  }, [profile]);

  const fetchRecommendedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobsAPI.getRecommendedJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.response?.status === 400) {
        // profile not set up yet
        setError(err.response.data?.detail || 'Complete your profile to get recommendations.');
      } else {
        setError('Failed to load recommendations. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Returns color class based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 50) return 'bg-indigo-100 text-indigo-700';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader size="lg" text="Finding your best matches..." />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
      <p className="text-gray-600 mb-4">{error}</p>
      {error.includes('profile') && (
        <Link to="/profile">
          <Button variant="primary">Complete Your Profile</Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Recommended Jobs</h1>
        </div>
        <p className="text-gray-600">
          Jobs matched to your skills and location: sorted by best match first.
        </p>
      </div>

      {/* Score legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          <span className="text-gray-600">80–100 pts — Strong match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          <span className="text-gray-600">50–79 pts — Good match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
          <span className="text-gray-600">Below 50 — Partial match</span>
        </div>
      </div>

      <div className="mb-6 text-gray-500">
        {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} matched your profile
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Sparkles className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-500 mb-4">
            Add more skills or update your location in your profile to get better recommendations.
          </p>
          <Link to="/profile">
            <Button variant="primary">Update Profile</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-indigo-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h2>
                        {/* Match score badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getScoreColor(job.match_score)}`}>
                          <Star className="w-3 h-3" />
                          {job.match_score} / 100
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium">{job.company_name}</p>
                      <div className="flex gap-3 mt-2 text-sm text-gray-500">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} /> {job.location}
                          </span>
                        )}
                        {job.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {formatRelativeTime(job.created_at)}
                          </span>
                        )}
                        {job.salary_range && (
                          <span className="flex items-center gap-1">
                            <span className="text-xs font-semibold">NPR</span> {job.salary_range}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {job.description && (
                    <p className="mt-4 text-gray-600">{truncateText(job.description, 180)}</p>
                  )}

                  {/* Matched skills highlighted */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {job.required_skills.slice(0, 6).map(skill => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 text-xs font-medium rounded bg-indigo-200 text-indigo-800"
                        >
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
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;