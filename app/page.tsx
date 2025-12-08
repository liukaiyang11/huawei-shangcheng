"use client"

import { useState } from "react"
import { RequirementInput } from "@/components/requirement-input"
import { RequirementCard } from "@/components/requirement-card"
import { CaseCard } from "@/components/case-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Plus,
  Search,
  Sparkles,
  CheckCircle,
  Loader2,
  FileDown,
  Video,
  Brain,
  Filter,
  Edit,
  FileText,
  Target,
  Building,
  ChevronRight,
  History,
} from "lucide-react"
import { mockCases, mockRequirements } from "@/lib/mock-data"
import { matchSimilarCases, generateProposal } from "@/lib/mock-ai"
import type { Requirement, Case } from "@/types"
import { PPTViewer } from "@/components/ppt-viewer"
import { VideoViewer } from "@/components/video-viewer"
import { CaseUpload } from "@/components/case-upload"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AIReasoningDialog } from "@/components/ai-reasoning-dialog"
import { HistoryDrawer } from "@/components/history-drawer" // Import HistoryDrawer

export default function Home() {
  const [activeTab, setActiveTab] = useState<"requirements" | "cases" | "matching">("requirements")
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements)
  const [cases, setCases] = useState<Case[]>(mockCases)
  const [showNewRequirement, setShowNewRequirement] = useState(false)
  const [showNewCase, setShowNewCase] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const [showPPTViewer, setShowPPTViewer] = useState(false)
  const [showVideoViewer, setShowVideoViewer] = useState(false)
  const [currentPPT, setCurrentPPT] = useState<string>("")
  const [currentVideo, setCurrentVideo] = useState<string>("")

  const [requirementSearch, setRequirementSearch] = useState("")
  const [requirementSearchType, setRequirementSearchType] = useState<"keyword" | "semantic">("keyword")
  const [requirementStatusFilter, setRequirementStatusFilter] = useState<"all" | "pending" | "matching" | "completed">(
    "all",
  )
  const [caseSearch, setCaseSearch] = useState("")
  const [caseSearchType, setCaseSearchType] = useState<"keyword" | "semantic">("keyword")

  // Renamed and reorganized matching states
  const [showMatchingResultDialog, setShowMatchingResultDialog] = useState(false)
  const [matchingRequirementForDialog, setMatchingRequirementForDialog] = useState<Requirement | null>(null)
  const [matchedCasesForDialog, setMatchedCasesForDialog] = useState<Case[]>([])
  const [similarityScoresForDialog, setSimilarityScoresForDialog] = useState<number[]>([])
  const [analysisText, setAnalysisText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false)
  const [generatedProposal, setGeneratedProposal] = useState<string>("") // Declare setGeneratedProposal

  const [viewerMode, setViewerMode] = useState<{ type: "ppt" | "video"; url: string; title: string } | null>(null)

  const [showAIReasoning, setShowAIReasoning] = useState(false)
  const [aiQuery, setAIQuery] = useState("")

  // Add history state and drawer
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [semanticHistory, setSemanticHistory] = useState<
    Array<{
      id: string
      title: string
      query: string
      timestamp: Date
      messageCount: number
      messages: any[]
    }>
  >([])

  const handleSubmitRequirement = async (requirement: Requirement) => {
    setRequirements((prev) => [requirement, ...prev])
    setShowNewRequirement(false)
  }

  const handleAddNewCase = (data: any) => {
    const newCase: Case = {
      id: Date.now().toString(),
      title: data.title,
      industry: data.industry,
      scenarioTags: data.scenario
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      softwareScenario: data.softwareScenario,
      hardware: {
        model: data.hardware.split(" x ")[0] || data.hardware,
        quantity: Number.parseInt(data.hardware.split(" x ")[1]) || 1,
        specs: data.hardware,
        nodes: data.hardware.split(" x ")[2] || "N/A", // Assuming nodes might be part of hardware string
      },
      software: {
        framework: data.software,
        components: [], // Placeholder
        platform: data.platform || "N/A", // Added platform
      },
      customerPainPoint: data.customerPain,
      implementationDetails: data.implementation,
      technicalArchitecture: data.technicalArchitecture || "N/A", // Added technicalArchitecture
      roi: {
        // Renamed performance to roi for clarity
        efficiencyIncrease: data.efficiencyIncrease || "+100%",
        costReduction: data.costReduction || "20%",
        deliveryTime: data.timeline || "30天",
        stability: data.stability || "99.9%",
      },
      resources: {
        pptUrl: data.pptUrl || "/demo.pptx", // Changed from ppt to pptUrl
        videoUrl: data.videoUrl || "/demo.mp4", // Changed from video to videoUrl
        demo: data.demoUrl || "#", // Changed from demo to demoUrl
      },
      status: "pending", // Added status
    }

    setCases((prev) => [newCase, ...prev])
    setShowNewCase(false)

    toast({
      title: "保存成功",
      description: "新案例已添加到案例库",
    })
  }

  const handleMatchFromDetail = async (requirement: Requirement) => {
    // setIsMatchingInDetail(true) // Removed as it's handled by isAnalyzing and isGeneratingProposal
    setMatchingRequirementForDialog(requirement)
    setSelectedRequirement(null) // Close requirement detail dialog

    setIsAnalyzing(true)
    setAnalysisText("") // Clear previous analysis

    try {
      const result = await matchSimilarCases(requirement, cases)

      if (result.matchedCases.length > 0) {
        setMatchedCasesForDialog(result.matchedCases)
        setSimilarityScoresForDialog(result.similarity)

        // Simulate streaming analysis
        const analysisSteps = [
          "正在分析需求特征...",
          `识别关键词：${requirement.structured.industry}、${requirement.structured.scenario.join(", ")}`,
          `算力需求：${requirement.structured.computePower.capacity} (${requirement.structured.computePower.type})`,
          `匹配到 ${result.matchedCases.length} 个相似案例`,
          "案例相似度分析完成",
          "开始生成针对性解决方案...",
        ]

        for (let i = 0; i < analysisSteps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 600))
          setAnalysisText((prev) => prev + analysisSteps[i] + "\n")
        }

        setIsAnalyzing(false)
        setShowMatchingResultDialog(true) // Open the matching result dialog

        // Update requirement status
        setRequirements((prev) =>
          prev.map((req) =>
            req.id === requirement.id
              ? { ...req, status: "matching", matchedCases: result.matchedCases.map((c) => c.id) }
              : req,
          ),
        )
      } else {
        setAnalysisText((prev) => prev + "未找到相似案例。\n")
        setIsAnalyzing(false)
        toast({
          title: "匹配失败",
          description: "未在案例库中找到与该需求相似的案例。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error matching cases:", error)
      setAnalysisText((prev) => prev + `错误：${error}\n`)
      setIsAnalyzing(false)
      toast({
        title: "匹配出错",
        description: "匹配过程中发生错误，请稍后重试。",
        variant: "destructive",
      })
    } finally {
      // setIsMatchingInDetail(false) // Removed
    }
  }

  const handleGenerateProposal = async () => {
    if (!matchingRequirementForDialog || matchedCasesForDialog.length === 0) return

    setIsGeneratingProposal(true)
    try {
      const proposal = await generateProposal(matchingRequirementForDialog, matchedCasesForDialog)
      setGeneratedProposal(proposal) // Use the declared state variable

      // Update requirement status
      setRequirements((prev) =>
        prev.map((req) =>
          req.id === matchingRequirementForDialog.id
            ? { ...req, status: "completed", generatedProposal: proposal }
            : req,
        ),
      )

      // Generate and download Word document
      downloadProposalAsWord(matchingRequirementForDialog, matchedCasesForDialog, proposal)

      // Close dialogs
      setShowMatchingResultDialog(false)
      setMatchingRequirementForDialog(null)
      setMatchedCasesForDialog([])
      setSimilarityScoresForDialog([])
      setAnalysisText("")
      setIsAnalyzing(false)
    } catch (error) {
      console.error("Error generating proposal:", error)
      toast({
        title: "生成方案失败",
        description: "生成解决方案时发生错误。",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingProposal(false)
    }
  }

  const downloadProposalAsWord = (requirement: Requirement, cases: Case[], proposal: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AI需求解决方案</title>
        <style>
          body { font-family: 'Microsoft YaHei', Arial, sans-serif; line-height: 1.8; padding: 40px; color: #333; }
          h1 { color: #0036C3; border-bottom: 3px solid #2E6BE6; padding-bottom: 10px; }
          h2 { color: #2E6BE6; margin-top: 30px; }
          h3 { color: #666; margin-top: 20px; }
          .section { margin-bottom: 30px; }
          .label { font-weight: bold; color: #666; }
          .value { margin-left: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #2E6BE6; color: white; }
          .case-card { background: #f5f7fa; padding: 20px; margin: 15px 0; border-left: 4px solid #2E6BE6; }
          .highlight { background-color: #fff3cd; padding: 2px 5px; }
        </style>
      </head>
      <body>
        <h1>华为AI需求解决方案</h1>
        <p style="color: #8C8C8C;">生成时间: ${new Date().toLocaleString("zh-CN")}</p>
        
        <div class="section">
          <h2>一、客户需求分析</h2>
          <p><span class="label">需求标题:</span><span class="value">${requirement.structured.industry} - ${requirement.structured.scenario.join(", ")}</span></p>
          <p><span class="label">行业:</span><span class="value">${requirement.structured.industry}</span></p>
          <p><span class="label">应用场景:</span><span class="value">${requirement.structured.scenario.join(", ")}</span></p>
          
          <h3>客户背景</h3>
          <p><span class="label">决策链特征:</span><span class="value">${requirement.structured.decisionStyle}</span></p>
          
          <h3>痛点与目标</h3>
          <p><span class="label">当前状态:</span><span class="value">${requirement.structured.currentState}</span></p>
          <p><span class="label">期望目标:</span><span class="value">${requirement.structured.targetState}</span></p>
          
          <h3>技术需求</h3>
          <p><span class="label">算力类型:</span><span class="value">${requirement.structured.computePower.type}</span></p>
          <p><span class="label">算力需求:</span><span class="value">${requirement.structured.computePower.capacity}</span></p>
          <p><span class="label">场景描述:</span><span class="value">${requirement.structured.scenarioDescription || "N/A"}</span></p>
          
          <h3>项目约束</h3>
          <p><span class="label">预算范围:</span><span class="value">${requirement.structured.budget.amount} (${requirement.structured.budget.range})</span></p>
          <p><span class="label">节点规模:</span><span class="value">${requirement.structured.scale.nodes}</span></p>
          <p><span class="label">时间要求:</span><span class="value">${requirement.structured.timeline}</span></p>
        </div>
        
        <div class="section">
          <h2>二、相似案例匹配（共${cases.length}个）</h2>
          ${cases
            .map(
              (caseData, index) => `
            <div class="case-card">
              <h3>案例${index + 1}: ${caseData.title}</h3>
              <p><span class="label">行业:</span><span class="value">${caseData.industry}</span></p>
              <p><span class="label">硬件配置:</span><span class="value">${caseData.hardware.model} x ${caseData.hardware.quantity}</span></p>
              <p><span class="label">软件场景:</span><span class="value">${caseData.softwareScenario}</span></p>
              <p><span class="label">软件栈:</span><span class="value">${caseData.software.framework}</span></p>
              <p><span class="label">并发能力:</span><span class="value">${caseData.hardware.concurrent || "N/A"}</span></p>
              <p><span class="label">ROI效果:</span><span class="value">效率提升 ${caseData.roi.efficiencyIncrease}, 成本降低 ${caseData.roi.costReduction}</span></p>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="section">
          <h2>三、AI生成解决方案</h2>
          <div style="background: #fff; padding: 20px; border: 2px solid #2E6BE6; border-radius: 8px;">
            ${proposal
              .split("\n")
              .map((line) => `<p>${line}</p>`)
              .join("")}
          </div>
        </div>
        
        <div class="section">
          <h2>四、后续行动</h2>
          <p>本方案由华为AI需求收集平台自动生成，请联系解决方案专家进行深度定制：</p>
          <ul>
            <li>技术方案深化与架构设计</li>
            <li>POC验证与测试</li>
            <li>商务报价与交付计划</li>
          </ul>
        </div>
        
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #ddd;">
        <p style="text-align: center; color: #8C8C8C; font-size: 12px;">
          本文档由华为AI需求收集平台自动生成 | 智能化销售支撑系统
        </p>
      </body>
      </html>
    `

    // Create Blob and download
    const blob = new Blob([htmlContent], { type: "application/msword" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `华为AI需求方案-${requirement.structured.industry}-${new Date().getTime()}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement)
    setSelectedRequirement(null)
  }

  const handleSaveRequirement = (updatedData: Partial<Requirement["structured"]>) => {
    if (!editingRequirement) return

    const updatedRequirement: Requirement = {
      ...editingRequirement,
      structured: {
        ...editingRequirement.structured,
        ...updatedData,
      },
    }

    setRequirements((prev) => prev.map((req) => (req.id === editingRequirement.id ? updatedRequirement : req)))

    setEditingRequirement(null)
    toast({
      title: "保存成功",
      description: "需求已更新",
    })
  }

  const handleEditCase = (caseData: Case) => {
    setEditingCase(caseData)
    setSelectedCase(null)
  }

  const handleSaveCase = (updatedData: Partial<Case>) => {
    if (!editingCase) return

    const updatedCase: Case = {
      ...editingCase,
      ...updatedData,
    }

    setCases((prev) => prev.map((c) => (c.id === editingCase.id ? updatedCase : c)))

    setEditingCase(null)
    toast({
      title: "保存成功",
      description: "案例已更新",
    })
  }

  const filteredRequirements = requirements.filter((req) => {
    // Status filter
    if (requirementStatusFilter !== "all" && req.status !== requirementStatusFilter) {
      return false
    }

    // Search filter
    if (!requirementSearch.trim()) return true

    const searchLower = requirementSearch.toLowerCase()

    if (requirementSearchType === "keyword") {
      // 关键词搜索：匹配行业、场景、原始输入
      return (
        req.structured.industry.toLowerCase().includes(searchLower) ||
        req.structured.scenario.some((s) => s.toLowerCase().includes(searchLower)) ||
        req.rawInput.content.toLowerCase().includes(searchLower) ||
        req.structured.computePower.model.some((m) => m.toLowerCase().includes(searchLower))
      )
    } else {
      // 语义搜索：模拟基于相似度的搜索
      const relevanceScore =
        (req.structured.industry.toLowerCase().includes(searchLower) ? 3 : 0) +
        (req.structured.scenario.some((s) => s.toLowerCase().includes(searchLower)) ? 2 : 0) +
        (req.structured.currentState.toLowerCase().includes(searchLower) ? 2 : 0) +
        (req.structured.targetState.toLowerCase().includes(searchLower) ? 2 : 0) +
        (req.rawInput.content.toLowerCase().includes(searchLower) ? 1 : 0)

      return relevanceScore > 0
    }
  })

  const filteredCases = cases.filter((caseData) => {
    if (!caseSearch.trim()) return true

    const searchLower = caseSearch.toLowerCase()

    if (caseSearchType === "keyword") {
      // 关键词搜索：匹配标题、行业、场景标签、硬件型号
      return (
        caseData.title.toLowerCase().includes(searchLower) ||
        caseData.industry.toLowerCase().includes(searchLower) ||
        caseData.scenarioTags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        caseData.hardware.model.toLowerCase().includes(searchLower)
      )
    } else {
      // 语义搜索：模拟基于相似度的搜索
      const relevanceScore =
        (caseData.title.toLowerCase().includes(searchLower) ? 3 : 0) +
        (caseData.industry.toLowerCase().includes(searchLower) ? 2 : 0) +
        (caseData.scenarioTags.some((tag) => tag.toLowerCase().includes(searchLower)) ? 2 : 0) +
        (caseData.customerPainPoint.toLowerCase().includes(searchLower) ? 1 : 0) +
        (caseData.technicalArchitecture.toLowerCase().includes(searchLower) ? 1 : 0)

      return relevanceScore > 0
    }
  })

  const handleSemanticSearch = () => {
    if (caseSearchType === "semantic" && caseSearch.trim()) {
      setAIQuery(caseSearch)
      setShowAIReasoning(true)
    }
  }

  const handleCaseClickFromAI = (caseId: string) => {
    const selectedCase = cases.find((c) => c.id === caseId)
    if (selectedCase) {
      setSelectedCase(selectedCase)
      setShowAIReasoning(false)
    }
  }

  const handleSaveSemanticHistory = (query: string, messages: any[]) => {
    const newHistory = {
      id: Date.now().toString(),
      title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
      query,
      timestamp: new Date(),
      messageCount: messages.length,
      messages,
    }
    setSemanticHistory((prev) => [newHistory, ...prev])
  }

  const handleSelectHistory = (item: any) => {
    setAIQuery(item.query)
    setShowAIReasoning(true)
    setShowHistoryDrawer(false)
  }

  const handleRenameHistory = (id: string, newTitle: string) => {
    setSemanticHistory((prev) => prev.map((item) => (item.id === id ? { ...item, title: newTitle } : item)))
  }

  const handleDeleteHistory = (id: string) => {
    setSemanticHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-[#0036C3] to-[#001580] text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">华为AI需求收集平台</h1>
                <p className="text-xs text-white/80">智能化销售支持系统</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("requirements")}
                className={
                  activeTab === "requirements"
                    ? "bg-[#001580] text-white hover:bg-[#001580]/90"
                    : "text-white hover:bg-white/10"
                }
              >
                需求收集
                {requirements.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white text-blue-600">
                    {requirements.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("cases")}
                className={
                  activeTab === "cases"
                    ? "bg-[#001580] text-white hover:bg-[#001580]/90"
                    : "text-white hover:bg-white/10"
                }
              >
                案例库
                <Badge variant="secondary" className="ml-2 bg-white text-blue-600">
                  {cases.length}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("matching")}
                className={
                  activeTab === "matching"
                    ? "bg-[#001580] text-white hover:bg-[#001580]/90"
                    : "text-white hover:bg-white/10"
                }
              >
                数据看板
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          {/* 需求收集Tab */}
          {activeTab === "requirements" && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">客户需求列表</h2>
                  <p className="text-sm text-muted-foreground">快速录入和管理客户需求</p>
                </div>
                <div className="flex-1 max-w-2xl flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索需求：行业、场景、算力型号..."
                      value={requirementSearch}
                      onChange={(e) => setRequirementSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                  <Select
                    value={requirementSearchType}
                    onValueChange={(value: "keyword" | "semantic") => setRequirementSearchType(value)}
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">
                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2" />
                          关键词
                        </div>
                      </SelectItem>
                      <SelectItem value="semantic">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          语义
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={requirementStatusFilter}
                    onValueChange={(value: "all" | "pending" | "matching" | "completed") =>
                      setRequirementStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-[120px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>
                          待对接
                        </div>
                      </SelectItem>
                      <SelectItem value="matching">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          对接中
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                          已闭环
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => setShowNewRequirement(true)}>
                <Plus className="h-4 w-4 mr-2" />
                新增需求
              </Button>
            </div>
          )}

          {/* 案例库Tab */}
          {activeTab === "cases" && (
            <div className="space-y-4">
              <div className="sticky top-[64px] z-10 bg-[#F5F7FA] pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">落地案例库</h2>
                      <p className="text-sm text-muted-foreground">成功案例与最佳实践</p>
                    </div>
                    <div className="flex items-center gap-3 flex-1 max-w-2xl">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={
                            caseSearchType === "semantic"
                              ? "输入需求，我们将基于需求分析与历史解决方案参考，为你定制专属解决方案"
                              : "搜索案例：行业、场景、硬件型号..."
                          }
                          value={caseSearch}
                          onChange={(e) => setCaseSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && caseSearchType === "semantic") {
                              e.preventDefault()
                              handleSemanticSearch()
                            }
                          }}
                          className="pl-9 h-9"
                        />
                      </div>
                      <Select
                        value={caseSearchType}
                        onValueChange={(value: "keyword" | "semantic") => setCaseSearchType(value)}
                      >
                        <SelectTrigger className="w-[120px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keyword">
                            <div className="flex items-center">
                              <Filter className="h-4 w-4 mr-2" />
                              关键词
                            </div>
                          </SelectItem>
                          <SelectItem value="semantic">
                            <div className="flex items-center">
                              <Brain className="h-4 w-4 mr-2" />
                              语义
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {/* CHANGE: Remove semantic search button, enter key directly opens dialog */}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => setShowNewCase(true)} className="bg-[#2E6BE6] hover:bg-[#0036C3] shadow-md">
                      <Plus className="h-4 w-4 mr-2" />
                      新增案例
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowHistoryDrawer(true)}
                      className="border-[#2E6BE6] text-[#2E6BE6] hover:bg-blue-50"
                    >
                      <History className="h-4 w-4 mr-2" />
                      历史记录
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 智能匹配Tab */}
          {activeTab === "matching" && (
            <div>
              <h2 className="text-lg font-semibold">AI智能匹配引擎</h2>
              <p className="text-sm text-muted-foreground">基于语义分析自动匹配相似案例</p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 需求收集Tab */}
        {activeTab === "requirements" && (
          <div className="space-y-4">
            {requirementSearch && (
              <p className="text-sm text-muted-foreground">
                找到 <span className="font-semibold text-foreground">{filteredRequirements.length}</span> 个匹配结果
                {requirementSearchType === "semantic" && " (基于语义相似度排序)"}
              </p>
            )}

            {/* 需求列表 */}
            {filteredRequirements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">未找到匹配的需求</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRequirements.map((req) => (
                  <RequirementCard key={req.id} requirement={req} onViewDetails={() => setSelectedRequirement(req)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 案例库Tab */}
        {activeTab === "cases" && (
          <div className="space-y-4">
            {caseSearch && (
              <p className="text-sm text-muted-foreground">
                找到 <span className="font-semibold text-foreground">{filteredCases.length}</span> 个匹配结果
                {caseSearchType === "semantic" && " (基于语义相似度排序)"}
              </p>
            )}

            {/* 案例列表 */}
            {filteredCases.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">未找到匹配的案例</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCases.map((caseData) => (
                  <CaseCard
                    key={caseData.id}
                    case={caseData}
                    onViewDetails={() => setSelectedCase(caseData)}
                    onViewPPT={() => {
                      if (caseData.resources.pptUrl) {
                        setViewerMode({
                          type: "ppt",
                          url: caseData.resources.pptUrl,
                          title: caseData.title,
                        })
                      }
                    }}
                    onViewVideo={() => {
                      if (caseData.resources.videoUrl) {
                        setViewerMode({
                          type: "video",
                          url: caseData.resources.videoUrl,
                          title: caseData.title,
                        })
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 智能匹配Tab */}
        {activeTab === "matching" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-primary">{requirements.length}</div>
                        <div className="text-sm text-muted-foreground">总需求数</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-green-600">
                          {requirements.filter((r) => r.matchedCases && r.matchedCases.length > 0).length}
                        </div>
                        <div className="text-sm text-muted-foreground">已匹配</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center space-y-2">
                        <div className="text-3xl font-bold text-blue-600">{cases.length}</div>
                        <div className="text-sm text-muted-foreground">案例库总数</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-sm">匹配算法说明</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span>
                        <strong>行业匹配：</strong>优先匹配相同行业的成功案例
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span>
                        <strong>场景匹配：</strong>基于应用场景标签进行语义相似度计算
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span>
                        <strong>硬件匹配：</strong>匹配相同或兼容的昇腾硬件型号
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span>
                        <strong>自动生成：</strong>基于Top 3案例自动生成初步解决方案
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 新增需求对话框 */}
      <Dialog open={showNewRequirement} onOpenChange={setShowNewRequirement}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增客户需求</DialogTitle>
            <DialogDescription>使用语音、文本或图片快速录入客户需求，AI将自动提取关键信息</DialogDescription>
          </DialogHeader>
          <RequirementInput onSubmit={handleSubmitRequirement} />
        </DialogContent>
      </Dialog>

      {/* 需求详情对话框 */}
      <Dialog
        open={!!selectedRequirement}
        onOpenChange={() => {
          setSelectedRequirement(null)
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedRequirement && (
            <>
              <DialogHeader className="flex-shrink-0 border-b pb-4">
                <DialogTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#2E6BE6]" />
                    需求详情
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleEditRequirement(selectedRequirement)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                {/* Who - 客户背景 */}
                <div>
                  <h4 className="font-semibold text-base mb-4 text-[#333333]">客户背景</h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <div className="text-[#8C8C8C] mb-2">行业</div>
                      <div className="text-[#333333] font-medium">{selectedRequirement.structured.industry}</div>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-2">企业类型</div>
                      <div className="text-[#333333] font-medium">{selectedRequirement.structured.companyType}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[#8C8C8C] mb-2">决策特征</div>
                      <div className="text-[#333333]">{selectedRequirement.structured.decisionStyle}</div>
                    </div>
                  </div>
                </div>

                {/* Why - 痛点分析 */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-base mb-4 text-[#333333]">痛点分析</h4>
                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="text-[#8C8C8C] mb-2">当前状态</div>
                      <p className="text-[#333333] leading-relaxed pl-4 border-l-2 border-gray-200">
                        {selectedRequirement.structured.currentState}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-2">目标状态</div>
                      <p className="text-[#333333] font-medium leading-relaxed pl-4 border-l-2 border-[#2E6BE6]">
                        {selectedRequirement.structured.targetState}
                      </p>
                    </div>
                  </div>
                </div>

                {/* What - 技术需求 */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-base mb-4 text-[#333333]">技术需求</h4>
                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="text-[#8C8C8C] mb-3">算力需求</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequirement.structured.computePower.model.map((model) => (
                          <Badge key={model} variant="secondary" className="bg-[#E8F0FE] text-[#2E6BE6] border-0">
                            {model}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="border-[#8C8C8C] text-[#8C8C8C]">
                          {selectedRequirement.structured.computePower.type}
                        </Badge>
                        <Badge variant="outline" className="border-[#8C8C8C] text-[#8C8C8C]">
                          {selectedRequirement.structured.computePower.capacity}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-3">应用场景</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequirement.structured.scenario.map((s) => (
                          <Badge key={s} className="bg-[#2E6BE6] hover:bg-[#0036C3]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* How Much - 项目边界 */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-base mb-4 text-[#333333]">项目边界</h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <div className="text-[#8C8C8C] mb-2">预算</div>
                      <div className="text-[#333333] font-medium">
                        {selectedRequirement.structured.budget.amount}
                        <span className="ml-2 text-[#8C8C8C] font-normal">
                          (
                          {selectedRequirement.structured.budget.range === "high"
                            ? "充足"
                            : selectedRequirement.structured.budget.range === "low"
                              ? "有限"
                              : "中等"}
                          )
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-2">时间线</div>
                      <div className="text-[#333333] font-medium">{selectedRequirement.structured.timeline}</div>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-2">规模</div>
                      <div className="text-[#333333]">{selectedRequirement.structured.scale.nodes} 节点</div>
                    </div>
                    <div>
                      <div className="text-[#8C8C8C] mb-2">并发</div>
                      <div className="text-[#333333]">{selectedRequirement.structured.scale.concurrent} 路</div>
                    </div>
                  </div>
                </div>

                {!selectedRequirement.generatedProposal && selectedRequirement.status !== "completed" && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3]"
                      onClick={() => handleMatchFromDetail(selectedRequirement)}
                      disabled={isAnalyzing} // Use isAnalyzing to disable button during analysis
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          正在匹配...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          匹配需求方案
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {selectedRequirement.generatedProposal && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2 text-muted-foreground">生成的方案</h4>
                    <Card className="border-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">方案已生成</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{selectedRequirement.generatedProposal}</p>
                        <Button
                          className="mt-4 w-full bg-[#2E6BE6] hover:bg-[#0036C3]"
                          onClick={() => {
                            const matchedCaseData = cases.filter((c) =>
                              selectedRequirement.matchedCases?.includes(c.id),
                            )
                            downloadProposalAsWord(
                              selectedRequirement,
                              matchedCaseData,
                              selectedRequirement.generatedProposal!,
                            )
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          下载完整方案Word文档
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 案例详情对话框 */}
      <Dialog open={!!selectedCase && !viewerMode} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedCase && (
            <>
              <DialogHeader className="flex-shrink-0 border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <DialogTitle>{selectedCase.title}</DialogTitle>
                    <DialogDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge>{selectedCase.industry}</Badge>
                        {selectedCase.scenarioTags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </DialogDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCase(selectedCase)}
                    className="border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    编辑
                  </Button>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                {/* 软件场景 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">软件场景</h4>
                  <p className="text-sm leading-relaxed">{selectedCase.softwareScenario}</p>
                </div>

                {/* 客户痛点 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">客户痛点</h4>
                  <p className="text-sm">{selectedCase.customerPainPoint}</p>
                </div>

                {/* 硬核配置 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground">硬核配置</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground mb-1">硬件清单</div>
                        <div className="font-semibold">{selectedCase.hardware.model}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedCase.hardware.quantity} 台 | {selectedCase.hardware.nodes} 节点
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-xs text-muted-foreground mb-1">软件栈</div>
                        <div className="font-semibold">{selectedCase.software.framework}</div>
                        <div className="text-sm text-muted-foreground">{selectedCase.software.platform}</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* 技术架构 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">技术架构</h4>
                  <p className="text-sm">{selectedCase.technicalArchitecture}</p>
                </div>

                {/* 实施细节 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">实施细节</h4>
                  <p className="text-sm">{selectedCase.implementationDetails}</p>
                </div>

                {/* 价值量化 */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-sm mb-3 text-muted-foreground">价值量化</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+{selectedCase.roi.efficiencyIncrease}</div>
                      <div className="text-xs text-muted-foreground mt-1">效率提升</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">-{selectedCase.roi.costReduction}</div>
                      <div className="text-xs text-muted-foreground mt-1">成本降低</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-lg font-bold">{selectedCase.roi.deliveryTime}</div>
                      <div className="text-xs text-muted-foreground mt-1">交付时间</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-lg font-bold">{selectedCase.roi.stability}</div>
                      <div className="text-xs text-muted-foreground mt-1">系统稳定性</div>
                    </div>
                  </div>
                </div>

                {/* 可复制资源 */}
                {(selectedCase.resources.pptUrl || selectedCase.resources.videoUrl) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3 text-muted-foreground">可复制资源</h4>
                    <div className="flex gap-2">
                      {selectedCase.resources.pptUrl && (
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewerMode({
                              type: "ppt",
                              url: selectedCase.resources.pptUrl!,
                              title: selectedCase.title,
                            })
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          查看方案PPT
                        </Button>
                      )}
                      {selectedCase.resources.videoUrl && (
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewerMode({
                              type: "video",
                              url: selectedCase.resources.videoUrl!,
                              title: selectedCase.title,
                            })
                          }}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          观看演示视频
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* PPT and video viewer dialogs */}
      <Dialog open={!!viewerMode} onOpenChange={() => setViewerMode(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh]">
          {viewerMode?.type === "ppt" && <PPTViewer pptUrl={viewerMode.url} title={viewerMode.title} />}
          {viewerMode?.type === "video" && <VideoViewer videoUrl={viewerMode.url} title={viewerMode.title} />}
        </DialogContent>
      </Dialog>

      {/* Matching result dialog */}
      <Dialog
        open={showMatchingResultDialog}
        onOpenChange={() => {
          setShowMatchingResultDialog(false)
          setMatchingRequirementForDialog(null)
          setMatchedCasesForDialog([])
          setSimilarityScoresForDialog([])
          setAnalysisText("")
          setIsAnalyzing(false)
          setIsGeneratingProposal(false) // Reset proposal generation state
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {matchingRequirementForDialog && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-[#2E6BE6]" />
                  需求方案匹配结果
                </DialogTitle>
                <DialogDescription>
                  为"{matchingRequirementForDialog.structured.industry} -{" "}
                  {matchingRequirementForDialog.structured.scenario.join(", ")}" 智能生成解决方案
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <Card className="border-[#2E6BE6]/30">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#2E6BE6]" />
                      匹配到 {matchedCasesForDialog.length} 个相似参考案例
                    </h3>
                    <div className="space-y-3">
                      {matchedCasesForDialog.map((caseData, index) => (
                        <div
                          key={caseData.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-white border border-[#2E6BE6]/20 hover:border-[#2E6BE6]/40 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-[#2E6BE6]" />
                                <span className="font-medium text-[#333333]">{caseData.title}</span>
                              </div>
                              <span className="text-sm px-2 py-1 rounded-full bg-[#2E6BE6]/10 text-[#2E6BE6] font-medium">
                                {Math.round(similarityScoresForDialog[index])}% 匹配
                              </span>
                            </div>
                            <p className="text-sm text-[#8C8C8C] mt-1 line-clamp-1">{caseData.softwareScenario}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedCase(caseData)}
                            className="text-[#2E6BE6] hover:text-[#0036C3] hover:bg-blue-50"
                          >
                            查看详情
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#2E6BE6] border-2 bg-gradient-to-br from-white to-blue-50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2E6BE6] text-white">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-[#333333]">AI智能分析</h4>
                          <p className="text-sm text-[#8C8C8C]">基于成功案例生成定制化解决方案</p>
                        </div>
                      </div>

                      {/* Analysis output */}
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[200px] font-mono text-sm text-gray-800 dark:text-gray-200">
                        <div className="whitespace-pre-wrap">
                          {analysisText}
                          {isAnalyzing && (
                            <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1 rounded-sm"></span>
                          )}
                        </div>
                        {!isAnalyzing && analysisText && (
                          <div className="text-green-600 mt-2">✓ 分析完成，准备生成方案</div>
                        )}
                      </div>

                      {/* Generate button */}
                      <Button
                        size="lg"
                        className="w-full bg-[#2E6BE6] hover:bg-[#0036C3] h-12 text-base"
                        onClick={handleGenerateProposal}
                        disabled={isGeneratingProposal || isAnalyzing}
                      >
                        {isGeneratingProposal ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            正在生成方案并导出Word文档...
                          </>
                        ) : (
                          <>
                            <FileDown className="mr-2 h-5 w-5" />
                            生成解决方案并下载Word文档
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 新增案例对话框 */}
      <Dialog open={showNewCase} onOpenChange={setShowNewCase}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增案例</DialogTitle>
            <DialogDescription>上传项目复盘文档或手动输入案例信息</DialogDescription>
          </DialogHeader>
          <CaseUpload onSubmit={handleAddNewCase} onCancel={() => setShowNewCase(false)} />
        </DialogContent>
      </Dialog>

      {/* 需求编辑对话框 */}
      <Dialog open={!!editingRequirement} onOpenChange={() => setEditingRequirement(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {editingRequirement && (
            <RequirementInput
              mode="edit"
              initialData={editingRequirement.structured}
              onSave={handleSaveRequirement}
              onCancel={() => setEditingRequirement(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 案例编辑对话框 */}
      <Dialog open={!!editingCase} onOpenChange={() => setEditingCase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {editingCase && (
            <CaseUpload
              mode="edit"
              initialData={editingCase}
              onSave={handleSaveCase}
              onCancel={() => setEditingCase(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AIReasoningDialog
        open={showAIReasoning}
        onOpenChange={setShowAIReasoning}
        query={aiQuery}
        internalCases={cases}
        onCaseClick={(caseId) => {
          const caseData = cases.find((c) => c.id === caseId)
          if (caseData) setSelectedCase(caseData)
        }}
        onSaveHistory={handleSaveSemanticHistory}
      />

      <HistoryDrawer
        open={showHistoryDrawer}
        onOpenChange={setShowHistoryDrawer}
        history={semanticHistory}
        onSelect={handleSelectHistory}
        onRename={handleRenameHistory}
        onDelete={handleDeleteHistory}
      />

      {/* 匹配加载状态 */}
      {/* This section seems redundant with isAnalyzing and isGeneratingProposal states */}
      {/* Consider removing or consolidating if not strictly necessary */}
      {/* {(isAnalyzing || isGeneratingProposal) && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[90%] max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div>
                  <h3 className="font-semibold mb-2">{isAnalyzing ? "AI智能匹配中..." : "正在生成方案..."}</h3>
                  <p className="text-sm text-muted-foreground">{isAnalyzing ? "正在案例库中搜索相似项目" : "请稍候，方案正在生成中"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )} */}
    </div>
  )
}
