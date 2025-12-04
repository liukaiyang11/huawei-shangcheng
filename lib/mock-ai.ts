import type { Requirement, Case } from "@/types"

// 模拟AI提取结构化数据
export async function extractStructuredData(rawInput: string): Promise<Requirement["structured"]> {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // 简单的关键词匹配模拟AI提取
  const lowerInput = rawInput.toLowerCase()

  // 提取行业
  let industry = "未知行业"
  if (lowerInput.includes("交通")) industry = "智慧交通"
  if (lowerInput.includes("金融") || lowerInput.includes("银行")) industry = "金融"
  if (lowerInput.includes("电力") || lowerInput.includes("能源")) industry = "电力能源"
  if (lowerInput.includes("制造") || lowerInput.includes("工厂")) industry = "智能制造"

  // 提取场景
  const scenarios: string[] = []
  if (lowerInput.includes("识别") || lowerInput.includes("检测")) scenarios.push("计算机视觉")
  if (lowerInput.includes("ocr") || lowerInput.includes("票据")) scenarios.push("OCR识别")
  if (lowerInput.includes("nlp") || lowerInput.includes("语言")) scenarios.push("自然语言处理")
  if (lowerInput.includes("训练") || lowerInput.includes("模型")) scenarios.push("模型训练")
  if (lowerInput.includes("推理")) scenarios.push("推理部署")

  // 提取昇腾型号
  const models: string[] = []
  if (lowerInput.includes("910") || lowerInput.includes("训练")) models.push("昇腾910B")
  if (lowerInput.includes("310") || lowerInput.includes("推理") || lowerInput.includes("边缘")) models.push("昇腾310")
  if (models.length === 0) models.push("昇腾310") // 默认

  // 提取预算
  let budgetAmount = "未指定"
  let budgetRange: "low" | "medium" | "high" = "medium"
  const budgetMatch = rawInput.match(/(\d+)\s*万/)
  if (budgetMatch) {
    budgetAmount = budgetMatch[1] + "万元"
    const amount = Number.parseInt(budgetMatch[1])
    if (amount < 100) budgetRange = "low"
    else if (amount > 300) budgetRange = "high"
  }

  // 提取节点数
  let nodes = 0
  const nodeMatch = rawInput.match(/(\d+)\s*个?(路口|节点|台|服务器)/)
  if (nodeMatch) nodes = Number.parseInt(nodeMatch[1])

  return {
    industry,
    companyType: lowerInput.includes("国企") ? "国有企业" : "企业",
    decisionStyle: budgetRange === "high" ? "技术导向" : "价格敏感",

    currentState: "完全人工操作",
    targetState: "实现智能化自动处理",

    computePower: {
      type: lowerInput.includes("训练") ? "training" : "inference",
      model: models,
      capacity: nodes > 0 ? `${nodes}节点集群` : "单节点部署",
    },
    scenario: scenarios.length > 0 ? scenarios : ["AI应用"],
    technicalRequirements: "高性能计算、低延迟响应",

    budget: {
      amount: budgetAmount,
      range: budgetRange,
    },
    scale: {
      nodes: nodes || 1,
      concurrent: nodes * 100 || 100,
    },
    timeline: lowerInput.includes("紧急") || lowerInput.includes("急") ? "1个月内" : "3个月内",
    urgency: lowerInput.includes("紧急") ? "high" : "medium",
  }
}

// 模拟语义匹配案例
export async function matchSimilarCases(
  requirement: Requirement,
  cases: Case[],
): Promise<{
  matchedCases: Case[]
  similarity: number[]
}> {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 简单的基于标签匹配
  const reqScenarios = requirement.structured.scenario
  const reqIndustry = requirement.structured.industry

  const scored = cases.map((c) => {
    let score = 0

    // 行业匹配
    if (c.industry === reqIndustry) score += 40

    // 场景标签匹配
    const matchingTags = c.scenarioTags.filter((tag) => reqScenarios.some((s) => s.includes(tag) || tag.includes(s)))
    score += matchingTags.length * 20

    // 硬件型号匹配
    const matchingModel = requirement.structured.computePower.model.some((m) =>
      c.hardware.model.includes(m.replace("昇腾", "")),
    )
    if (matchingModel) score += 30

    return { case: c, score }
  })

  // 排序并取Top 3
  const sorted = scored.sort((a, b) => b.score - a.score).slice(0, 3)

  return {
    matchedCases: sorted.map((s) => s.case),
    similarity: sorted.map((s) => s.score),
  }
}

// 模拟生成方案
export async function generateProposal(requirement: Requirement, matchedCases: Case[]): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 返回模拟的方案内容
  return `基于${matchedCases.length}个相似案例生成的初步解决方案`
}
