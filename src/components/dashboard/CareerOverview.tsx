"use client";

import Link from "next/link";
import { Target, Compass, Sparkles, ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { careerOverviewData } from "@/lib/mock-data";

interface CareerOverviewProps {
  targetRole?: string;
  currentSkills?: string[];
}

export function CareerOverview({
  targetRole = careerOverviewData.targetRole,
  currentSkills = careerOverviewData.currentSkills,
}: CareerOverviewProps) {
  const { suggestedSkills, recommendedNextStep } = careerOverviewData;

  return (
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Career Overview</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Curated Technical Focus</span>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Current Target Role */}
        <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              Current Target Role
            </p>
            <h3 className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
              <Target size={14} className="text-blue-600" />
              {targetRole}
            </h3>
          </div>
          <Badge variant="blue" size="sm">
            Active Track
          </Badge>
        </div>

        {/* Current Skill Set */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-gray-700">Current Technical Skills</span>
            <span className="text-[11px] text-gray-400">{currentSkills.length} verified</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {currentSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                <CheckCircle2 size={11} className="text-emerald-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Skills to Investigate */}
        <div>
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Sparkles size={12} className="text-blue-600" />
              Suggested Skills to Investigate
            </span>
            <span className="text-[11px] text-gray-400">Industry gap analysis</span>
          </div>

          <div className="space-y-2">
            {suggestedSkills.map((item) => (
              <div
                key={item.name}
                className="p-2.5 rounded-md border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900">{item.name}</span>
                  <Badge
                    variant={item.priority === "high" ? "amber" : "gray"}
                    size="sm"
                  >
                    {item.priority === "high" ? "High Priority" : "Recommended"}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-600 mt-1 leading-snug">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Learning Step */}
        <div className="p-3.5 rounded-lg border border-indigo-100 bg-indigo-50/40">
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Recommended Next Step
              </span>
              <h4 className="text-xs font-bold text-gray-900 mt-0.5">
                {recommendedNextStep.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {recommendedNextStep.description}
              </p>
              <div className="mt-2.5">
                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                  <Link href={recommendedNextStep.href} className="inline-flex items-center gap-1">
                    <span>{recommendedNextStep.actionLabel}</span>
                    <ArrowRight size={12} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
