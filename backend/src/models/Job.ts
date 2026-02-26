import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  postedBy: mongoose.Types.ObjectId;
  applicationDeadline?: Date;
  isActive: boolean;
  views: number;
  applicationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyLogo: { type: String },
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], required: true },
  level: { type: String, enum: ['entry', 'mid', 'senior', 'lead', 'executive'], required: true },
  salary: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
  },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  skills: [{ type: String }],
  benefits: [{ type: String }],
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicationDeadline: { type: Date },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  applicationCount: { type: Number, default: 0 },
}, { timestamps: true });

JobSchema.index({ title: 'text', company: 'text', description: 'text', skills: 'text' });
JobSchema.index({ location: 1, type: 1, level: 1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
