import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jobsAPI } from "../../api/jobs"; // Make sure this points to the correct src/api/jobs.js
import applicationsAPI from "../../api/applications";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/ui/Buttons.jsx";
import Loader from "../../components/ui/Loader.jsx";
import ApplyModal from "../../components/ApplyModel.jsx";
import { formatDate, formatSalary, getJobTypeLabel, parseError } from "../../utils/helpers";
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
  const { id } = useParams(); // ✅ Ensure route is /jobs/:id
  const navigate = useNavigate();
  const { isAuthenticated, isEmployee, isEmployer, profile } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // ✅ Fetch job details safely
  const fetchJobDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      // Make sure your jobsAPI.getJob adds trailing slash if DRF expects it
      const data = await jobsAPI.getJob(id); 
      setJob(data);

      // Check if employee has applied
      if (isAuthenticated() && isEmployee()) {
        try {
          const status = await applicationsAPI.getApplicationStatus(id);
          setHasApplied(!!status?.applied);
        } catch {
          setHasApplied(false);
        }
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

  // ✅ Open apply modal
  const openApplyModal = () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setApplyModalOpen(true);
  };

  // ✅ Submit application
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

  // ✅ Delete job (employer only)
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
    if (isOwner) {
      return (
        <div className="flex gap-3">
          <Link to={`/jobs/${id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} loading={isDeleting}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      );
    }

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

  // ⏳ Loading
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" text="Loading job details..." />
      </div>
    );
  }

  // ❌ Error
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

      {isOwner && (
        <Link to={`/jobs/${job.id}/applications`}>
          <Button variant="outline">View Applications</Button>
        </Link>
      )}



      <div className="bg-white border rounded-xl shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-14 bg-indigo-100 flex items-center justify-center rounded">
                <Building2 className="text-indigo-600" />
              </div>
              <div>
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
            {renderActionButton()}
          </div>
        </div>

        <div className="p-6  text-gray-900 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(job.salary_min || job.salary_max) && (
              <InfoBox icon={<DollarSign />} label="Salary">
                {formatSalary(job.salary_min, job.salary_max)}
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
          {job.requirements && (
            <Section title="Requirements">{job.requirements}</Section>
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

// 🔹 Small reusable components
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
    <p className="text-gray-700 whitespace-pre-wrap">{children}</p>
  </div>
);

export default JobDetail;
