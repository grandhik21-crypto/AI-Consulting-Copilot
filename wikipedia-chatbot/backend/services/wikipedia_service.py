"""Wikipedia lookup service for the chatbot."""

import re

import wikipediaapi

# Wikipedia requires a descriptive User-Agent string that identifies this app.
USER_AGENT = "WikipediaChatbot/1.0 (beginner project; educational use)"
LANGUAGE = "en"
MAX_SENTENCES = 3

# Create one shared client so we do not rebuild it on every request.
_wiki = wikipediaapi.Wikipedia(user_agent=USER_AGENT, language=LANGUAGE)


def _first_few_sentences(text: str, max_sentences: int = MAX_SENTENCES) -> str:
    """Return the first few complete sentences from a block of text."""
    # Match sentence-like chunks ending in ., !, or ?
    sentences = re.findall(r"[^.!?]+[.!?]", text)
    if not sentences:
        return text.strip()
    return " ".join(sentence.strip() for sentence in sentences[:max_sentences])


def get_summary(query: str) -> str:
    """Fetch a short Wikipedia summary for the given search query."""
    # Trim whitespace so empty-looking questions are handled consistently.
    query = query.strip()

    # Ask Wikipedia for the page that matches this title/query.
    page = _wiki.page(query)

    # The library exposes exists() to tell us whether the page was found.
    if not page.exists():
        return (
            f'Sorry, I could not find a Wikipedia page for "{query}". '
            "Try rephrasing your question or using a more specific topic."
        )

    # Read the page summary (the intro paragraph Wikipedia provides).
    summary = page.summary.strip()
    if not summary:
        return (
            f'I found a page titled "{page.title}", but it has no summary text.'
        )

    # Return only the first few sentences so answers stay concise for chat.
    return _first_few_sentences(summary)
