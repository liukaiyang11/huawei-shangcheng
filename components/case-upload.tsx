"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, Send, Paperclip, Mic, FileText, Sparkles } from "lucide-react"
import type { Case } from "@/types"

interface CaseUploadProps {
  mode?: "create" | "edit"
  initialData?: Case
  onSubmit?: (data: any) => void
  onSave?: (data: Partial<Case>) => void
  onCancel?: () => void
}

export function CaseUpload({ mode = "create", initialData, onSubmit, onSave, onCancel }: CaseUploadProps) {
  const [inputStage, setInputStage] = useState<"input" | "analyzing" | "result">(mode === "edit" ? "result" : "input")
  const [rawInput, setRawInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; type: string }[]>([])
  const [parsingProgress, setParsingProgress] = useState("")
  const [streamingText, setStreamingText] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [manualData, setManualData] = useState({
    title: "",
    industry: "",
    scenario: "",
    softwareScenario: "",
    hardware: "",
    hardwareQuantity: "",
    hardwareNodes: "",
    software: "",
    softwarePlatform: "",
    concurrent: "",
    throughput: "",
    customerPain: "",
    technicalArchitecture: "",
    implementation: "",
    results: "",
    efficiencyIncrease: "",
    costReduction: "",
    deliveryTime: "",
    stability: "",
    pptUrl: "",
    videoUrl: "",
  })

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setManualData({
        title: initialData.title,
        industry: initialData.industry,
        scenario: initialData.scenarioTags.join(", "),
        softwareScenario: initialData.softwareScenario,
        hardware: initialData.hardware.model,
        hardwareQuantity: initialData.hardware.quantity.toString(),
        hardwareNodes: initialData.hardware.nodes.toString(),
        software: initialData.software.framework,
        softwarePlatform: initialData.software.platform,
        concurrent: initialData.capability?.concurrent?.toString() || "",
        throughput: initialData.capability?.throughput || "",
        customerPain: initialData.customerPainPoint,
        technicalArchitecture: initialData.technicalArchitecture,
        implementation: initialData.implementationDetails,
        results: initialData.results,
        efficiencyIncrease: initialData.roi.efficiencyIncrease,
        costReduction: initialData.roi.costReduction,
        deliveryTime: initialData.roi.deliveryTime,
        stability: initialData.roi.stability,
        pptUrl: initialData.resources.pptUrl || "",
        videoUrl: initialData.resources.videoUrl || "",
      })
    }
  }, [mode, initialData])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setIsUploading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newFiles = files.map((file) => ({
      name: file.name,
      type: file.type,
    }))
    setUploadedFiles((prev) => [...prev, ...newFiles])
    setIsUploading(false)
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVoiceInput = async () => {
    if (isRecording) {
      setIsRecording(false)
      await new Promise((resolve) => setTimeout(resolve, 500))
      setRawInput(
        rawInput +
          (rawInput ? " " : "") +
          "这是某银行OCR票据识别项目，使用Atlas 800服务器部署MindSpore框架，实现票据自动识别，日处理量10万张，准确率98%以上。",
      )
    } else {
      setIsRecording(true)
    }
  }

  const handleAIProcess = async () => {
    setIsProcessing(true)
    setInputStage("analyzing")
    setStreamingText("")

    const steps = [
      { message: "正在分析案例描述...", delay: 800 },
      { message: "识别项目基本信息...", delay: 600 },
      { message: "提取硬件配置信息...", delay: 700 },
      { message: "分析技术架构和实施方案...", delay: 800 },
      { message: "提取ROI数据和成果指标...", delay: 600 },
    ]

    for (const step of steps) {
      setParsingProgress(step.message)
      await new Promise((resolve) => setTimeout(resolve, step.delay))
    }

    // Simulate streaming text display
    const analysisText =
      "根据您提供的信息，AI已识别这是一个金融行业的OCR票据识别项目。项目使用华为Atlas 800服务器和MindSpore深度学习框架，实现了票据的自动识别和处理。系统日处理量达10万张，识别准确率超过98%，大幅提升了业务效率。"

    for (let i = 0; i <= analysisText.length; i++) {
      setStreamingText(analysisText.slice(0, i))
      await new Promise((resolve) => setTimeout(resolve, 20))
    }

    await new Promise((resolve) => setTimeout(resolve, 500))

    // Fill in the form data
    setManualData({
      title: "某银行OCR票据识别项目",
      industry: "金融",
      scenario: "OCR识别, 私有化部署, 票据处理",
      softwareScenario:
        "基于MindSpore深度学习框架，实现票据的文字识别、信息提取和智能分类。支持多种格式票据（发票、支票、汇票），通过自然语言处理技术实现结构化数据输出。",
      hardware: "Atlas 800 (Model 9000)",
      hardwareQuantity: "8",
      hardwareNodes: "8",
      software: "MindSpore",
      softwarePlatform: "华为AI决策方案平台",
      concurrent: "1000",
      throughput: "10万张/小时",
      customerPain: "人工票据审核效率低下，每天需处理10万+票据，错误率达5%，速度慢影响业务流程，且人力成本高昂。",
      technicalArchitecture:
        "昇腾910B训练卡 + 昇腾310推理部署，云边端三层架构。采用分布式训练加速模型迭代，边缘侧部署轻量化推理模型。",
      implementation:
        "部署8节点Atlas 800集群用于模型训练，50个边缘节点用于推理。采用联邦学习保护数据隐私，模型准确率达98%以上。",
      results: "系统上线后日处理量提升500%，识别准确率98%+，人工审核工作量减少90%，年节省人力成本约300万元。",
      efficiencyIncrease: "500%",
      costReduction: "30%",
      deliveryTime: "45天",
      stability: "99.99%",
      pptUrl: "/demo/solution.pdf",
      videoUrl: "/demo/product-demo.mp4",
    })

    setParsingProgress("")
    setIsProcessing(false)
    setInputStage("result")
  }

  const handleSave = () => {
    if (mode === "edit") {
      onSave?.({
        title: manualData.title,
        industry: manualData.industry,
        scenarioTags: manualData.scenario.split(",").map((s) => s.trim()),
        softwareScenario: manualData.softwareScenario,
        hardware: {
          model: manualData.hardware,
          quantity: Number.parseInt(manualData.hardwareQuantity) || 0,
          nodes: Number.parseInt(manualData.hardwareNodes) || 0,
        },
        software: {
          framework: manualData.software,
          platform: manualData.softwarePlatform,
        },
        capability: {
          concurrent: Number.parseInt(manualData.concurrent) || 0,
          throughput: manualData.throughput,
        },
        customerPainPoint: manualData.customerPain,
        technicalArchitecture: manualData.technicalArchitecture,
        implementationDetails: manualData.implementation,
        results: manualData.results,
        roi: {
          efficiencyIncrease: manualData.efficiencyIncrease,
          costReduction: manualData.costReduction,
          deliveryTime: manualData.deliveryTime,
          stability: manualData.stability,
        },
        resources: {
          pptUrl: manualData.pptUrl,
          videoUrl: manualData.videoUrl,
          productLinks: [],
        },
      })
    } else {
      onSubmit?.({
        ...manualData,
        hardwareQuantity: Number.parseInt(manualData.hardwareQuantity) || 0,
        hardwareNodes: Number.parseInt(manualData.hardwareNodes) || 0,
        concurrent: Number.parseInt(manualData.concurrent) || 0,
      })
    }
  }

  return (
    <div className="space-y-6">
      {mode === "create" && inputStage === "input" && (
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="请输入案例信息、粘贴微信聊天记录...&#10;&#10;例如：这是某银行OCR票据识别项目，使用Atlas 800服务器部署MindSpore框架，实现票据自动识别，日处理量10万张，准确率98%以上..."
              className="min-h-[160px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C] pr-24 bg-white"
              disabled={isProcessing || isUploading || isRecording}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (rawInput.trim() && !isProcessing) {
                    handleAIProcess()
                  }
                }
              }}
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#666666] hover:text-[#2E6BE6] hover:bg-gray-100"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isUploading || isRecording}
                title="上传文件"
              >
                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full ${
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-[#666666] hover:text-[#2E6BE6] hover:bg-gray-100"
                }`}
                onClick={handleVoiceInput}
                disabled={isProcessing || isUploading}
                title="语音输入"
              >
                {isRecording ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
              </Button>

              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-[#2E6BE6] hover:bg-[#0036C3] text-white shadow-lg"
                onClick={handleAIProcess}
                disabled={!rawInput.trim() || isProcessing || isUploading || isRecording}
                title="AI智能分析"
              >
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,video/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2E6BE6]/10 border border-[#2E6BE6]/30 rounded-full text-sm text-[#2E6BE6]"
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="hover:bg-[#2E6BE6]/20 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "create" && inputStage === "analyzing" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#2E6BE6] bg-gradient-to-r from-[#2E6BE6]/5 to-transparent px-4 py-3 rounded-lg border border-[#2E6BE6]/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">AI正在分析案例信息</span>
          </div>

          {parsingProgress && (
            <div className="flex items-center gap-2 text-sm text-[#2E6BE6] bg-[#2E6BE6]/5 px-4 py-3 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{parsingProgress}</span>
            </div>
          )}

          {streamingText && (
            <div className="bg-white border border-[#E8EAED] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-[#2E6BE6] mt-1 flex-shrink-0" />
                <div className="text-sm text-[#333333] leading-relaxed">{streamingText}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {(inputStage === "result" || mode === "edit") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[#333333]">
              {mode === "edit" ? "编辑案例信息" : "AI解析结果（可编辑）"}
            </h4>
            {mode === "create" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputStage("input")
                  setRawInput("")
                  setUploadedFiles([])
                }}
                className="text-[#8C8C8C] border-[#E8EAED]"
              >
                重新录入
              </Button>
            )}
          </div>

          <div className="grid gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">基本信息</h5>
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">项目标题</label>
                <Input
                  value={manualData.title}
                  onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                  placeholder="例如：某银行OCR票据识别项目"
                  className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">行业</label>
                  <Input
                    value={manualData.industry}
                    onChange={(e) => setManualData({ ...manualData, industry: e.target.value })}
                    placeholder="例如：金融"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">应用场景标签（逗号分隔）</label>
                  <Input
                    value={manualData.scenario}
                    onChange={(e) => setManualData({ ...manualData, scenario: e.target.value })}
                    placeholder="例如：OCR识别, 私有化部署"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">软件场景描述</label>
                <Textarea
                  value={manualData.softwareScenario}
                  onChange={(e) => setManualData({ ...manualData, softwareScenario: e.target.value })}
                  placeholder="描述使用的框架、算法和具体功能模块..."
                  className="min-h-[100px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>

            {/* 硬核配置 */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">硬核配置</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">硬件型号</label>
                  <Input
                    value={manualData.hardware}
                    onChange={(e) => setManualData({ ...manualData, hardware: e.target.value })}
                    placeholder="Atlas 800"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">数量（台）</label>
                  <Input
                    type="number"
                    value={manualData.hardwareQuantity}
                    onChange={(e) => setManualData({ ...manualData, hardwareQuantity: e.target.value })}
                    placeholder="8"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">节点数</label>
                  <Input
                    type="number"
                    value={manualData.hardwareNodes}
                    onChange={(e) => setManualData({ ...manualData, hardwareNodes: e.target.value })}
                    placeholder="8"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">软件框架</label>
                  <Input
                    value={manualData.software}
                    onChange={(e) => setManualData({ ...manualData, software: e.target.value })}
                    placeholder="MindSpore"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">软件平台</label>
                  <Input
                    value={manualData.softwarePlatform}
                    onChange={(e) => setManualData({ ...manualData, softwarePlatform: e.target.value })}
                    placeholder="华为AI决策方案平台"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">并发数</label>
                  <Input
                    type="number"
                    value={manualData.concurrent}
                    onChange={(e) => setManualData({ ...manualData, concurrent: e.target.value })}
                    placeholder="1000"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">吞吐量</label>
                  <Input
                    value={manualData.throughput}
                    onChange={(e) => setManualData({ ...manualData, throughput: e.target.value })}
                    placeholder="500路视频流实时分析"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>
            </div>

            {/* 客户痛点与方案 */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">客户痛点与方案</h5>
              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">客户痛点</label>
                <Textarea
                  value={manualData.customerPain}
                  onChange={(e) => setManualData({ ...manualData, customerPain: e.target.value })}
                  placeholder="描述客户面临的主要问题..."
                  className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">技术架构</label>
                <Textarea
                  value={manualData.technicalArchitecture}
                  onChange={(e) => setManualData({ ...manualData, technicalArchitecture: e.target.value })}
                  placeholder="描述技术架构和系统设计..."
                  className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">实施细节</label>
                <Textarea
                  value={manualData.implementation}
                  onChange={(e) => setManualData({ ...manualData, implementation: e.target.value })}
                  placeholder="描述实施过程和部署细节..."
                  className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#8C8C8C]">项目成果</label>
                <Textarea
                  value={manualData.results}
                  onChange={(e) => setManualData({ ...manualData, results: e.target.value })}
                  placeholder="描述项目交付成果和效果..."
                  className="min-h-[80px] border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                />
              </div>
            </div>

            {/* 价值量化 */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">价值量化</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">效率提升</label>
                  <Input
                    value={manualData.efficiencyIncrease}
                    onChange={(e) => setManualData({ ...manualData, efficiencyIncrease: e.target.value })}
                    placeholder="500%"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">成本降低</label>
                  <Input
                    value={manualData.costReduction}
                    onChange={(e) => setManualData({ ...manualData, costReduction: e.target.value })}
                    placeholder="30%"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">交付时间</label>
                  <Input
                    value={manualData.deliveryTime}
                    onChange={(e) => setManualData({ ...manualData, deliveryTime: e.target.value })}
                    placeholder="45天"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">系统稳定性</label>
                  <Input
                    value={manualData.stability}
                    onChange={(e) => setManualData({ ...manualData, stability: e.target.value })}
                    placeholder="99.99%"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>
            </div>

            {/* 可复制资源 */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-[#333333] border-b pb-2">可复制资源</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">方案PPT链接</label>
                  <Input
                    value={manualData.pptUrl}
                    onChange={(e) => setManualData({ ...manualData, pptUrl: e.target.value })}
                    placeholder="/demo/solution.pdf"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#8C8C8C]">演示视频链接</label>
                  <Input
                    value={manualData.videoUrl}
                    onChange={(e) => setManualData({ ...manualData, videoUrl: e.target.value })}
                    placeholder="/demo/product-demo.mp4"
                    className="border-[#E8EAED] focus-visible:ring-[#2E6BE6]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      {(inputStage === "result" || mode === "edit") && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 bg-transparent"
          >
            <FileText className="h-4 w-4 mr-2" />
            仅保存
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white">
            <Send className="h-4 w-4 mr-2" />
            {mode === "edit" ? "保存修改" : "发布案例"}
          </Button>
        </div>
      )}
    </div>
  )
}
