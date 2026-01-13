import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/Buttons';
import { MapPin, Clock, Building2 } from 'lucide-react';

const JobCard = ({ job, showActions, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 animate-fade-in first-letter: bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 bg-white">
          <div className="space-y-1 text-gray-950 ">
            <Link 
              to={`/jobs/${job.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1"
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">{job.company_name}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDate(job.created_at)}</span>
          </div>
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-3 border-t border-border">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/jobs/${job.id}`}>View Details</Link>
          </Button>
          
          {showActions && (
            <div className="flex items-center gap-2 ">
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/jobs/${job.id}/applications`}>Applications</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
