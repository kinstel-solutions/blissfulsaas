"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  XCircle,
  Users,
  AlertCircle,
  ChevronDown
} from "lucide-react";

export interface TherapistWithUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  isVerified: boolean;
  hourlyRate: number | null;
  pendingFields: unknown;
  user: {
    email: string;
    createdAt: string;
  } | null;
  hasUpdates: boolean;
}

interface TherapistsListProps {
  initialTherapists: TherapistWithUser[];
}

export default function TherapistsList({ initialTherapists }: TherapistsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "updates" | "verified">("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calculate counts for the filter chips based on the FULL initial list
  const counts = useMemo(() => {
    return {
      all: initialTherapists.length,
      new: initialTherapists.filter(t => !t.isVerified).length,
      updates: initialTherapists.filter(t => t.hasUpdates).length,
      verified: initialTherapists.filter(t => t.isVerified).length,
    };
  }, [initialTherapists]);

  // Filter and search logic
  const filteredTherapists = useMemo(() => {
    return initialTherapists.filter((therapist) => {
      // 1. Status Filter
      if (statusFilter === "new" && therapist.isVerified) return false;
      if (statusFilter === "updates" && !therapist.hasUpdates) return false;
      if (statusFilter === "verified" && !therapist.isVerified) return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const firstName = therapist.firstName?.toLowerCase() || "";
      const lastName = therapist.lastName?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const email = therapist.user?.email?.toLowerCase() || "";
      const id = therapist.id?.toLowerCase() || "";

      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        email.includes(query) ||
        id.includes(query)
      );
    });
  }, [initialTherapists, searchQuery, statusFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Integrated Search and Filter Controls */}
      <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant/15 p-2 rounded-2xl shadow-xs md:shadow-sm">
        
        {/* Search Bar Input */}
        <div className="relative flex-1 flex items-center">
          <div className="pl-3 text-muted-foreground/60 shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-transparent border-0 text-sm font-medium placeholder:text-muted-foreground/50 text-foreground focus:outline-none focus:ring-0 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 text-muted-foreground/40 hover:text-muted-foreground/75 text-xs font-semibold uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-outline-variant/20 mx-2 shrink-0" />

        {/* Filter Dropdown Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-2 hover:bg-surface-container-low/50 rounded-xl border border-outline-variant/20 hover:border-outline-variant/50 transition-all text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground shrink-0 cursor-pointer shadow-xs"
          >
            {statusFilter === "all" && <Users className="w-3.5 h-3.5" />}
            {statusFilter === "new" && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
            {statusFilter === "updates" && <AlertCircle className="w-3.5 h-3.5 text-yellow-600" />}
            {statusFilter === "verified" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            
            <span className="hidden sm:inline">
              {statusFilter === "all" && "All Status"}
              {statusFilter === "new" && "New"}
              {statusFilter === "updates" && "Updates"}
              {statusFilter === "verified" && "Verified"}
            </span>
            <span className="sm:hidden">
              {statusFilter === "all" && "All"}
              {statusFilter === "new" && "New"}
              {statusFilter === "updates" && "Updates"}
              {statusFilter === "verified" && "Verified"}
            </span>
            
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${isDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
          </button>

          {/* Dropdown Menu Overlay */}
          {isDropdownOpen && (
            <>
              {/* Backdrop to close dropdown on click outside */}
              <div 
                className="fixed inset-0 z-40 bg-transparent" 
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 border-b border-outline-variant/10 mb-1">
                  Filter by Status
                </div>
                
                {/* Option: All */}
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-surface-container-low transition-colors text-left cursor-pointer ${
                    statusFilter === "all" ? "text-primary bg-primary/5" : "text-foreground/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>All Providers</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground font-bold shrink-0">
                    {counts.all}
                  </span>
                </button>

                {/* Option: New */}
                <button
                  onClick={() => {
                    setStatusFilter("new");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-amber-500/5 transition-colors text-left cursor-pointer ${
                    statusFilter === "new" ? "text-amber-700 bg-amber-500/5" : "text-foreground/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>New</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold shrink-0">
                    {counts.new}
                  </span>
                </button>

                {/* Option: Updates */}
                <button
                  onClick={() => {
                    setStatusFilter("updates");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-yellow-500/5 transition-colors text-left cursor-pointer ${
                    statusFilter === "updates" ? "text-yellow-700 bg-yellow-500/5" : "text-foreground/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                    <span>Updates</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-700 font-bold shrink-0">
                    {counts.updates}
                  </span>
                </button>

                {/* Option: Verified */}
                <button
                  onClick={() => {
                    setStatusFilter("verified");
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold hover:bg-emerald-500/5 transition-colors text-left cursor-pointer ${
                    statusFilter === "verified" ? "text-emerald-700 bg-emerald-500/5" : "text-foreground/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-bold shrink-0">
                    {counts.verified}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-xl overflow-hidden relative group">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/10 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/50 bg-primary/[0.01]">
                <th className="px-5 md:px-10 py-6">Practitioner</th>
                <th className="px-4 md:px-8 py-6">Status</th>
                <th className="px-4 md:px-8 py-6">Rate</th>
                <th className="px-4 md:px-8 py-6">Registration</th>
                <th className="px-4 md:px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {filteredTherapists.map((therapist) => {
                return (
                  <tr key={therapist.id} className="group/row hover:bg-primary/[0.01] transition-colors animate-in fade-in duration-200">
                    <td className="px-5 md:px-10 py-4 md:py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/5 text-lg overflow-hidden shrink-0">
                          {therapist.profileImageUrl ? (
                            <img src={therapist.profileImageUrl} alt={therapist.firstName || "Practitioner"} className="w-full h-full object-cover" />
                          ) : (
                            therapist.firstName?.[0] || "?"
                          )}
                        </div>
                        <div>
                          <p className="font-heading font-medium text-foreground text-lg leading-tight">
                            {therapist.firstName} {therapist.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5 tracking-tight">{therapist.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <div className="flex flex-col gap-2">
                        {therapist.isVerified ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-xs">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-xs">
                            <Clock className="w-3 h-3" /> New
                          </div>
                        )}
                        
                        {therapist.hasUpdates && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/5 text-yellow-700 border border-yellow-500/15 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit shadow-xs">
                            <AlertCircle className="w-3 h-3" /> Updates Pending
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <p className="text-sm font-bold text-primary">₹{therapist.hourlyRate || 0}/hr</p>
                      <p className="text-xs text-muted-foreground/40 font-bold uppercase tracking-tighter">Market Value</p>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8">
                      <p className="text-sm font-medium text-foreground/70">
                        {therapist.user?.createdAt ? new Date(therapist.user.createdAt).toLocaleDateString('en-US') : "N/A"}
                      </p>
                    </td>
                    <td className="px-4 md:px-8 py-4 md:py-8 text-right">
                      <Link 
                        href={`/dashboard/therapists/${therapist.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-primary hover:text-white rounded-xl border border-outline-variant/30 hover:border-primary transition-all text-xs font-bold uppercase tracking-widest group/btn"
                      >
                        Inspect <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredTherapists.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 md:px-10 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <XCircle className="w-10 h-10 text-muted-foreground/40 animate-pulse" />
                      <p className="text-muted-foreground font-medium text-sm">No practitioners matched your search or filter criteria.</p>
                      <button 
                        onClick={clearFilters}
                        className="text-xs font-bold text-primary hover:underline uppercase tracking-wider mt-2"
                      >
                        Clear Search & Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
