import os

import google.generativeai as genai


def get_model():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.0-flash")


def get_gemini_response(prompt: str) -> str:
    model = get_model()
    response = model.generate_content(prompt)
    return response.text


def get_gemini_response_with_context(question: str, document_text: str) -> str:
    system_instruction = (
        "You are a document analyst. Answer the user's question using ONLY the "
        "document provided below. If the answer is not in the document, respond "
        'exactly: "I couldn\'t find that information." Do not make up or infer '
        "information that is not explicitly stated in the document."
    )

    full_prompt = (
        f"{system_instruction}\n\n"
        f"--- DOCUMENT START ---\n"
        f"{document_text}\n"
        f"--- DOCUMENT END ---\n\n"
        f"Question: {question}"
    )

    model = get_model()
    response = model.generate_content(full_prompt)
    return response.text
