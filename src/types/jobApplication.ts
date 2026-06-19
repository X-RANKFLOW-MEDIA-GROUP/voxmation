export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeFileName?: string;
  answers: {
    yearsExperience: string;
    greatestAchievement: string;
    whyInterested: string;
    additionalInfo: string;
  };
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
  notes?: string;
}

export interface JobApplicationResponse {
  success: boolean;
  applicationId?: string;
  message: string;
}
