"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toggleFavorite, deleteJournalEntry } from "@/app/actions/journal"
import { MoreVertical, Star, Trash2 } from "lucide-react"

export default function JournalEntryActions({
  entryId,
  userId,
  isFavorite,
}: {
  entryId: string
  userId: string
  isFavorite: boolean
}) {
  const [favorite, setFavorite] = useState(isFavorite)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleToggleFavorite = async () => {
    const newFavorite = !favorite
    setFavorite(newFavorite)
    await toggleFavorite(entryId, userId, newFavorite)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    const result = await deleteJournalEntry(entryId, userId)
    if (result.success) {
      router.push("/journal")
    } else {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggleFavorite}>
          <Star className="mr-2 h-4 w-4" />
          {favorite ? "Remove from favorites" : "Add to favorites"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete entry"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
