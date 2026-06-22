import json
import os
import urllib.request
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS

def web_search(query: str) -> str:
    """Searches the web for information using DuckDuckGo.

    Args:
        query: The search query to run.
    """
    try:
        results = []
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=5):
                results.append(f"Title: {r['title']}\nURL: {r['href']}\nSnippet: {r['body']}\n---")
        if not results:
            return "No search results found."
        return "\n".join(results)
    except Exception as e:
        return f"Error performing search: {e}"

def fetch_website_content(url: str) -> str:
    """Fetches and extracts clean text content from a website.

    Args:
        url: The absolute URL of the website to fetch.
    """
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read()
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text
        text = soup.get_text()
        
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        clean_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Limit to first 2500 characters
        return clean_text[:2500]
    except Exception as e:
        return f"Error fetching website content: {e}"

def save_lead_to_db(lead_name: str, niche: str, website: str, score: int, qualification_reason: str, outreach_message: str) -> str:
    """Saves a qualified lead and its outreach draft to the local pipeline database.

    Args:
        lead_name: Name of the business or prospect.
        niche: The target niche category.
        website: URL of the prospect's website.
        score: Qualification score (0-100).
        qualification_reason: Reason for the qualification score.
        outreach_message: The drafted personalized outreach message.
    """
    file_path = "outreach_drafts.json"
    new_lead = {
        "lead_name": lead_name,
        "niche": niche,
        "website": website,
        "score": score,
        "qualification_reason": qualification_reason,
        "outreach_message": outreach_message
    }
    
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = []
            
        data.append(new_lead)
        
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
            
        return f"Successfully saved lead '{lead_name}' to {file_path}."
    except Exception as e:
        return f"Error saving lead: {e}"
