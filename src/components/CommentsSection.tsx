'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type Comment = {
  id: string
  user_id: string
  content: string
  rating: number | null
  created_at: string
  profiles: { username: string }
}

type Props = {
  recipeId: string
  initialComments: Comment[]
  currentUserId: string | null
}

export default function CommentsSection({ recipeId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    if (!content.trim()) {
      setError('Please write a comment')
      setLoading(false)
      return
    }

    if (content.trim().length < 3) {
      setError('Comment is too short')
      setLoading(false)
      return
    }

    if (!rating) {
      setError('Please select a rating')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('comments')
      .insert({
        recipe_id: recipeId,
        user_id: currentUserId,
        content: content.trim(),
        rating: rating,
      })
      .select('*, profiles(username)')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setComments([...comments, data])
    setContent('')
    setRating(null)
    setLoading(false)
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient()
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(comments.filter(c => c.id !== commentId))
  }

  function timeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Comments {comments.length > 0 && <span className="text-gray-400 font-normal text-base">({comments.length})</span>}
      </h2>

      {currentUserId ? (
        <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Leave a comment</p>

          <div className="flex items-center gap-1 mb-3">
            <span className="text-sm text-gray-500 mr-2">Rating:</span>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {rating && star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 text-sm">{error}</div>}

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            placeholder="Share your thoughts on this recipe..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post comment'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-5 mb-6 text-center">
          <p className="text-sm text-gray-500">
            <a href="/auth/login" className="text-orange-500 hover:underline">Log in</a> to leave a comment
          </p>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No comments yet — be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-500">
                    {comment.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">@{comment.profiles?.username}</p>
                    <p className="text-xs text-gray-400">{timeAgo(comment.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {comment.rating && (
                    <span className="text-sm text-gray-700">
                      {'⭐'.repeat(comment.rating)}
                    </span>
                  )}
                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition"
                    >
                      delete
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-900 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}