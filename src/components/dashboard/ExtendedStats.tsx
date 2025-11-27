import { useMemo } from "react";
import { Eye, Clock, Flame, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/AppContext";
import type { PullRequest, ReviewedPullRequest } from "@/types";

interface ExtendedStatsProps {
  pullRequests: PullRequest[];
  reviewedPrs: ReviewedPullRequest[];
}

export function ExtendedStats({ pullRequests, reviewedPrs }: ExtendedStatsProps) {
  const { t } = useApp();

  const avgTimeToMerge = useMemo(() => {
    const prsWithDates = pullRequests.filter(
      (pr) => pr.createdAt && pr.closedAt
    );

    if (prsWithDates.length === 0) return 0;

    const totalHours = prsWithDates.reduce((acc, pr) => {
      const created = new Date(pr.createdAt!);
      const closed = new Date(pr.closedAt);
      const diffMs = closed.getTime() - created.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return acc + diffHours;
    }, 0);

    return totalHours / prsWithDates.length;
  }, [pullRequests]);

  const streakStats = useMemo(() => {
    if (pullRequests.length === 0) return { current: 0, longest: 0 };

    const daysWithPRs = new Set<string>();
    pullRequests.forEach((pr) => {
      const date = new Date(pr.closedAt).toISOString().split("T")[0];
      daysWithPRs.add(date);
    });

    const sortedDays = Array.from(daysWithPRs).sort();
    const weeksWithPRs = new Set<string>();
    sortedDays.forEach((day) => {
      const date = new Date(day);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weeksWithPRs.add(weekStart.toISOString().split("T")[0]);
    });

    const sortedWeeks = Array.from(weeksWithPRs).sort();
    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedWeeks.length; i++) {
      const prevWeek = new Date(sortedWeeks[i - 1]);
      const currWeek = new Date(sortedWeeks[i]);
      const diffDays =
        (currWeek.getTime() - prevWeek.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }, [pullRequests]);

  const uniqueCollaborators = useMemo(() => {
    const authors = new Set<string>();
    reviewedPrs.forEach((pr) => {
      if (pr.author?.login) {
        authors.add(pr.author.login);
      }
    });
    return authors.size;
  }, [reviewedPrs]);

  const formatTimeToMerge = (hours: number) => {
    if (hours < 1) {
      return "<1h";
    }
    if (hours < 24) {
      return `${Math.round(hours)}h`;
    }
    const days = hours / 24;
    if (days < 7) {
      return `${days.toFixed(1)}d`;
    }
    return `${Math.round(days)}d`;
  };

  return (
    <div className="extended-stats-grid">
      <Card className="stat-card extended">
        <CardContent className="pt-6">
          <div className="stat-icon reviewed">
            <Eye className="h-5 w-5" />
          </div>
          <div className="stat-value">{reviewedPrs.length}</div>
          <div className="stat-label">{t("overview.prsReviewed")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card extended">
        <CardContent className="pt-6">
          <div className="stat-icon collaborators">
            <Users className="h-5 w-5" />
          </div>
          <div className="stat-value">{uniqueCollaborators}</div>
          <div className="stat-label">{t("overview.collaborators")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card extended">
        <CardContent className="pt-6">
          <div className="stat-icon time">
            <Clock className="h-5 w-5" />
          </div>
          <div className="stat-value">{formatTimeToMerge(avgTimeToMerge)}</div>
          <div className="stat-label">{t("overview.avgTimeToMerge")}</div>
        </CardContent>
      </Card>

      <Card className="stat-card extended">
        <CardContent className="pt-6">
          <div className="stat-icon streak">
            <Flame className="h-5 w-5" />
          </div>
          <div className="stat-value">{streakStats.longest}w</div>
          <div className="stat-label">{t("overview.longestStreak")}</div>
        </CardContent>
      </Card>
    </div>
  );
}
