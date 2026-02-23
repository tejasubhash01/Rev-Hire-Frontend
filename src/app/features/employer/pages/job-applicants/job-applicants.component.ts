import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService, ApplicationResponse, UpdateApplicationStatusRequest } from '../../../../core/services/application.service';
import { JobseekerService, JobSeekerProfile } from '../../../../core/services/jobseeker.service';

@Component({
  selector: 'app-job-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './job-applicants.component.html',
  styleUrls: ['./job-applicants.component.css']
})
export class JobApplicantsComponent implements OnInit {
  jobId!: number;
  applicants: ApplicationResponse[] = [];
  loading = true;
  error = '';
  selectedApplication: ApplicationResponse | null = null;
  showNoteModal = false;
  noteContent = '';
  statusUpdateData: UpdateApplicationStatusRequest = { status: '' };

  // Profile modal
  showProfileModal = false;
  selectedSeekerProfile: JobSeekerProfile | null = null;
  profileLoading = false;
  profileError = '';

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private jobseekerService: JobseekerService
  ) {}

  ngOnInit() {
    this.jobId = Number(this.route.snapshot.paramMap.get('jobId'));
    this.loadApplicants();
  }

  loadApplicants() {
    this.loading = true;
    this.applicationService.getApplicationsForJob(this.jobId).subscribe({
      next: (data) => {
        this.applicants = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load applicants.';
        this.loading = false;
      }
    });
  }

  viewProfile(profileId: number) {
    console.log('View profile clicked for profile ID:', profileId);
    this.profileLoading = true;
    this.profileError = '';
    this.jobseekerService.getSeekerProfileByProfileId(profileId).subscribe({
      next: (profile) => {
        console.log('Profile loaded:', profile);
        this.selectedSeekerProfile = profile;
        this.profileLoading = false;
        this.showProfileModal = true;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.profileError = 'Failed to load profile.';
        this.profileLoading = false;
      }
    });
  }

  downloadResumeFile(profileId: number) {
    console.log('Downloading resume for profile ID:', profileId);
    this.jobseekerService.downloadResumeFile(profileId).subscribe({
      next: (blob) => {
        console.log('Download successful, blob size:', blob.size);
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = ''; // filename will be from Content-Disposition header
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Download failed with error:', err);
        console.log('Status:', err.status);
        console.log('Message:', err.message);
        if (err.error) {
          console.log('Error response:', err.error);
        }
        alert('Failed to download file. Check console for details (F12).');
      }
    });
  }

  closeProfileModal() {
    this.showProfileModal = false;
    this.selectedSeekerProfile = null;
  }

  updateStatus(application: ApplicationResponse) {
    const newStatus = prompt('Enter new status (APPLIED, UNDER_REVIEW, SHORTLISTED, REJECTED, WITHDRAWN):', application.status);
    if (newStatus && newStatus !== application.status) {
      const notes = prompt('Add optional notes:');
      const updateData: UpdateApplicationStatusRequest = {
        status: newStatus,
        employerNotes: notes || undefined
      };
      this.applicationService.updateApplicationStatus(application.id, updateData).subscribe({
        next: (updated) => {
          const index = this.applicants.findIndex(a => a.id === application.id);
          if (index !== -1) this.applicants[index] = updated;
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update status.');
        }
      });
    }
  }

  addNote(application: ApplicationResponse) {
    this.selectedApplication = application;
    this.noteContent = '';
    this.showNoteModal = true;
  }

  submitNote() {
    if (!this.selectedApplication || !this.noteContent.trim()) return;
    this.applicationService.addNote(this.selectedApplication.id, { note: this.noteContent }).subscribe({
      next: (updated) => {
        const index = this.applicants.findIndex(a => a.id === this.selectedApplication!.id);
        if (index !== -1) this.applicants[index] = updated;
        this.closeNoteModal();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to add note.');
      }
    });
  }

  closeNoteModal() {
    this.showNoteModal = false;
    this.noteContent = '';
    this.selectedApplication = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPLIED': return 'status-applied';
      case 'UNDER_REVIEW': return 'status-review';
      case 'SHORTLISTED': return 'status-shortlisted';
      case 'REJECTED': return 'status-rejected';
      case 'WITHDRAWN': return 'status-withdrawn';
      default: return '';
    }
  }
}
