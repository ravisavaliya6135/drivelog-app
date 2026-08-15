import os
import json
import asyncio
from datetime import datetime, timedelta

# Load config
config_path = os.path.expanduser("~/.config/claude-seo/bing-api.json")
with open(config_path) as f:
    config = json.load(f)

api_key = config["api_key"]
site_url = config["site_url"]

print(f"Fetching Bing data for {site_url}")

async def fetch_bing_data():
    try:
        from bing_webmaster_tools import Settings, BingWebmasterClient
    except ImportError:
        print("bing-webmaster-tools not installed. Run: pip install bing-webmaster-tools")
        return None
    
    settings = Settings(api_key=api_key)
    
    async with BingWebmasterClient(settings) as client:
        results = {}
        
        # Get crawl issues
        try:
            crawl_issues = await client.crawling.get_crawl_issues(site_url=site_url)
            results["crawl_issues"] = crawl_issues
            print(f"Crawl issues: {len(crawl_issues) if crawl_issues else 0}")
        except Exception as e:
            print(f"Crawl issues error: {e}")
            results["crawl_issues"] = []
        
        # Get crawl statistics
        try:
            crawl_stats = await client.crawling.get_crawl_stats(site_url=site_url)
            results["crawl_stats"] = crawl_stats
            print(f"Crawl stats fetched")
        except Exception as e:
            print(f"Crawl stats error: {e}")
            results["crawl_stats"] = {}
        
        # Get link counts
        try:
            link_counts = await client.links.get_link_counts(site_url=site_url)
            results["link_counts"] = link_counts
            print(f"Link counts fetched")
        except Exception as e:
            print(f"Link counts error: {e}")
            results["link_counts"] = {}
        
        # Get connected pages
        try:
            connected_pages = await client.links.get_connected_pages(site_url=site_url)
            results["connected_pages"] = connected_pages
            print(f"Connected pages: {len(connected_pages) if connected_pages else 0}")
        except Exception as e:
            print(f"Connected pages error: {e}")
            results["connected_pages"] = []
        
        # Get URL submission quota
        try:
            quota = await client.submission.get_url_submission_quota(site_url=site_url)
            results["quota"] = quota
            print(f"Submission quota fetched")
        except Exception as e:
            print(f"Quota error: {e}")
            results["quota"] = {}
        
        return results

data = asyncio.run(fetch_bing_data())

if data:
    print("\n=== BING CRAWL ISSUES ===")
    for issue in data.get("crawl_issues", [])[:10]:
        print(f"  {issue}")
    
    print("\n=== BING CRAWL STATS ===")
    stats = data.get("crawl_stats", {})
    if isinstance(stats, list):
        for stat in stats[:10]:
            print(f"  {stat}")
    else:
        print(f"  {stats}")
    
    print("\n=== BING LINK COUNTS ===")
    links = data.get("link_counts", {})
    print(f"  {links}")
    
    print("\n=== BING CONNECTED PAGES (sample) ===")
    for page in data.get("connected_pages", [])[:10]:
        print(f"  {page}")
    
    print("\n=== BING SUBMISSION QUOTA ===")
    print(f"  {data.get('quota', {})}")
else:
    print("No data fetched")