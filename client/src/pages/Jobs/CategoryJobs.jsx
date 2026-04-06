import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import Button from '../../components/ui/Buttons.jsx';
import Loader from '../../components/ui/Loader.jsx';
import { formatRelativeTime, truncateText } from '../../utils/helpers';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Tag,
  Briefcase,
} from 'lucide-react';

const PAGE_SIZE = 10;

const CategoryJobs = () => {
  const { categoryId } = useParams(); // 'none' or a numeric id
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
    resolveCategoryName();
  }, [categoryId]);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage, categoryId]);

  const resolveCategoryName = async () => {
    if (categoryId === 'none') {
      setCategoryName('Not Specified');
      return;
    }
    try {
      const categories = await jobsAPI.getCategories();
      const list = Array.isArray(categories) ? categories : categories.results || [];
      const found = list.find(c => String(c.id) === String(categoryId));
      setCategoryName(found?.name || 'Category');
    } catch {
      setCategoryName('Category');
    }
  };

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobsAPI.getJobs({
        category: categoryId,
        page,
      });

      if (data?.results) {
        setJobs(data.results);
        setTotalCount(data.count);
        setNextPage(data.next);
        setPrevPage(data.previous);
      } else {
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to load jobs. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader size="lg" text="Loading jobs..." />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-red-600 mb-4">{error}</p>
      <Button onClick={() => fetchJobs(currentPage)}>Try Again</Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Tag className="w-7 h-7 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
        </div>
        <p className="text-gray-500">
          {totalCount} {totalCount === 1 ? 'job' : 'jobs'} in this category
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs in this category</h3>
          <p className="text-gray-500 mb-4">Check back later or browse other categories.</p>
          <Link to="/jobs">
            <Button variant="primary">Browse All Jobs</Button>
          </Link>
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
                          <h2 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-gray-600 font-medium">{job.company_name}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} /> {job.location}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1">
                                <span className="text-xs font-semibold">NPR</span> {job.salary_range}
                              </span>
                            )}
                            {job.created_at && (
                              <span className="flex items-center gap-1">
                                <Clock size={14} /> {formatRelativeTime(job.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {job.description && (
                        <p className="mt-4 text-gray-600">{truncateText(job.description, 180)}</p>
                      )}

                      {job.required_skills && job.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.required_skills.slice(0, 5).map(skill => (
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

                    <div className="flex items-center text-indigo-600 font-medium lg:self-center">
                      <span className="hidden lg:inline mr-2">View Details</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={!prevPage}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                  .reduce((acc, page, idx, arr) => {
                    if (idx > 0 && page - arr[idx - 1] > 1) acc.push('...');
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

          <div className="text-center mt-4 text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryJobs;