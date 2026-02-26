import React from 'react';
import { MapPinIcon, BriefcaseIcon, ClockIcon, CurrencyDollarIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

interface Salary {
  min: number;
  max: number;
  currency: string;
  period: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  level: string;
  salary: Salary;
  skills: string[];
  applicationCount: number;
  createdAt: string;
}

interface Props {
  job: Job;
  onSave?: (id: string) => void;
  saved?: boolean;
  onClick?: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'full-time': 'bg-green-100 text-green-700',
  'part-time': 'bg-yellow-100 text-yellow-700',
  'contract': 'bg-purple-100 text-purple-700',
  'internship': 'bg-blue-100 text-blue-700',
  'remote': 'bg-indigo-100 text-indigo-700',
};

const LEVEL_COLORS: Record<string, string> = {
  entry: 'bg-gray-100 text-gray-600',
  mid: 'bg-sky-100 text-sky-700',
  senior: 'bg-orange-100 text-orange-700',
  lead: 'bg-red-100 text-red-700',
  executive: 'bg-rose-100 text-rose-700',
};

function formatSalary(salary: Salary): string {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : `${n}`;
  return `${salary.currency} ${fmt(salary.min)}–${fmt(salary.max)} / ${salary.period}`;
}

export default function JobCard({ job, onSave, saved = false, onClick }: Props) {
  return (
    <div
      onClick={() => onClick?.(job._id)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-indigo-200 transition-all duration-200 p-5 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Company Logo */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
            {job.companyLogo ? (
              <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl font-bold text-indigo-500">
                {job.company[0]}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 truncate transition-colors">{job.title}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); onSave?.(job._id); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {saved
            ? <BookmarkSolid className="w-5 h-5 text-indigo-500" />
            : <BookmarkIcon className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_COLORS[job.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {job.type}
        </span>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${LEVEL_COLORS[job.level] ?? 'bg-gray-100 text-gray-600'}`}>
          {job.level}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="w-4 h-4" />{job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <CurrencyDollarIcon className="w-4 h-4" />{formatSalary(job.salary)}
        </span>
        <span className="flex items-center gap-1.5">
          <BriefcaseIcon className="w-4 h-4" />{job.applicationCount} applicants
        </span>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills.slice(0, 5).map(skill => (
            <span key={skill} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">{skill}</span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 5} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <ClockIcon className="w-3.5 h-3.5" />
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </span>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          Apply Now →
        </button>
      </div>
    </div>
  );
}
