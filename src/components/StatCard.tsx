import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
  onClick
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-200',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-800 border-amber-100',
      iconBg: 'bg-amber-500 text-white shadow-amber-200',
      badge: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    blue: {
      bg: 'bg-blue-50 text-blue-800 border-blue-100',
      iconBg: 'bg-blue-600 text-white shadow-blue-200',
      badge: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-800 border-purple-100',
      iconBg: 'bg-purple-600 text-white shadow-purple-200',
      badge: 'text-purple-700 bg-purple-50 border-purple-200'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-800 border-rose-100',
      iconBg: 'bg-rose-500 text-white shadow-rose-200',
      badge: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  }[colorScheme];

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 ${onClick ? 'cursor-pointer hover:border-agri-300' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-md ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold px-1.5 py-0.5 rounded ${trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
          <span className="text-slate-400">vs last 30 days</span>
        </div>
      )}
    </div>
  );
};
