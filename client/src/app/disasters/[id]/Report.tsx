'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'


export default function ReportFormPage() {
  const router = useRouter()
  const { id } = useParams()

  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [disasterTitle, setDisasterTitle] = useState('')
  const userId = 'ayush5267' // replace with actual user later

  useEffect(() => {
    fetch(`/api/disasters/${id}`)
      .then(res => res.json())
      .then(data => setDisasterTitle(data.title))
      .catch(err => console.error('Failed to fetch disaster title', err))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/disasters/${id}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        image_url: imageUrl,
        user_id: userId,
      }),
    })

    if (res.ok) {
      toast.success('Report submitted!')
      router.push(`/disasters/${id}`)
    } else {
      toast.error('Failed to submit report.')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Report for: {disasterTitle || '...'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded dark:bg-neutral-800 dark:text-white"
            rows={4}
          />
        </div>

        <div>
          <label className="block font-medium">Image URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded dark:bg-neutral-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Submit Report
        </button>
      </form>
    </div>
  )
}
