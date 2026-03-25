from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from supabase import create_client
from dotenv import load_dotenv
import os
import numpy as np

load_dotenv()

app = FastAPI()

# allow Next.js to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# connect to Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

class RecommendRequest(BaseModel):
    recipe_id: str
    top_n: int = 4

@app.post("/recommend")
def recommend(req: RecommendRequest):
    # 1. get recipes
    result = supabase.table("recipes").select(
        "id, title, ingredients, category, cuisine"
    ).execute()

    recipes = result.data

    if not recipes or len(recipes) < 2:
        return {"recommendations": []}

    # 2. turn each recipe into text
    def build_text(r):
        ingredients = " ".join(r.get("ingredients") or [])
        category = r.get("category") or ""
        cuisine = r.get("cuisine") or ""
        return f"{ingredients} {category} {cuisine}".lower()

    texts = [build_text(r) for r in recipes]
    ids = [r["id"] for r in recipes]

    # 3. vectorise
    vectoriser = TfidfVectorizer(stop_words="english")
    matrix = vectoriser.fit_transform(texts)

    # 4. find target recipe
    if req.recipe_id not in ids:
        return {"recommendations": []}

    idx = ids.index(req.recipe_id)

    # 5. similarity
    scores = cosine_similarity(matrix[idx], matrix).flatten()

    # 6. rank
    sorted_idx = np.argsort(scores)[::-1]
    sorted_idx = [i for i in sorted_idx if i != idx]

    # 7. return top N
    top = sorted_idx[:req.top_n]

    recommendations = [
        {
            "id": recipes[i]["id"],
            "title": recipes[i]["title"],
            "score": round(float(scores[i]), 3)
        }
        for i in top
    ]

    return {"recommendations": recommendations}