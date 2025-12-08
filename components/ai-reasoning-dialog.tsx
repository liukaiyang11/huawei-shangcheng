"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, ExternalLink, Database, Globe, CheckCircle2, Loader2, Download, Sparkles } from "lucide-react"
import type { Case } from "@/types"

interface ReasoningStep {
  id: string
  title: string
  status: "pending" | "processing" | "completed"
  content: string
  timestamp?: string
}

interface KnowledgeSource {
  id: string
  title: string
  type: "internal" | "external"
  url?: string
  caseId?: string
  relevance: number
  summary: string
}

interface AIReasoningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  internalCases: Case[]
  onCaseClick: (caseId: string) => void
}

export function AIReasoningDialog({ open, onOpenChange, query, internalCases, onCaseClick }: AIReasoningDialogProps) {
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([])
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([])
  const [solution, setSolution] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // 模拟外部知识库（华为昇腾社区）
  const externalKnowledge: KnowledgeSource[] = [
    {
      id: "ext-1",
      title: "昇腾AI处理器在智能交通场景的应用实践",
      type: "external",
      url: "https://www.hiascend.com/zh/solutions/traffic",
      relevance: 95,
      summary: "详细介绍了昇腾310在路口监控、车牌识别等场景的部署方案和性能数据",
    },
    {
      id: "ext-2",
      title: "Atlas 800训练服务器技术白皮书",
      type: "external",
      url: "https://www.hiascend.com/zh/hardware/atlas-800",
      relevance: 88,
      summary: "Atlas 800系列的完整技术规格、最佳实践和典型配置方案",
    },
  ]

  useEffect(() => {
    if (open && query) {
      startReasoning()
    } else {
      // 重置状态
      setReasoningSteps([])
      setKnowledgeSources([])
      setSolution("")
      setCurrentStep(0)
    }
  }, [open, query])

  const startReasoning = async () => {
    setIsProcessing(true)

    // 步骤1: 需求分析
    const steps: ReasoningStep[] = [
      {
        id: "step-1",
        title: "需求理解与拆解",
        status: "processing",
        content: "正在分析用户需求的核心要素...",
      },
      {
        id: "step-2",
        title: "内部知识库检索",
        status: "pending",
        content: "",
      },
      {
        id: "step-3",
        title: "外部知识库检索",
        status: "pending",
        content: "",
      },
      {
        id: "step-4",
        title: "方案综合与生成",
        status: "pending",
        content: "",
      },
    ]
    setReasoningSteps(steps)

    // 步骤1: 需求分析
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const analysisContent = `从用户需求"${query}"中识别到：
    
• 应用场景：智能交通、视觉识别
• 关键需求：车牌识别、路口监控
• 技术要点：边缘计算、实时处理
• 预计规模：中等部署规模`

    setReasoningSteps((prev) =>
      prev.map((s, i) =>
        i === 0
          ? { ...s, status: "completed", content: analysisContent, timestamp: new Date().toLocaleTimeString() }
          : s,
      ),
    )
    setCurrentStep(1)

    // 步骤2: 内部知识库检索
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReasoningSteps((prev) => prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s)))

    // 匹配内部案例
    const matchedInternal = internalCases
      .filter(
        (c) =>
          c.industry.includes("交通") || c.scenarioTags.some((tag) => tag.includes("识别") || tag.includes("视觉")),
      )
      .slice(0, 3)
      .map((c, idx) => ({
        id: c.id,
        title: c.title,
        type: "internal" as const,
        caseId: c.id,
        relevance: 90 - idx * 10,
        summary: c.customerPainPoint.substring(0, 50) + "...",
      }))

    await new Promise((resolve) => setTimeout(resolve, 1200))
    setKnowledgeSources(matchedInternal)

    const internalContent = `在内部知识库中找到 ${matchedInternal.length} 个高度相关的成功案例：

${matchedInternal.map((k, i) => `${i + 1}. ${k.title} (相似度: ${k.relevance}%)`).join("\n")}`

    setReasoningSteps((prev) =>
      prev.map((s, i) =>
        i === 1
          ? { ...s, status: "completed", content: internalContent, timestamp: new Date().toLocaleTimeString() }
          : s,
      ),
    )
    setCurrentStep(2)

    // 步骤3: 外部知识库检索
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReasoningSteps((prev) => prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s)))

    await new Promise((resolve) => setTimeout(resolve, 1500))
    setKnowledgeSources((prev) => [...prev, ...externalKnowledge])

    const externalContent = `从华为昇腾社区检索到 ${externalKnowledge.length} 篇技术文档：

${externalKnowledge.map((k, i) => `${i + 1}. ${k.title} (相关度: ${k.relevance}%)`).join("\n")}`

    setReasoningSteps((prev) =>
      prev.map((s, i) =>
        i === 2
          ? { ...s, status: "completed", content: externalContent, timestamp: new Date().toLocaleTimeString() }
          : s,
      ),
    )
    setCurrentStep(3)

    // 步骤4: 方案生成
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setReasoningSteps((prev) => prev.map((s, i) => (i === 3 ? { ...s, status: "processing" } : s)))

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generatedSolution = `# 智能交通路口监控解决方案

## 一、方案概述
基于华为昇腾AI处理器的智能交通路口监控系统，实现车牌自动识别、交通流量统计和异常行为检测。

## 二、技术架构
**硬件配置：**
- 边缘侧：昇腾310推理卡 × 每路口1张
- 云端：Atlas 800训练服务器（可选，用于模型优化）

**软件栈：**
- 推理框架：MindSpore Lite
- 算法模型：YOLO v5 车牌检测 + CRNN 字符识别
- 部署方式：边缘计算，本地实时处理

## 三、核心功能
1. **车牌识别**：准确率 ≥ 98%，支持各类车牌类型
2. **实时处理**：单路视频延迟 < 100ms
3. **数据上报**：违章信息自动上传云平台

## 四、预期效果
- 识别准确率：98%+
- 处理速度：30fps/路
- 成本降低：相比人工巡查降低 80%
- 部署周期：2-3个月

## 五、参考案例
本方案综合了以下成功案例的经验：
${matchedInternal.map((k) => `- ${k.title}`).join("\n")}

## 六、推荐配置
**50个路口标准配置：**
- 昇腾310推理卡：50张
- 边缘服务器：50台
- 预估投资：180-220万元

详细技术文档请参考华为昇腾社区相关资料。`

    setSolution(generatedSolution)
    setReasoningSteps((prev) =>
      prev.map((s, i) =>
        i === 3
          ? {
              ...s,
              status: "completed",
              content: "方案生成完成，已整合内外部知识",
              timestamp: new Date().toLocaleTimeString(),
            }
          : s,
      ),
    )
    setIsProcessing(false)
  }

  const handleKnowledgeClick = (source: KnowledgeSource) => {
    if (source.type === "internal" && source.caseId) {
      onCaseClick(source.caseId)
    } else if (source.type === "external" && source.url) {
      window.open(source.url, "_blank")
    }
  }

  const handleDownloadSolution = () => {
    // 创建Word文档内容
    const blob = new Blob([solution], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `AI解决方案_${new Date().toLocaleDateString()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* 固定头部 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0036C3] to-[#001580] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[#333333]">AI 智能推理</h3>
              <p className="text-sm text-[#8C8C8C]">基于内外部知识库的方案生成</p>
            </div>
          </div>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 用户需求 */}
          <Card className="border-[#2E6BE6]/20 bg-[#2E6BE6]/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-[#2E6BE6] mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#333333] mb-1">用户需求</p>
                  <p className="text-sm text-[#8C8C8C]">{query}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 推理步骤 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#333333] flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#2E6BE6]" />
              推理过程
            </h4>

            {reasoningSteps.map((step, index) => (
              <Card key={step.id} className="border-[#E5E7EB]">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {step.status === "completed" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {step.status === "processing" && <Loader2 className="h-5 w-5 text-[#2E6BE6] animate-spin" />}
                      {step.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-[#E5E7EB]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-[#333333]">
                          {index + 1}. {step.title}
                        </p>
                        {step.timestamp && <span className="text-xs text-[#8C8C8C]">{step.timestamp}</span>}
                      </div>
                      {step.content && (
                        <pre className="text-sm text-[#8C8C8C] whitespace-pre-wrap font-sans">{step.content}</pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 知识来源 */}
          {knowledgeSources.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#333333] flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[#2E6BE6]" />
                参考知识源
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {knowledgeSources.map((source) => (
                  <Card
                    key={source.id}
                    className="border-[#E5E7EB] hover:border-[#2E6BE6] transition-colors cursor-pointer"
                    onClick={() => handleKnowledgeClick(source)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {source.type === "internal" ? (
                          <Database className="h-5 w-5 text-[#2E6BE6] mt-0.5 flex-shrink-0" />
                        ) : (
                          <Globe className="h-5 w-5 text-[#FF4D4F] mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-[#333333] truncate">{source.title}</p>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {source.relevance}% 相关
                            </Badge>
                          </div>
                          <p className="text-xs text-[#8C8C8C] mb-2">{source.summary}</p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                source.type === "internal" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                              }
                            >
                              {source.type === "internal" ? "内部案例" : "社区文档"}
                            </Badge>
                            <ExternalLink className="h-3 w-3 text-[#8C8C8C]" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 生成的方案 */}
          {solution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#333333] flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#2E6BE6]" />
                  AI 生成方案
                </h4>
                <Button size="sm" onClick={handleDownloadSolution} className="bg-[#2E6BE6] hover:bg-[#001580]">
                  <Download className="h-4 w-4 mr-2" />
                  下载方案
                </Button>
              </div>

              <Card className="border-[#2E6BE6]/20 bg-gradient-to-br from-blue-50/50 to-white">
                <CardContent className="pt-4">
                  <div className="prose prose-sm max-w-none">
                    <pre className="text-sm text-[#333333] whitespace-pre-wrap font-sans leading-relaxed">
                      {solution}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
