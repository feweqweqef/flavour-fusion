import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { text, field } = await request.json()

  if (!text || text.trim().length < 5) {
    return NextResponse.json({ error: 'Text too short to rephrase' }, { status: 400 })
  }

  const systemPrompt = field === 'instructions'
    ? `You are a professional recipe writer. Rephrase the user's cooking instructions to be clear, numbered, and easy to follow like a professional cookbook. Return ONLY a JSON array of strings, one per step. No extra text.
Example: ["Preheat oven to 180°C.", "Mix the flour and sugar.", "Bake for 25 minutes."]`
    : `You are a professional recipe writer. Rephrase the user's description to be appetising and engaging, like a food magazine. 2-3 sentences max. Return ONLY the plain string, no quotes or extra text.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 400,
    })
  })

  let data
  try {
    data = await response.json()
  } catch {
    return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
  }

  if (!response.ok) {
    console.error('Groq error:', data)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }

  const raw = data.choices?.[0]?.message?.content || ''

  if (field === 'instructions') {
    try {
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) {
        return NextResponse.json({ result: parsed, field })
      }
    } catch {
      // fallback: split by newline
      const lines = raw
        .split(/\n/)
        .map((l: string) => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean)
      return NextResponse.json({ result: lines, field })
    }
  }

  return NextResponse.json({ result: raw.trim(), field })
}