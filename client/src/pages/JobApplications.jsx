import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationsAPI from '../api/applications.js';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import Button from '../components/ui/Buttons.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { useToast } from '../hooks/use-toast';
import { Loader2, ArrowLeft, User, Clock, FileText, Mail } from 'lucide-react';
import { useParams } from 'react-router-dom';



const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  reviewed: 'bg-info/10 text-info border-info/20',
  accepted: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const JobApplications = () => {
  const { id } = useParams();
  // const { user } = useAuth();
  const { profile, isEmployer } = useAuth();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Redirect if not employer
  useEffect(() => {
    if (profile && !isEmployer()) {
      navigate('/jobs');
    }
  }, [profile, isEmployer, navigate]);


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const applicationsData = await applicationsAPI.getJobApplications(id);
        setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.results || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch applications',
          variant: 'destructive',
        });
        navigate('/my-jobs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, [toast, navigate]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await applicationsAPI.updateStatus(applicationId, newStatus);
      setApplications(applications.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      toast({
        title: 'Status updated',
        description: `Application status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <h1 className="text-3xl font-bold text-foreground">All Job Applications</h1>

      {applications.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground">No applications received yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id} className="animate-fade-in">
              <CardHeader className="pb-3 flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {application.applicant.first_name || application.applicant.email.split('@')[0]}{' '}
                    {application.applicant.last_name || ''}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${application.applicant.email}`} className="hover:text-primary">
                      {application.applicant.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusChange(application.id, value)}
                    disabled={updatingId === application.id}
                  >
                    <SelectTrigger className="w-32">
                      {updatingId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Badge className={`${statusColors[application.status]} capitalize`}>
                    {application.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Applied {formatDate(application.applied_at)}</span>
                  </div>
                </div>

                {application.cover_letter && (
                  <div className="p-4 bg-muted rounded-md mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                      <FileText className="h-4 w-4" />
                      Cover Letter
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>
                )}

                {application.resume && (
                  <div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.resume} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" /> View Resume
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;
