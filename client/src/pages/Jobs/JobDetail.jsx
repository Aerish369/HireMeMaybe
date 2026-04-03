import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobsAPI } from "../../api/jobs";
import applicationsAPI from "../../api/applications";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Buttons.jsx";
import Loader from "../../components/ui/Loader.jsx";
import ApplyModal from "../../components/ApplyModel.jsx";
import { formatDate, getJobTypeLabel, parseError } from "../../utils/helpers";
import { toast } from "sonner";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Calendar,
  Users,
} from "lucide-react";

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
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await jobsAPI.getJob(id);
      setJob(data);

      if (isAuthenticated() && isEmployee()) {
        setHasApplied(!!data.applied);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Job not found");
      } else {
        setError("Failed to load job details");
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, isEmployee]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const openApplyModal = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (formData) => {
    setIsApplying(true);
    try {
      await applicationsAPI.applyToJob(id, {
        cover_letter: formData.get("cover_letter"),
        resume: formData.get("resume") || null,
      });
      toast.success("Application submitted successfully!");
      setHasApplied(true);
      setApplyModalOpen(false);
    } catch (err) {
      toast.error(parseError(err.response?.data));
    } finally {
      setIsApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setIsDeleting(true);
    try {
      await jobsAPI.deleteJob(id);
      toast.success("Job deleted successfully");
      navigate("/employer/dashboard");
    } catch (err) {
      toast.error(parseError(err.response?.data));
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = isEmployer() && job?.posted_by === profile?.user?.id;

  const renderActionButton = () => {
    if (isEmployee()) {
      return hasApplied ? (
        <Button disabled className="bg-green-600 text-white">
          <CheckCircle className="w-4 h-4 mr-2" /> Applied
        </Button>
      ) : (
        <Button onClick={openApplyModal}>
          <Send className="w-4 h-4 mr-2" /> Apply Now
        </Button>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error || "Job not found"}</p>
        <Link to="/jobs">
          <Button>Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="flex items-center text-gray-500 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
      </Link>

      <div className="bg-white border rounded-xl shadow">
        {/* Top Section */}
        <div className="p-6 border-b space-y-3">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded">
              <Building2 className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl text-gray-900 font-bold">{job.title}</h1>
              <p className="text-gray-600">{job.company_name}</p>
              <div className="flex gap-3 mt-2 text-sm text-gray-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {job.location}
                  </span>
                )}
                {job.job_type && (
                  <span className="bg-indigo-100 px-2 rounded">
                    {getJobTypeLabel(job.job_type)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Owner Buttons */}
          {isOwner && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-start gap-2 mt-4">
              <Link to={`/jobs/${job.id}/applications`}>
                <Button variant="outline" className="mb-2 md:mb-0">
                  View Applications
                </Button>
              </Link>
              <div className="flex gap-2">
                <Link to={`/jobs/${id}/edit`}>
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Employee Apply Button */}
          {!isOwner && renderActionButton()}
        </div>

        {/* Job Details Section */}
        <div className="p-6 text-gray-900 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {job.salary_range && (
              <InfoBox icon={<span className="text-sm font-semibold">NPR</span>} label="Salary Range">
                {job.salary_range}
              </InfoBox>
            )}

            {job.experience_level && (
              <InfoBox icon={<Briefcase />} label="Experience">
                {job.experience_level}
              </InfoBox>
            )}
            {job.created_at && (
              <InfoBox icon={<Calendar />} label="Posted">
                {formatDate(job.created_at)}
              </InfoBox>
            )}
            {job.openings && (
              <InfoBox icon={<Users />} label="Openings">
                {job.openings}
              </InfoBox>
            )}
          </div>

          <Section title="Job Description">{job.description}</Section>

          {job.required_skills && job.required_skills.length > 0 && (
            <Section title="Required Skills">
              <div className="flex flex-wrap gap-2 mt-2">
                {job.required_skills.map(skill => (
                  <span
                    key={skill.id}
                    className="px-2 py-1 text-xs font-medium rounded bg-indigo-200 text-indigo-800"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSubmit={handleApplySubmit}
        isSubmitting={isApplying}
        jobTitle={job.title}
      />
    </div>
  );
};

const InfoBox = ({ icon, label, children }) => (
  <div className="bg-indigo-50 p-4 rounded">
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {icon} {label}
    </div>
    <div className="font-semibold">{children}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <div className="text-gray-700">{children}</div>
  </div>
);

export default JobDetail;