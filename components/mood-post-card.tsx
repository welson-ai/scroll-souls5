"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart, ThumbsUp, Smile, MessageCircle } from "lucide-react"
import { addReaction, addComment } from "@/app/actions/mood-wall"
import { useState } from "react"

interface MoodPostCardProps {
  post: any
  userReactions?: string[]
  userId: string
  comments: any[]
}

export default function MoodPostCard({ post, userReactions = [], userId, comments }: MoodPostCardProps) {
  const [isReacting, setIsReacting] = useState(false)
  const [currentReactions, setCurrentReactions] = useState<string[]>(userReactions)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReaction = async (reactionType: string) => {
    if (isReacting) return
    setIsReacting(true)

    const hasReaction = currentReactions.includes(reactionType)
    setCurrentReactions((prev) => (hasReaction ? prev.filter((r) => r !== reactionType) : [...prev, reactionType]))

    const result = await addReaction(post.id, reactionType)

    if (!result.success) {
      // Revert on error
      setCurrentReactions(userReactions)
    }

    setIsReacting(false)
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await addComment(post.id, commentText)

    if (result.success) {
      setCommentText("")
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="glass border-0 p-4 transition-all hover:shadow-lg sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-2xl">{post.emotions?.emoji || "😊"}</span>
        <Badge
          variant="secondary"
          style={{
            backgroundColor: post.emotions?.color_primary + "20",
            color: post.emotions?.color_primary,
            borderColor: "transparent",
          }}
        >
          {post.emotions?.name || "Unknown"}
        </Badge>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <p className="mb-4 break-words text-sm text-foreground sm:text-base">{post.content}</p>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm sm:gap-4">
        <button
          onClick={() => handleReaction("support")}
          disabled={isReacting}
          className={`flex items-center gap-1 transition-colors ${
            currentReactions.includes("support")
              ? "text-pink-500 font-semibold"
              : "text-muted-foreground hover:text-pink-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${currentReactions.includes("support") ? "fill-current" : ""}`} />
          <span className="text-xs sm:text-sm">Support</span>
          {post.reaction_count?.support > 0 && <span className="text-xs">({post.reaction_count.support})</span>}
        </button>
        <button
          onClick={() => handleReaction("relate")}
          disabled={isReacting}
          className={`flex items-center gap-1 transition-colors ${
            currentReactions.includes("relate")
              ? "text-blue-500 font-semibold"
              : "text-muted-foreground hover:text-blue-500"
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${currentReactions.includes("relate") ? "fill-current" : ""}`} />
          <span className="text-xs sm:text-sm">Relate</span>
          {post.reaction_count?.relate > 0 && <span className="text-xs">({post.reaction_count.relate})</span>}
        </button>
        <button
          onClick={() => handleReaction("uplift")}
          disabled={isReacting}
          className={`flex items-center gap-1 transition-colors ${
            currentReactions.includes("uplift")
              ? "text-yellow-500 font-semibold"
              : "text-muted-foreground hover:text-yellow-500"
          }`}
        >
          <Smile className={`h-4 w-4 ${currentReactions.includes("uplift") ? "fill-current" : ""}`} />
          <span className="text-xs sm:text-sm">Uplift</span>
          {post.reaction_count?.uplift > 0 && <span className="text-xs">({post.reaction_count.uplift})</span>}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="ml-auto flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs sm:text-sm">{comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="border-t pt-3 space-y-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-xs text-muted-foreground sm:text-sm">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg bg-muted/50 p-2 sm:p-3">
                  <p className="text-xs text-foreground sm:text-sm">{comment.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a supportive comment..."
              className="min-h-[60px] text-sm resize-none"
              disabled={isSubmitting}
            />
            <Button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim() || isSubmitting}
              size="sm"
              className="self-end"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
