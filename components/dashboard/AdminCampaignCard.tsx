"use client";

import { Send, Loader, CheckCircle, Pause, Clock, Users, ExternalLink, Trash2 } from "lucide-react";

interface AdminCampaignCardProps {
  campaign: any;
  onMonitor: (campaign: any) => void;
  onDelete?: (campaignId: number) => void;
}

export const AdminCampaignCard = ({ campaign, onMonitor, onDelete }: AdminCampaignCardProps) => {
  return (
    <div 
      onClick={() => onMonitor(campaign)}
      className="bg-gray-800 border border-gray-700 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer group hover:translate-y-[-4px] relative"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Send className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{campaign.name}</h3>
            <p className="text-[10px] text-gray-500 font-mono">ID: #{campaign.id}</p>
          </div>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(campaign.id);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group/delete z-10"
            title="Delete Campaign"
          >
            <Trash2 className="w-4 h-4 text-gray-500 group-hover/delete:text-red-400" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Status and Progress */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {campaign.status === "processing" ? (
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
            ) : campaign.status === "completed" ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : campaign.status === "paused" ? (
              <Pause className="w-4 h-4 text-orange-400" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs font-semibold text-white capitalize">{campaign.status}</span>
          </div>
          <span className="text-xs font-bold text-blue-400">{Math.round(campaign.progress_percentage)}%</span>
        </div>

        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              campaign.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
            }`}
            style={{ width: `${campaign.progress_percentage}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gray-900/50 rounded-lg text-center border border-gray-700/50">
            <p className="text-[8px] text-gray-500 uppercase">Total</p>
            <p className="text-sm font-bold text-white">{campaign.total_companies}</p>
          </div>
          <div className="p-2 bg-green-500/5 rounded-lg text-center border border-green-500/10">
            <p className="text-[8px] text-green-500/70 uppercase">Success</p>
            <p className="text-sm font-bold text-green-400">{campaign.success_count}</p>
          </div>
          <div className="p-2 bg-blue-500/5 rounded-lg text-center border border-blue-500/10">
            <p className="text-[8px] text-blue-500/70 uppercase">Done</p>
            <p className="text-sm font-bold text-blue-400">{campaign.processed_count}</p>
          </div>
        </div>

        {/* User Badge & Creation Time */}
        <div className="pt-2 border-t border-gray-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                <Users className="w-3 h-3 text-gray-400" />
              </div>
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{campaign.user_email}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[8px] bg-purple-500/20 text-purple-300 uppercase font-bold border border-purple-500/20">
              {campaign.user_tier || 'free'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-[9px] text-gray-500">
            <span className="text-gray-300 font-medium">
              {(() => {
                const d = new Date(campaign.created_at);
                const datePart = d.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "Africa/Johannesburg",
                });
                const timePart = d.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Africa/Johannesburg",
                });
                return `${datePart}, ${timePart} SAST`;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Action */}
      <div className="px-6 py-3 bg-blue-600/10 border-t border-gray-700 flex items-center justify-center gap-2 group-hover:bg-blue-600/20 transition-all opacity-0 group-hover:opacity-100">
        <ExternalLink className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Monitor Real-time</span>
      </div>
    </div>
  );
};
