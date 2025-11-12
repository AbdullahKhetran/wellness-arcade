"""
AIML API service for generating AI-powered affirmations
"""

import os
from dotenv import load_dotenv
import httpx
from typing import List

load_dotenv()


async def generate_ai_affirmation(selected_words: List[str]) -> str:
    """
    Generate an affirmation using AIML API based on selected words.
    
    Args:
        selected_words: List of words selected by the user
        
    Returns:
        Generated affirmation text
    """
    aiml_api_key = os.getenv("AIML_API_KEY")
    
    if not aiml_api_key:
        print("AIML_API_KEY not found, using fallback generation")
        return _fallback_generation(selected_words)
    
    try:
        # Prepare user words as comma-separated string
        user_words = ", ".join(selected_words)
        prompt = f"""
        
        You are a compassionate wellness coach whose only task is to create **short, positive, and empowering affirmations**. 

        You will be given a list of words that a user selects based on their feelings. Generate a **motivational affirmation** that reflects these feelings. 

        **IMPORTANT RULES:**
        - Output **exactly 1-2 sentences**.
        - Do **NOT** give advice, instructions, or steps.
        - Do **NOT** apologize or explain anything.
        - Focus entirely on encouragement and positivity.

        User words: {user_words}
        """
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = "https://api.aimlapi.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {aiml_api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    { "role": "user", "content":prompt }
                ],
                "temperature": 0.2
            }
            
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # Extract the generated affirmation from response
            # AIML API typically returns content in choices[0].message.content
            if "choices" in result and len(result["choices"]) > 0:
                message = result["choices"][0].get("message", {})
                generated_text = message.get("content", "").strip()
                
                if generated_text:
                    return generated_text
            
            # If we can't extract the affirmation, use fallback
            return _fallback_generation(selected_words)
            
    except httpx.HTTPStatusError as e:
        print(f"[ERROR] AIML API HTTP error: {e}")
        print(f"[ERROR] Status code: {e.response.status_code}")
        print(f"[ERROR] Response text: {e.response.text}")
        return _fallback_generation(selected_words)
    except httpx.HTTPError as e:
        print(f"[ERROR] AIML API HTTP error: {e}")
        print(f"[ERROR] Error type: {type(e)}")
        return _fallback_generation(selected_words)
    except Exception as e:
        print(f"[ERROR] Unexpected error generating affirmation with AIML API: {e}")
        print(f"[ERROR] Error type: {type(e)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        return _fallback_generation(selected_words)


def _fallback_generation(selected_words: List[str]) -> str:
    """Generate a simple fallback affirmation"""
    base_affirmation = " ".join(selected_words)
    return f'"{base_affirmation}." - You have the power to create positive change in your life.'