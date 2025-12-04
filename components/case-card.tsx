"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, FileText, Video, Layers } from "lucide-react"
import type { Case } from "@/types"

interface CaseCardProps {
  case: Case
  onViewDetails: () => void
  onViewPPT?: () => void
  onViewVideo?: () => void
  similarity?: number
}

export function CaseCard({ case: caseData, onViewDetails, onViewPPT, onViewVideo, similarity }: CaseCardProps) {
  return (
    <Card
      className="floating-card cursor-pointer border-border/50 bg-card hover:border-[#2E6BE6]/30 transition-all duration-300 h-full flex flex-col"
      onClick={onViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight flex-1 text-[#333333]">{caseData.title}</h3>
            {similarity !== undefined && (
              <Badge className="shrink-0 bg-[#2E6BE6]/10 text-[#2E6BE6] border-[#2E6BE6]/20">{similarity}% 匹配</Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs border-[#8C8C8C]/30 text-[#333333]">
              {caseData.industry}
            </Badge>
            {(caseData.scenarioTags || []).slice(0, 2).map((tag) => (
              <Badge key={tag} className="text-xs bg-[#2E6BE6]/10 text-[#2E6BE6] border-[#2E6BE6]/20">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* 软件场景 */}
        <div className="space-y-2 pb-2 border-b border-border/50">
          <h4 className="text-xs font-semibold text-[#8C8C8C] flex items-center gap-1">
            <Layers className="h-3 w-3 text-[#2E6BE6]" />
            软件场景
          </h4>
          <p className="text-sm text-[#333333] leading-relaxed line-clamp-4">{caseData.softwareScenario}</p>
        </div>

        <div className="flex-1 flex flex-col justify-end space-y-4">
          {/* 硬核配置 */}
          {caseData.hardware && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-[#8C8C8C] flex items-center gap-1">
                <Server className="h-3 w-3 text-[#2E6BE6]" />
                硬件配置
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <Badge className="font-mono bg-[#2E6BE6] text-white hover:bg-[#0036C3]">
                  {caseData.hardware.model}
                </Badge>
                <span className="text-[#8C8C8C]">×</span>
                <span className="font-semibold text-[#333333]">{caseData.hardware.quantity}</span>
                <span className="text-xs text-[#8C8C8C]">节点</span>
              </div>
              {caseData.capability && (
                <div className="text-xs text-[#8C8C8C]">
                  并发: {caseData.capability.concurrent} 路 | {caseData.capability.throughput}
                </div>
              )}
            </div>
          )}

          {/* 价值量化 */}
          {caseData.roi && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-xs text-[#8C8C8C]">效率提升</div>
                <div className="text-lg font-bold text-green-600">+{caseData.roi.efficiencyIncrease}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[#8C8C8C]">成本降低</div>
                <div className="text-lg font-bold text-[#2E6BE6]">-{caseData.roi.costReduction}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[#8C8C8C]">交付时间</div>
                <div className="text-sm font-semibold text-[#333333]">{caseData.roi.deliveryTime}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[#8C8C8C]">系统稳定性</div>
                <div className="text-sm font-semibold text-[#333333]">{caseData.roi.stability}</div>
              </div>
            </div>
          )}

          {caseData.resources && (caseData.resources.pptUrl || caseData.resources.videoUrl) && (
            <div className="flex gap-2 pt-2">
              {caseData.resources.pptUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6] bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewPPT?.()
                  }}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  方案PPT
                </Button>
              )}
              {caseData.resources.videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6] bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewVideo?.()
                  }}
                >
                  <Video className="h-3 w-3 mr-1" />
                  演示视频
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
