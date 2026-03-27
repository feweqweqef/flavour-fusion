// [[chatbot]]
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { message, history } = await request.json()

  const supabase = await createServerSupabaseClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('title, description, ingredients, instructions, category, cuisine, cooking_time')

  const recipesContext = recipes?.map(r => `
    Recipe: ${r.title}
    Category: ${r.category}
    Cuisine: ${r.cuisine || 'N/A'}
    Cooking time: ${r.cooking_time ? r.cooking_time + ' minutes' : 'N/A'}
    Description: ${r.description || 'N/A'}
    Ingredients: ${r.ingredients?.join(', ')}
  `).join('\n---\n')

  const systemPrompt = `You are Flavour Fusion's helpful cooking assistant. You help users find recipes, answer cooking questions, and give food advice.

Here are all the recipes currently in the Flavour Fusion database:
${recipesContext}

Guidelines:
- Answer questions about the recipes above
- Give cooking tips and food advice
- Keep responses concise and friendly
- If someone asks what recipes are available, list them clearly
- Format the message nicely and neatly
- Do not exceed a 100 words
- If they ask something irrelevant to food, politely say you can only help with food and recipes`

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant', // FIXED
    messages: [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 100,
  })
})

  let data

try {
  data = await response.json()
} catch (err) {
  const text = await response.text()
  console.error('Non-JSON response:', text)
  return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
}

  if (!response.ok) {
    console.error('Grok error:', data)
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }

  const text = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

  return NextResponse.json({ response: text })
}