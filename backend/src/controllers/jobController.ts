import { Request, Response } from 'express';
import { Job } from '../models/Job';
import { Application } from '../models/Application';

// Keyword → skills ATS scoring helper
function calcAtsScore(jobSkills: string[], resumeText: string): number {
  if (!jobSkills.length) return 50;
  const lower = resumeText.toLowerCase();
  const matched = jobSkills.filter(s => lower.includes(s.toLowerCase()));
  return Math.round((matched.length / jobSkills.length) * 100);
}

// GET /api/jobs — search + filters
export const getJobs = async (req: Request, res: Response) => {
  try {
    const { search, type, level, location, minSalary, maxSalary, skills, page = '1', limit = '20' } = req.query;
    const query: Record<string, any> = { isActive: true };

    if (search) query.$text = { $search: search as string };
    if (type) query.type = type;
    if (level) query.level = level;
    if (location) query.location = new RegExp(location as string, 'i');
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    if (skills) query.skills = { $in: (skills as string).split(',') };

    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Job.countDocuments(query),
    ]);

    res.json({ total, page: Number(page), limit: Number(limit), jobs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: (err as Error).message });
  }
};

// GET /api/jobs/:id
export const getJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('postedBy', 'name company');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/jobs — employer only
export const createJob = async (req: Request, res: Response) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: (req as any).user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

// POST /api/jobs/:id/apply — applicant
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { resumeUrl, coverLetter, answers } = req.body;
    const userId = (req as any).user.id;
    const job = await Job.findById(req.params.id);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not found or closed' });

    if (job.applicationDeadline && new Date() > job.applicationDeadline)
      return res.status(400).json({ message: 'Application deadline passed' });

    const atsScore = calcAtsScore(job.skills, coverLetter + ' ' + JSON.stringify(answers || {}));

    const application = await Application.create({
      job: job._id,
      applicant: userId,
      resumeUrl,
      coverLetter,
      answers,
      atsScore,
      timeline: [{ status: 'submitted', changedAt: new Date() }],
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicationCount: 1 } });

    res.status(201).json(application);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already applied for this job' });
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/applications/:id/status — employer
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { status, note, interviewDate, offerSalary, rejectionReason } = req.body;
    const userId = (req as any).user.id;

    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ message: 'Application not found' });

    app.status = status;
    app.timeline.push({ status, note, changedAt: new Date(), changedBy: userId });
    if (interviewDate) app.interviewDate = new Date(interviewDate);
    if (offerSalary) app.offerSalary = offerSalary;
    if (rejectionReason) app.rejectionReason = rejectionReason;

    await app.save();
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/applications/my — applicant dashboard
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const apps = await Application.find({ applicant: userId })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
