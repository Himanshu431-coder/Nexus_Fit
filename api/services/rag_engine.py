import json
import numpy as np
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

DATA_DIR = Path(__file__).parent.parent / "data"
KB_PATH = DATA_DIR / "knowledge_base.json"


class RAGEngine:
    def __init__(self):
        self.documents = []
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
        )
        self.doc_vectors = None
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        try:
            with open(KB_PATH, "r") as f:
                self.documents = json.load(f)
            
            texts = [doc["content"] for doc in self.documents]
            self.doc_vectors = self.vectorizer.fit_transform(texts)
            print(f"✅ RAG loaded: {len(self.documents)} documents indexed")
        except Exception as e:
            print(f"⚠️ RAG load failed: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> list[dict]:
        if self.doc_vectors is None or len(self.documents) == 0:
            return []

        query_vector = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vector, self.doc_vectors).flatten()
        
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.05:
                results.append({
                    "id": self.documents[idx]["id"],
                    "topic": self.documents[idx]["topic"],
                    "content": self.documents[idx]["content"],
                    "score": float(similarities[idx]),
                })
        
        return results

    def query(self, message: str) -> dict:
        context_docs = self.retrieve(message, top_k=3)
        
        is_calorie_question = any(
            word in message.lower() 
            for word in ["burn", "calories", "calorie", "predict", "how much", "how many"]
        )
        
        ml_prediction = None
        if is_calorie_question:
            try:
                from services.calorie_engine import engine
                if engine.model is not None:
                    default_input = {
                        "gender": "male", "age": 25, "height": 175,
                        "weight": 75, "duration": 30,
                        "heart_rate": 150, "body_temp": 37.5,
                    }
                    result = engine.predict(default_input)
                    ml_prediction = result["prediction"]
            except Exception:
                pass

        response = self._generate_response(message, context_docs, ml_prediction)
        
        return {
            "response": response,
            "sources": [doc["topic"] for doc in context_docs],
            "confidence": context_docs[0]["score"] if context_docs else 0.0,
            "ml_prediction": ml_prediction,
            "retrieved_docs": len(context_docs),
        }

    def _generate_response(
        self, query: str, context: list[dict], ml_prediction: dict | None
    ) -> str:
        query_lower = query.lower()
        
        if not context:
            return (
                "I'd love to help with that! Could you tell me more about what you're "
                "looking for? I can advise on specific exercises like HIIT, running, "
                "weightlifting, yoga, cycling, or swimming. I also cover nutrition, "
                "recovery, sleep, and training plans."
            )

        primary = context[0]
        response_parts = []

        # Opening
        if any(w in query_lower for w in ["what", "how", "why", "explain", "tell"]):
            response_parts.append(f"Great question! Here's what I know about **{primary['topic']}**:\n")
        elif any(w in query_lower for w in ["tip", "advice", "suggest", "recommend"]):
            response_parts.append(f"Here are my top recommendations for **{primary['topic']}**:\n")
        else:
            response_parts.append(f"Let me share some insights on **{primary['topic']}**:\n")

        # Primary context
        response_parts.append(primary["content"])

        # Add secondary context if relevant
        if len(context) > 1 and context[1]["score"] > 0.15:
            response_parts.append(f"\n\nAdditionally, regarding **{context[1]['topic']}**:")
            response_parts.append(context[1]["content"][:200] + "...")

        # ML Prediction (agentic behavior)
        if ml_prediction:
            response_parts.append(
                f"\n\n🔥 **Your ML Prediction:** Based on a 30-minute session, "
                f"you'd burn approximately **{ml_prediction['calories_burned']} kcal** "
                f"(range: {ml_prediction['lower_bound']}–{ml_prediction['upper_bound']} kcal "
                f"at {int(ml_prediction['confidence_level']*100)}% confidence). "
                f"Want me to predict for your exact stats? Just tell me your age, weight, "
                f"duration, and heart rate!"
            )

        # Follow-up
        response_parts.append(
            "\n\n💡 Want me to dive deeper into any specific aspect, "
            "or shall I suggest a personalized plan?"
        )

        return "\n".join(response_parts)


# Global instance
rag = RAGEngine()