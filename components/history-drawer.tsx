"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Pencil, Trash2, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface HistoryItem {
  id: string
  title: string
  query: string
  timestamp: Date
  messageCount: number
}

interface HistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onRename: (id: string, newTitle: string) => void
  onDelete: (id: string) => void
}

export function HistoryDrawer({ open, onOpenChange, history, onSelect, onRename, onDelete }: HistoryDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const handleStartEdit = (item: HistoryItem) => {
    setEditingId(item.id)
    setEditTitle(item.title)
  }

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[#2E6BE6]" />
            历史记录
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-[#8C8C8C] mb-4" />
              <p className="text-sm text-[#8C8C8C]">暂无历史记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <Card
                  key={item.id}
                  className="border-[#E5E7EB] hover:border-[#2E6BE6] transition-colors cursor-pointer"
                >
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(item.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(item.id)}
                            className="bg-[#2E6BE6] hover:bg-[#001580]"
                          >
                            保存
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between" onClick={() => onSelect(item)}>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-[#333333] line-clamp-2 mb-1">{item.title}</h4>
                            <p className="text-xs text-[#8C8C8C] line-clamp-1 mb-2">{item.query}</p>
                            <div className="flex items-center gap-3 text-xs text-[#8C8C8C]">
                              <span>{format(item.timestamp, "yyyy-MM-dd HH:mm", { locale: zhCN })}</span>
                              <span>•</span>
                              <span>{item.messageCount} 条对话</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {editingId !== item.id && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStartEdit(item)
                            }}
                            className="text-[#2E6BE6] hover:text-[#001580] hover:bg-blue-50"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            重命名
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(item.id)
                            }}
                            className="text-[#FF4D4F] hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
