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
      <CardHeader className="border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass size={15} className="text-[#0a66c2]" />
          <h2 className="text-sm font-bold text-gray-900">Career Focus</h2>
        </div>
        <span className="text-[11px] text-gray-400 font-medium">Trajectory</span>
      </CardHeader>

      <CardBody className="space-y-3.5">
        {/* Current Target Role */}
        <div className="p-2.5 rounded-md bg-[#ebf3fb]/60 border border-[#b2d5f8] flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold text-[#0a66c2] uppercase tracking-wider">
              Target Career Role
            </p>
            <h3 className="text-xs font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
              <Target size={13} className="text-[#0a66c2]" />
              {targetRole}
            </h3>
          </div>
          <Badge variant="blue" size="sm">
            Active
          </Badge>
        </div>

        {/* Current Skill Set */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-gray-700">Verified Technical Skills</span>
            <span className="text-[11px] text-gray-400">{currentSkills.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
              >
                <CheckCircle2 size={10} className="text-[#057642]" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Skills to Investigate */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Sparkles size={12} className="text-[#0a66c2]" />
              Recommended Skill Focus
            </span>
            <span className="text-[11px] text-gray-400">Analysis</span>
          </div>

          <div className="space-y-1.5">
            {suggestedSkills.map((item) => (
              <div
                key={item.name}
                className="p-2 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-gray-900">{item.name}</span>
                  <Badge
                    variant={item.priority === "high" ? "amber" : "gray"}
                    size="sm"
                  >
                    {item.priority === "high" ? "High Priority" : "Suggested"}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Step */}
        <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded bg-[#ebf3fb] text-[#0a66c2] flex items-center justify-center shrink-0 mt-0.5 border border-[#b2d5f8]">
              <Lightbulb size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Next Recommendation
              </span>
              <h4 className="text-xs font-bold text-gray-900 mt-0.5">
                {recommendedNextStep.title}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                {recommendedNextStep.description}
              </p>
              <div className="mt-2">
                <Button variant="outline" size="sm" asChild className="h-6 text-[11px]">
                  <Link href={recommendedNextStep.href} className="inline-flex items-center gap-1">
                    <span>{recommendedNextStep.actionLabel}</span>
                    <ArrowRight size={11} />
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
