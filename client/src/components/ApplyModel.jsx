import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
import Button from './ui/Buttons.jsx';

const ApplyModal = ({ isOpen, onClose, onSubmit, isSubmitting, jobTitle }) => {
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF or Word document');
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("cover_letter", coverLetter);
    if (file) formData.append("resume", file);

    onSubmit(formData); // 🔥 Send FormData to backend
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg w-full max-w-md mx-4 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-darkText">Apply for Job</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-darkText transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">

          {/* Job Title */}
          {jobTitle && (
            <p className="text-gray-500 text-sm">
              Applying for: <span className="text-darkText font-medium">{jobTitle}</span>
            </p>
          )}

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-darkText mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Write something..."
              className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-primary h-28"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-medium text-darkText mb-2">
              Upload CV/Resume (Optional)
            </label>
            
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload PDF or Word document
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max file size: 5MB
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm text-darkText truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-darkText">
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplyModal;
