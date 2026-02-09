"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Loader,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { PDFProcessingModal } from "@/components/ui/PDFProcessingModal";

interface UploadedData {
  filename: string;
  size: number;
  rows: any[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  uploadedAt: string;
}

export default function CampaignUploadPage() {
  const router = useRouter();
  const { user } = useUser();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);

  // Get user's campaign company limit
  const getCampaignLimit = () => {
    if (!user) return 5; // Guest
    if (user.subscription_tier === 'free' || user.subscription_tier === 'testing') return 50;
    if (user.subscription_tier === 'premium') return 100; // Production
    if (user.subscription_tier === 'enterprise' || user.subscription_tier === 'client') return Infinity;
    return 5; // Default to guest limit
  };

  const campaignLimit = getCampaignLimit();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(csv|xls|xlsx)$/i)) {
      setError("Please upload a CSV or Excel file");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 300);

      const response = await fetch("/api/campaigns/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (!response.ok) {
        let errorMsg = "Upload failed";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // If JSON parsing fails, use text
          const errorText = await response.text();
          errorMsg = errorText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("Invalid response from server. Please try again.");
      }

      console.log('[Upload] API Response:', data);

      const uploadData = {
        filename: file.name,
        size: file.size,
        rows: data.data?.rows || data.companies || [],
        totalRows: data.data?.totalRows || data.totalRows || 0,
        validRows: data.data?.validRows || data.validRows || 0,
        invalidRows: data.data?.invalidRows || data.invalidRows || 0,
        uploadedAt: new Date().toISOString(),
      };

      setUploadProgress(100);
      setUploadedData(uploadData);
      
      // Check if limit is exceeded
      const companyCount = uploadData.validRows;
      if (companyCount > campaignLimit) {
        setLimitExceeded(true);
      }
      
      console.log('[Upload] Set uploadedData:', {
        rowsCount: uploadData.rows.length,
        totalRows: uploadData.totalRows,
        companyCount,
        campaignLimit,
        limitExceeded: companyCount > campaignLimit,
      });
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleTrimTo = (limit: number) => {
    if (uploadedData) {
      const trimmedData = {
        ...uploadedData,
        rows: uploadedData.rows.slice(0, limit),
        validRows: Math.min(uploadedData.validRows, limit),
        totalRows: limit,
      };
      setUploadedData(trimmedData);
      setLimitExceeded(false);
      console.log(`[Upload] Trimmed to ${limit} companies`);
    }
  };

  const handleContinue = () => {
    if (uploadedData) {
      // Save uploaded data and redirect to create page for template
      localStorage.setItem("uploadedCampaignData", JSON.stringify(uploadedData));
      router.push("/campaigns/create");
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/campaigns")}
          className="text-white/60 hover:text-white text-sm mb-4 transition-colors"
        >
          ← Back to campaigns
        </button>

        {/* Sign-In/Sign-Up Banner for Guests */}
        {!user && (
          <div className="mb-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Unlock Full Campaign Power
                </h3>
                <p className="text-sm text-gray-300">
                  You're currently limited to 5 companies as a guest. 
                  <strong className="text-white"> Sign up free to get 50 companies per campaign</strong> - that's 10x more reach!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors rounded-full whitespace-nowrap"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-5 py-2 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors rounded-full whitespace-nowrap"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-800">
          <h1 className="text-xl font-medium text-white tracking-tight mb-2">Upload Companies</h1>
          <p className="text-sm text-white font-mono">CSV or Excel spreadsheet with company websites</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!uploadedData ? (
          <div className="space-y-6">
            {/* Upload Zone */}
            <label 
              htmlFor="file-upload" 
              className="block cursor-pointer group"
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className={`
                relative border-2 border-dashed py-24 text-center transition-all duration-200 rounded-xl
                ${isDragging ? 'border-white bg-white/5' : 'border-gray-700 hover:border-gray-600'}
                ${uploading ? 'pointer-events-none opacity-50' : ''}
              `}>
                <div className="flex flex-col items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-900 group-hover:bg-gray-800 flex items-center justify-center transition-colors">
                    {uploading ? (
                      <Loader className="w-7 h-7 text-white animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7 text-white group-hover:text-purple-400 transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="text-base text-white mb-2">
                      {uploading ? "Processing..." : "Drop CSV or Excel file or click to browse"}
                    </p>
                    <p className="text-sm text-white">Must include website_url column</p>
                  </div>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {/* Format Info */}
            <div className="border border-gray-800 p-5 rounded-xl">
              <p className="text-xs text-white/60 mb-3">Required Format</p>
              <pre className="text-xs font-mono text-white/80 bg-gray-900 p-4 border border-gray-800 overflow-x-auto rounded-lg">
{`website_url,company_name,contact_email,phone
https://example.com,Example Inc,hello@example.com,+1234567890
https://another.com,Another Co,hi@another.com,+0987654321`}
              </pre>
              <p className="text-xs text-white/50 mt-3">
                Only website_url is required • Max 1000 rows
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="border border-emerald-500/30 bg-emerald-500/10 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-base text-emerald-300 font-medium mb-1">Upload Complete</div>
                    <div className="text-sm text-emerald-400/70 font-mono">{uploadedData.filename}</div>
                  </div>
                </div>
                <button
                  onClick={handleContinue}
                  disabled={limitExceeded}
                  className={`group flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                    limitExceeded 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  Create Message Template
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Limit Exceeded Warning */}
            {limitExceeded && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  Your file has {uploadedData.validRows} companies
                </h3>
                
                {!user ? (
                  // Anonymous user
                  <>
                    <p className="text-gray-300 mb-4">
                      Guest users can process <strong className="text-white">5 companies</strong>. 
                      <strong className="text-amber-300"> Sign up free to get 50 companies!</strong>
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/auth/register')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                      >
                        Sign Up Free - Get 50 Companies (10x more!)
                      </button>
                      <button
                        onClick={() => handleTrimTo(5)}
                        className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Continue as Guest - Use First 5 Companies Only
                      </button>
                    </div>
                  </>
                ) : (user.subscription_tier === 'free' || user.subscription_tier === 'testing') ? (
                  // Free signed-up user
                  <>
                    <p className="text-gray-300 mb-4">
                      Your Free plan allows <strong className="text-white">50 companies per campaign</strong>. 
                      You uploaded {uploadedData.validRows}.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/payment?plan=production')}
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upgrade to Production ($9/mo) - Get 100 Companies
                      </button>
                      <button
                        onClick={() => router.push('/payment?plan=enterprise')}
                        className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Upgrade to Enterprise ($19/mo) - Unlimited
                      </button>
                      <button
                        onClick={() => handleTrimTo(50)}
                        className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Continue with Free - Use First 50 Companies Only
                      </button>
                    </div>
                  </>
                ) : user.subscription_tier === 'premium' ? (
                  // Production user (100 limit)
                  <>
                    <p className="text-gray-300 mb-4">
                      Your Production plan allows <strong className="text-white">100 companies per campaign</strong>. 
                      You uploaded {uploadedData.validRows}.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => router.push('/payment?plan=enterprise')}
                        className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Upgrade to Enterprise ($19/mo) - Process All {uploadedData.validRows} Companies
                      </button>
                      <button
                        onClick={() => handleTrimTo(100)}
                        className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Continue with Production - Use First 100 Companies Only
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { 
                  label: 'Total', 
                  value: uploadedData.totalRows, 
                  color: 'text-white',
                  bg: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop'
                },
                { 
                  label: 'Valid', 
                  value: uploadedData.validRows, 
                  color: 'text-emerald-400',
                  bg: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=200&fit=crop'
                },
                { 
                  label: 'Invalid', 
                  value: uploadedData.invalidRows, 
                  color: 'text-rose-400',
                  bg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop'
                },
                { 
                  label: 'Size', 
                  value: `${(uploadedData.size / 1024).toFixed(1)}KB`, 
                  color: 'text-white',
                  bg: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop'
                },
              ].map((stat, idx) => (
                <div key={idx} className="relative border border-white/30 p-5 rounded-xl overflow-hidden group hover:border-white/50 transition-colors">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundImage: `url(${stat.bg})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="relative z-10">
                    <div className="text-xs text-white mb-2 uppercase tracking-wider">{stat.label}</div>
                    <div className={`text-2xl font-mono ${stat.color}`}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <span className="text-sm text-white font-medium">Preview</span>
                <span className="text-xs text-white font-mono">First 10 rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800 bg-gray-900">
                    <tr>
                      <th className="text-left py-3 px-5 font-medium text-white w-12">#</th>
                      <th className="text-left py-3 px-5 font-medium text-white">Website</th>
                      <th className="text-left py-3 px-5 font-medium text-white">Company</th>
                      <th className="text-left py-3 px-5 font-medium text-white">Email</th>
                      <th className="text-left py-3 px-5 font-medium text-white">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.rows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
                        <td className="py-3 px-5 text-white font-mono">{idx + 1}</td>
                        <td className="py-3 px-5 text-blue-400 font-mono text-sm truncate max-w-xs">
                          {row.website_url}
                        </td>
                        <td className="py-3 px-5 text-white">{row.company_name || '-'}</td>
                        <td className="py-3 px-5 text-white font-mono text-sm">
                          {row.contact_email || '-'}
                        </td>
                        <td className="py-3 px-5 text-white font-mono text-sm">
                          {row.phone || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {uploadedData.rows.length > 10 && (
                <div className="px-5 py-3 border-t border-gray-800 bg-gray-900/50 text-xs text-white font-mono">
                  +{uploadedData.rows.length - 10} more rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Modal */}
        <PDFProcessingModal
          isOpen={uploading}
          progress={uploadProgress}
          fileName={uploadedData?.filename || "CSV/Excel file"}
        />
      </div>
    </div>
  );
}
