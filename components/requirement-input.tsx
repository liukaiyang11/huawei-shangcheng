"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Loader2, Send, FileText, Edit2, Paperclip, X, Save } from "lucide-react"
import { extractStructuredData } from "@/lib/mock-ai"
import type { Requirement } from "@/types"

interface RequirementInputProps {
  mode?: "create" | "edit"
  initialData?: Requirement["structured"]
  onSubmit?: (requirement: Requirement) => void
  onSave?: (data: Partial<Requirement["structured"]>) => void
  onCancel?: () => void
  stage?: "input" | "review"
}

export function RequirementInput({
  mode = "create",
  initialData,
  onSubmit,
  onSave,
  onCancel,
  stage = "input",
}: RequirementInputProps) {
  const [inputType, setInputType] = useState<"text" | "voice" | "image">("text")
  const [rawInput, setRawInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [structuredData, setStructuredData] = useState<Requirement["structured"] | null>(
    mode === "edit" && initialData ? initialData : null,
  )
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([])
  const [parsingProgress, setParsingProgress] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setStructuredData(initialData)
    }
  }, [mode, initialData])

  const handleVoiceInput = async () => {
    setIsRecording(true)
    setParsingProgress("正在录音...")

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsRecording(false)
    setParsingProgress("语音转文字中...")

    const voiceText =
      "客户是做智慧交通的，想在路口部署边缘计算，大概50个路口，需要识别车牌和行人，预算大概200万，想用昇腾的卡。"

    let currentText = ""
    for (let i = 0; i < voiceText.length; i += 5) {
      currentText = voiceText.substring(0, i + 5)
      setRawInput(currentText)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setRawInput(voiceText)
    setInputType("voice")
    setParsingProgress("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setParsingProgress("正在上传文件...")

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])
    setInputType("image")

    setParsingProgress("AI解析文件内容...")
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setParsingProgress("提取关键信息...")

    const extractedText = "客户需求：智慧医疗影像识别系统\n预算：150万\n场景：CT/MRI图像分析\n硬件偏好：昇腾910B"

    const currentText = rawInput ? rawInput + "\n\n" + extractedText : extractedText
    const startIndex = rawInput.length > 0 ? rawInput.length + 2 : 0

    for (let i = 0; i <= extractedText.length; i += 8) {
      setRawInput(rawInput ? rawInput + "\n\n" + extractedText.substring(0, i) : extractedText.substring(0, i))
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsUploading(false)
    setParsingProgress("")
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAIProcess = async () => {
    if (!rawInput.trim()) return

    setIsProcessing(true)
    setParsingProgress("AI分析中...")

    try {
      setParsingProgress("识别客户行业...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setParsingProgress("分析技术需求...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      setParsingProgress("评估项目规模...")
      await new Promise((resolve) => setTimeout(resolve, 500))

      const structured = await extractStructuredData(rawInput)
      setStructuredData(structured)
      setParsingProgress("分析完成")

      setTimeout(() => setParsingProgress(""), 1000)
    } catch (error) {
      console.error("AI processing error:", error)
      setParsingProgress("分析失败，请重试")
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = () => {
    if (!structuredData) return

    const requirement: Requirement = {
      id: `req-${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
      rawInput: {
        type: inputType,
        content: rawInput,
        attachments: uploadedFiles.map((file) => file.url),
      },
      structured: structuredData,
    }

    onSubmit?.(requirement)

    setRawInput("")
    setStructuredData(null)
    setUploadedFiles([])
    setParsingProgress("")
  }

  const handleSave = () => {
    if (!structuredData) return
    onSave?.(structuredData)
  }

  const updateStructuredField = (path: string, value: any) => {
    if (!structuredData) return

    setStructuredData((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      const keys = path.split(".")
      let current: any = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      return updated
    })
  }

  return (
    <div className="space-y-6">
      {stage === "input" && (
        <Card className="floating-card border-[#E8EAED]">
          <CardContent className="space-y-4 pt-6">
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#2E6BE6]/10 border border-[#2E6BE6]/30 rounded-full text-sm text-[#2E6BE6]"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button onClick={() => removeFile(index)} className="hover:bg-[#2E6BE6]/20 rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Textarea
                placeholder="请输入客户需求、粘贴微信聊天记录...&#10;&#10;例如：客户是做智慧交通的，想在路口部署边缘计算，大概50个路口，需要识别车牌和行人，预算大概200万，想用昇腾的卡。"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="min-h-[160px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C] pr-24 bg-white"
                disabled={isProcessing || isUploading || isRecording}
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
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
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
                  disabled={!rawInput.trim() || isProcessing || isUploading || isRecording || !!parsingProgress}
                  title="AI智能分析"
                >
                  {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {parsingProgress && (
              <div className="flex items-center gap-2 text-sm text-[#2E6BE6] bg-[#2E6BE6]/5 px-3 py-2 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{parsingProgress}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {structuredData && (
        <Card className="floating-card border-[#2E6BE6]/50 tech-glow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-[#333333]">
              <span>{mode === "edit" ? "编辑需求信息" : "AI结构化分析结果"}</span>
              <Badge className="bg-[#2E6BE6]/10 text-[#2E6BE6] border-[#2E6BE6]/20">
                <Edit2 className="h-3 w-3 mr-1" />
                可编辑
              </Badge>
            </CardTitle>
            <CardDescription className="text-[#8C8C8C]">
              {mode === "edit" ? "修改需求信息后点击保存" : "请核对并修改AI提取的信息，确认无误后发布"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">客户背景</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">行业</label>
                  <Input
                    value={structuredData.industry}
                    onChange={(e) => updateStructuredField("industry", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">企业类型</label>
                  <Input
                    value={structuredData.companyType}
                    onChange={(e) => updateStructuredField("companyType", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs text-[#8C8C8C]">决策特征</label>
                  <Input
                    value={structuredData.decisionStyle}
                    onChange={(e) => updateStructuredField("decisionStyle", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">痛点分析</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">当前状态</label>
                  <Textarea
                    value={structuredData.currentState}
                    onChange={(e) => updateStructuredField("currentState", e.target.value)}
                    className="min-h-[60px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">目标状态</label>
                  <Textarea
                    value={structuredData.targetState}
                    onChange={(e) => updateStructuredField("targetState", e.target.value)}
                    className="min-h-[60px] resize-none border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">技术需求</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">昇腾型号（逗号分隔）</label>
                  <Input
                    value={structuredData.computePower.model.join(", ")}
                    onChange={(e) =>
                      updateStructuredField(
                        "computePower.model",
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    placeholder="例如：昇腾310, 昇腾910"
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8C8C8C]">算力类型</label>
                    <select
                      value={structuredData.computePower.type}
                      onChange={(e) => updateStructuredField("computePower.type", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                    >
                      <option value="training">训练</option>
                      <option value="inference">推理</option>
                      <option value="both">训练+推理</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#8C8C8C]">算力容量</label>
                    <Input
                      value={structuredData.computePower.capacity}
                      onChange={(e) => updateStructuredField("computePower.capacity", e.target.value)}
                      className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">应用场景（逗号分隔）</label>
                  <Input
                    value={structuredData.scenario.join(", ")}
                    onChange={(e) =>
                      updateStructuredField(
                        "scenario",
                        e.target.value.split(",").map((s) => s.trim()),
                      )
                    }
                    placeholder="例如：车牌识别, 行人检测"
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333] placeholder:text-[#8C8C8C]"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8EAED]" />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#8C8C8C]">项目边界</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">预算金额</label>
                  <Input
                    value={structuredData.budget.amount}
                    onChange={(e) => updateStructuredField("budget.amount", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">预算范围</label>
                  <select
                    value={structuredData.budget.range}
                    onChange={(e) => updateStructuredField("budget.range", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                  >
                    <option value="low">有限</option>
                    <option value="medium">中等</option>
                    <option value="high">充足</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">节点数量</label>
                  <Input
                    type="number"
                    value={structuredData.scale.nodes}
                    onChange={(e) => updateStructuredField("scale.nodes", Number.parseInt(e.target.value) || 0)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">并发数</label>
                  <Input
                    type="number"
                    value={structuredData.scale.concurrent}
                    onChange={(e) => updateStructuredField("scale.concurrent", Number.parseInt(e.target.value) || 0)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">时间线</label>
                  <Input
                    value={structuredData.timeline}
                    onChange={(e) => updateStructuredField("timeline", e.target.value)}
                    className="h-9 border-[#E8EAED] focus-visible:ring-[#2E6BE6] text-[#333333]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#8C8C8C]">紧急程度</label>
                  <select
                    value={structuredData.urgency}
                    onChange={(e) => updateStructuredField("urgency", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-[#E8EAED] bg-background px-3 py-1 text-sm text-[#333333] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6BE6]"
                  >
                    <option value="low">不急</option>
                    <option value="medium">一般</option>
                    <option value="high">紧急</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {mode === "create" ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#2E6BE6]/30 text-[#2E6BE6] hover:bg-[#2E6BE6]/10 hover:border-[#2E6BE6] bg-transparent"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    仅保存
                  </Button>
                  <Button className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white" onClick={handlePublish}>
                    <Send className="mr-2 h-4 w-4" />
                    发布需求
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#8C8C8C]/30 text-[#8C8C8C] hover:bg-[#8C8C8C]/10 bg-transparent"
                    onClick={onCancel}
                  >
                    <X className="mr-2 h-4 w-4" />
                    取消
                  </Button>
                  <Button className="flex-1 bg-[#2E6BE6] hover:bg-[#0036C3] text-white" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    保存修改
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
