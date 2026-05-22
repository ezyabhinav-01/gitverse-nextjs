"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnalysisDetailSkeleton } from "@/components/analysis/AnalysisDetailSkeleton";
import { AnalysisFailureState } from "@/components/analysis/AnalysisFailureState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/ui";
import { Activity } from "lucide-react";

export default function AnalysisJobPage() {
  const router = useRouter();
  const params = useParams();

  const [_data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.jobId) {
      setLoading(false); // prevent skeleton from getting stuck
      return;
    }

    let cancelled = false;
    setLoading(true);
    setData(null);
    setError(null);

    const token = localStorage.getItem("gitverse_token");

    fetch(`/api/analysis-jobs/${params.jobId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const status = res.status;
          // Fix 2: never forward raw API error — use sanitized messages
          if (status === 401 || status === 403) {
            throw new Error("You do not have permission to view this analysis.");
          }
          if (status === 404) {
            throw new Error("This analysis could not be found.");
          }
          throw new Error("Failed to load analysis. Please try again.");
        }
        return res.json();
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params?.jobId]);

  if (loading) return <AnalysisDetailSkeleton />;

  if (error) return <AnalysisFailureState message={error} />;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={Activity}
          title="No Analysis Jobs Found"
          description="You haven't created any analysis jobs yet."
          actionLabel="Create New Job"
          onAction={() => router.push("/analyze")}
        />
      </div>
    </DashboardLayout>
  );
}
