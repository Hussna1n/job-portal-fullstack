import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'phone_screen'
  | 'technical_test'
  | 'interview_scheduled'
  | 'interviewed'
  | 'offer_extended'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  resumeUrl: string;
  coverLetter?: string;
  answers?: Record<string, string>;
  atsScore?: number;
  timeline: {
    status: ApplicationStatus;
    note?: string;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
  }[];
  interviewDate?: Date;
  offerSalary?: number;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'phone_screen', 'technical_test', 'interview_scheduled', 'interviewed', 'offer_extended', 'hired', 'rejected', 'withdrawn'],
    default: 'submitted',
  },
  resumeUrl: { type: String, required: true },
  coverLetter: { type: String },
  answers: { type: Map, of: String },
  atsScore: { type: Number, min: 0, max: 100 },
  timeline: [{
    status: { type: String, required: true },
    note: { type: String },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  interviewDate: { type: Date },
  offerSalary: { type: Number },
  rejectionReason: { type: String },
}, { timestamps: true });

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ applicant: 1, status: 1 });
ApplicationSchema.index({ job: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
