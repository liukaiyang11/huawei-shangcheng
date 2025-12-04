"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Zap, DollarSign, Users } from "lucide-react"
import type { Requirement } from "@/types"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface RequirementCardProps {
  requirement: Requirement
  onViewDetails: () => void
}

export function RequirementCard({ requirement, onViewDetails }: RequirementCardProps) {
  const { structured } = requirement

  const statusConfig = {
    pending: { label: "待对接", variant: "secondary" as const },
    matching: { label: "方案匹配中", variant: "default" as const },
    completed: { label: "已闭环", variant: "outline" as const },
  }

  return (
    <Card
      className="floating-card cursor-pointer border-border/50 bg-card hover:border-[#2E6BE6]/30 transition-all duration-300 h-[360px] flex flex-col"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5 flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight text-[#333333] truncate">
              {structured.industry} - {structured.scenario[0] || "AI应用"}
            </h3>
            <p className="text-xs text-[#8C8C8C]">
              {format(requirement.createdAt, "yyyy年MM月dd日 HH:mm", { locale: zhCN })}
            </p>
          </div>
          <Badge variant={statusConfig[requirement.status].variant} className="flex-shrink-0">
            {statusConfig[requirement.status].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-wrap gap-2 min-h-[56px] content-start">
          {structured.computePower.model.map((model) => (
            <Badge
              key={model}
              className="text-xs bg-[#2E6BE6]/10 text-[#2E6BE6] border-[#2E6BE6]/20 hover:bg-[#2E6BE6]/20 h-6"
            >
              {model}
            </Badge>
          ))}
          <Badge variant="outline" className="text-xs border-[#8C8C8C]/30 text-[#333333] h-6">
            {structured.computePower.type === "training" ? "训练场景" : "推理场景"}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs h-6 ${
              structured.budget.range === "high"
                ? "border-green-500/50 text-green-700 bg-green-50"
                : structured.budget.range === "low"
                  ? "border-[#FF4D4F]/50 text-[#FF4D4F] bg-red-50"
                  : "border-[#8C8C8C]/30"
            }`}
          >
            预算{structured.budget.range === "high" ? "充足" : structured.budget.range === "low" ? "有限" : "中等"}
          </Badge>
        </div>

        <p className="text-sm text-[#8C8C8C] line-clamp-2 leading-relaxed">
          {structured.currentState} → {structured.targetState}
        </p>

        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="h-4 w-4 text-[#2E6BE6] flex-shrink-0" />
            <span className="text-[#8C8C8C]">规模:</span>
            <span className="font-medium text-[#333333] truncate">{structured.scale.nodes}节点</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <DollarSign className="h-4 w-4 text-[#2E6BE6] flex-shrink-0" />
            <span className="text-[#8C8C8C]">预算:</span>
            <span className="font-medium text-[#333333] truncate">{structured.budget.amount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="h-4 w-4 text-[#2E6BE6] flex-shrink-0" />
            <span className="text-[#8C8C8C]">时间:</span>
            <span className="font-medium text-[#333333] truncate">{structured.timeline}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Zap className="h-4 w-4 text-[#2E6BE6] flex-shrink-0" />
            <span className="text-[#8C8C8C]">紧急度:</span>
            <Badge
              variant={structured.urgency === "high" ? "destructive" : "outline"}
              className={`h-5 text-xs ${structured.urgency === "high" ? "bg-[#FF4D4F] border-[#FF4D4F]" : "border-[#8C8C8C]/30"}`}
            >
              {structured.urgency === "high" ? "紧急" : structured.urgency === "low" ? "不急" : "一般"}
            </Badge>
          </div>
        </div>

        <div className="flex-1" />

        {/* 匹配状态 */}
        {requirement.matchedCases && requirement.matchedCases.length > 0 && (
          <div className="pt-2 border-t border-border/50 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>已匹配 {requirement.matchedCases.length} 个相似案例</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
