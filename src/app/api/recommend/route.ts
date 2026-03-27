import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { recipe_id } = await request.json()

  if (!recipe_id) {
    return NextResponse.json({ error: 'recipe_id required' }, { status: 400 })
  }

  try {
    const res = await fetch('https://flavour-fusion-ww5u.onrender.com/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipe_id, top_n: 4 })
    })

    const data = await res.json()

    return NextResponse.json(data)
  } catch (err) {
    console.error('ML error:', err)
    return NextResponse.json({ error: 'ML service unavailable' }, { status: 503 })
  }
}