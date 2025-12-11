"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Brain,
  ExternalLink,
  Database,
  Globe,
  CheckCircle2,
  Loader2,
  Download,
  Sparkles,
  Send,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react"
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

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  reasoningSteps?: ReasoningStep[]
  knowledgeSources?: KnowledgeSource[]
  solution?: string
}

interface AIReasoningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  internalCases: Case[]
  onCaseClick: (caseId: string) => void
  onSaveHistory: (query: string, messages: Message[]) => void
}

export function AIReasoningDialog({
  open,
  onOpenChange,
  query,
  internalCases,
  onCaseClick,
  onSaveHistory,
}: AIReasoningDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [collapsedSteps, setCollapsedSteps] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)
  const [streamingSolution, setStreamingSolution] = useState("")
  const [isStreamingSolution, setIsStreamingSolution] = useState(false)
  const [showCaseDetail, setShowCaseDetail] = useState<Case | null>(null)

  const externalKnowledge: KnowledgeSource[] = [
    {
      id: "ext-1",
      title: "昇腾AI处理器在智能交通场景的应用实践",
      type: "external",
      url: "https://www.hiascend.com/marketplace/solution/detail/2290",
      relevance: 95,
      summary: "详细介绍了昇腾310在路口监控、车牌识别等场景的部署方案和性能数据",
    },
    {
      id: "ext-2",
      title: "Atlas 800训练服务器技术白皮书",
      type: "external",
      url: "https://www.hiascend.com/marketplace/solution/detail/2421",
      relevance: 88,
      summary: "Atlas 800系列的完整技术规格、最佳实践和典型配置方案",
    },
  ]

  useEffect(() => {
    if (open && query && messages.length === 0) {
      processQuery(query)
    } else if (!open) {
      // 重置状态
      setMessages([])
      setCurrentInput("")
    }
  }, [open, query])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const processQuery = async (userQuery: string) => {
    if (!userQuery.trim() || isProcessing) return

    setIsProcessing(true)

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    }
    setMessages((prev) => [...prev, userMessage])

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

    const assistantMessageId = `msg-${Date.now() + 1}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "正在处理您的需求...",
      timestamp: new Date().toLocaleTimeString(),
      reasoningSteps: steps,
      knowledgeSources: [],
    }
    setMessages((prev) => [...prev, assistantMessage])

    // 步骤1: 需求分析
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const analysisContent = `从用户需求"${userQuery}"中识别到：
    
• 应用场景：智能交通、视觉识别
• 关键需求：车牌识别、路口监控
• 技术要点：边缘计算、实时处理
• 预计规模：中等部署规模`

    steps[0] = {
      ...steps[0],
      status: "completed",
      content: analysisContent,
      timestamp: new Date().toLocaleTimeString(),
    }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps] })

    // 步骤2: 内部知识库检索
    await new Promise((resolve) => setTimeout(resolve, 1000))
    steps[1] = { ...steps[1], status: "processing" }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps] })

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

    const internalContent = `在内部知识库中找到 ${matchedInternal.length} 个高度相关的成功案例：

${matchedInternal.map((k, i) => `${i + 1}. ${k.title} (相似度: ${k.relevance}%)`).join("\n")}`

    steps[1] = {
      ...steps[1],
      status: "completed",
      content: internalContent,
      timestamp: new Date().toLocaleTimeString(),
    }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps], knowledgeSources: matchedInternal })

    // 步骤3: 外部知识库检索
    await new Promise((resolve) => setTimeout(resolve, 1000))
    steps[2] = { ...steps[2], status: "processing" }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps] })

    await new Promise((resolve) => setTimeout(resolve, 1500))
    const allKnowledgeSources = [...matchedInternal, ...externalKnowledge]

    const externalContent = `从华为昇腾社区检索到 ${externalKnowledge.length} 篇技术文档：

${externalKnowledge.map((k, i) => `${i + 1}. ${k.title} (相关度: ${k.relevance}%)`).join("\n")}`

    steps[2] = {
      ...steps[2],
      status: "completed",
      content: externalContent,
      timestamp: new Date().toLocaleTimeString(),
    }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps], knowledgeSources: allKnowledgeSources })

    // 步骤4: 方案生成
    await new Promise((resolve) => setTimeout(resolve, 1000))
    steps[3] = { ...steps[3], status: "processing" }
    updateAssistantMessage(assistantMessageId, { reasoningSteps: [...steps] })

    setIsStreamingSolution(true)
    setStreamingSolution("")

    const fullSolution = `# 智能交通路口监控解决方案

## 一、方案概述
基于华为昇腾AI处理器的智能交通路口监控系统，实现车牌自动识别、交通流量统计和异常行为检测[1][4]。

## 二、技术架构
**硬件配置：**
- 边缘侧：昇腾310推理卡 × 每路口1张[2][5]
- 云端：Atlas 800训练服务器（可选，用于模型优化）[5]

**软件栈：**
- 推理框架：MindSpore Lite[1][3]
- 算法模型：YOLO v5 车牌检测 + CRNN 字符识别[1][4]
- 部署方式：边缘计算，本地实时处理

## 三、核心功能
1. **车牌识别**：准确率 ≥ 98%，支持各类车牌类型[1][4]
2. **实时处理**：单路视频延迟 < 100ms[2]
3. **数据上报**：违章信息自动上传云平台[3]

## 四、预期效果
- 识别准确率：98%+[1]
- 处理速度：30fps/路[2]
- 成本降低：相比人工巡查降低 80%[3]
- 部署周期：2-3个月

## 五、推荐配置
**50个路口标准配置：**[1]
- 昇腾310推理卡：50张
- 边缘服务器：50台
- 预估投资：180-220万元

详细技术文档请参考华为昇腾社区相关资料[4][5]。

---
*本方案基于${allKnowledgeSources.length}个内外部知识源生成，引用标注[数字]对应下方参考知识源列表。*`

    // Simulate streaming character by character
    for (let i = 0; i < fullSolution.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20))
      setStreamingSolution(fullSolution.substring(0, i + 1))
    }

    setIsStreamingSolution(false)

    steps[3] = {
      ...steps[3],
      status: "completed",
      content: "方案生成完成，已整合内外部知识并标注引用来源",
      timestamp: new Date().toLocaleTimeString(),
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    updateAssistantMessage(assistantMessageId, {
      content: "已为您生成完整解决方案",
      reasoningSteps: [...steps],
      solution: fullSolution,
      knowledgeSources: allKnowledgeSources,
    })

    setIsProcessing(false)
  }

  const updateAssistantMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              ...updates,
            }
          : msg,
      ),
    )
  }

  const handleKnowledgeClick = (source: KnowledgeSource) => {
    if (source.type === "internal" && source.caseId) {
      const caseData = internalCases.find((c) => c.id === source.caseId)
      if (caseData) {
        setShowCaseDetail(caseData)
      }
    } else if (source.type === "external" && source.url) {
      window.open(source.url, "_blank")
    }
  }

  const handleDownloadSolution = (solution: string) => {
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

  const handleSendMessage = () => {
    if (currentInput.trim() && !isProcessing) {
      processQuery(currentInput)
      setCurrentInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleStepCollapse = (stepId: string) => {
    setCollapsedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const handleClose = () => {
    // Save history before closing
    if (query && messages.length > 0) {
      onSaveHistory(query, messages)
    }
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0036C3] to-[#001580] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-[#333333]">AI 智能推理</h3>
                <p className="text-sm text-[#8C8C8C]">基于内外部知识库的方案生成</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="text-[#8C8C8C] hover:text-[#333333]">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {message.role === "user" ? (
                  // 用户消息
                  <Card className="border-[#2E6BE6]/20 bg-[#2E6BE6]/5 ml-auto max-w-[80%]">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-[#333333]">用户</p>
                            <span className="text-xs text-[#8C8C8C]">{message.timestamp}</span>
                          </div>
                          <p className="text-sm text-[#333333]">{message.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  // AI助手消息
                  <div className="space-y-4 max-w-full">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#333333]">
                      <Brain className="h-4 w-4 text-[#2E6BE6]" />
                      AI 助手
                      <span className="text-xs text-[#8C8C8C] font-normal">{message.timestamp}</span>
                    </div>

                    {/* 推理步骤 */}
                    {message.reasoningSteps && message.reasoningSteps.length > 0 && (
                      <div className="relative pl-8">
                        {/* Vertical timeline line */}
                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#2E6BE6] via-[#2E6BE6]/50 to-transparent" />

                        {message.reasoningSteps.map((step, index) => {
                          const isCollapsed = collapsedSteps.has(step.id)
                          const isLast = index === message.reasoningSteps!.length - 1

                          return (
                            <div key={step.id} className="relative mb-4">
                              {/* Timeline node */}
                              <div className="absolute -left-[22px] top-2">
                                {step.status === "completed" && (
                                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  </div>
                                )}
                                {step.status === "processing" && (
                                  <div className="h-5 w-5 rounded-full bg-[#2E6BE6] flex items-center justify-center">
                                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                                  </div>
                                )}
                                {step.status === "pending" && (
                                  <div className="h-5 w-5 rounded-full border-2 border-[#E5E7EB] bg-white" />
                                )}
                              </div>

                              {/* Step content */}
                              <div className="ml-2">
                                <button
                                  onClick={() => toggleStepCollapse(step.id)}
                                  className="w-full text-left hover:bg-gray-50 rounded-lg p-3 transition-colors"
                                  disabled={!step.content}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {step.content && (
                                        <>
                                          {isCollapsed ? (
                                            <ChevronRight className="h-4 w-4 text-[#8C8C8C]" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-[#8C8C8C]" />
                                          )}
                                        </>
                                      )}
                                      <p className="text-sm font-medium text-[#333333]">
                                        {index + 1}. {step.title}
                                      </p>
                                    </div>
                                    {step.timestamp && <span className="text-xs text-[#8C8C8C]">{step.timestamp}</span>}
                                  </div>
                                </button>

                                {step.content && !isCollapsed && (
                                  <div className="mt-2 ml-3 pl-4 border-l-2 border-[#E5E7EB]">
                                    <pre className="text-sm text-[#8C8C8C] whitespace-pre-wrap font-sans leading-relaxed">
                                      {step.content}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {(message.solution || isStreamingSolution) && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#333333] flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-[#2E6BE6]" />
                            AI 生成方案
                            {isStreamingSolution && (
                              <span className="text-xs text-[#8C8C8C] font-normal flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                正在生成中...
                              </span>
                            )}
                          </h4>
                          {message.solution && (
                            <Button
                              size="sm"
                              onClick={() => handleDownloadSolution(message.solution!)}
                              className="bg-[#2E6BE6] hover:bg-[#001580]"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              下载方案
                            </Button>
                          )}
                        </div>

                        <Card className="border-[#2E6BE6]/20 bg-gradient-to-br from-blue-50/50 to-white">
                          <CardContent className="pt-4">
                            <div className="prose prose-sm max-w-none">
                              <pre className="text-sm text-[#333333] whitespace-pre-wrap font-sans leading-relaxed">
                                {isStreamingSolution ? streamingSolution : message.solution}
                                {isStreamingSolution && (
                                  <span className="inline-block w-1.5 h-4 bg-[#2E6BE6] animate-pulse ml-0.5" />
                                )}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {message.knowledgeSources && message.knowledgeSources.length > 0 && message.solution && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[#333333] flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-[#2E6BE6]" />
                          参考知识源
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {message.knowledgeSources.map((source, index) => (
                            <Card
                              key={source.id}
                              className="border-[#E5E7EB] hover:border-[#2E6BE6] transition-colors cursor-pointer"
                              onClick={() => handleKnowledgeClick(source)}
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#2E6BE6] text-white text-xs font-semibold flex items-center justify-center">
                                    {index + 1}
                                  </div>
                                  {source.type === "internal" ? (
                                    <Database className="h-5 w-5 text-[#2E6BE6] mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <Globe className="h-5 w-5 text-[#FF4D4F] mt-0.5 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium text-[#333333] truncate">{source.title}</p>
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        {source.relevance}%
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-[#8C8C8C] mb-2 line-clamp-2">{source.summary}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="secondary"
                                        className={
                                          source.type === "internal"
                                            ? "bg-blue-50 text-blue-700"
                                            : "bg-red-50 text-red-700"
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
                  </div>
                )}
              </div>
            ))}

            {/* 加载指示器 */}
            {isProcessing && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-[#8C8C8C]">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 正在思考中...
              </div>
            )}
          </div>

          <div className="border-t bg-white px-6 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  placeholder="继续对话，询问更多细节或提出新需求..."
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isProcessing}
                className="bg-[#2E6BE6] hover:bg-[#001580]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-[#8C8C8C] mt-2">按 Enter 发送，Shift + Enter 换行</p>
          </div>
        </DialogContent>
      </Dialog>

      {showCaseDetail && (
        <Dialog open={!!showCaseDetail} onOpenChange={() => setShowCaseDetail(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[#333333]">{showCaseDetail.title}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-[#2E6BE6]/10 text-[#2E6BE6] hover:bg-[#2E6BE6]/20">
                    {showCaseDetail.industry}
                  </Badge>
                  {showCaseDetail.scenarioTags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCaseDetail(null)}
                className="text-[#8C8C8C] hover:text-[#333333]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#8C8C8C]">客户痛点</h4>
                <p className="text-sm text-[#333333] leading-relaxed border-l-2 border-[#8C8C8C] pl-3">
                  {showCaseDetail.customerPainPoint}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#8C8C8C]">硬件配置</h4>
                <Card className="border-[#E5E7EB]">
                  <CardContent className="pt-4 space-y-2">
                    <p className="text-sm">
                      <strong>硬件型号：</strong>
                      {showCaseDetail.hardware.model}
                    </p>
                    <p className="text-sm">
                      <strong>部署规模：</strong>
                      {showCaseDetail.hardware.quantity} 台 | {showCaseDetail.hardware.nodes} 节点
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#8C8C8C]">技术架构</h4>
                <p className="text-sm text-[#333333] leading-relaxed border-l-2 border-[#2E6BE6] pl-3">
                  {showCaseDetail.technicalArchitecture}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#8C8C8C]">价值量化</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{showCaseDetail.roi.efficiencyIncrease}</p>
                      <p className="text-xs text-[#8C8C8C] mt-1">效率提升</p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{showCaseDetail.roi.costReduction}</p>
                      <p className="text-xs text-[#8C8C8C] mt-1">成本降低</p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-lg font-bold text-purple-600">{showCaseDetail.roi.deliveryTime}</p>
                      <p className="text-xs text-[#8C8C8C] mt-1">交付时间</p>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-lg font-bold text-orange-600">{showCaseDetail.roi.stability}</p>
                      <p className="text-xs text-[#8C8C8C] mt-1">系统稳定性</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
