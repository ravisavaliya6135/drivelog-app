import os
import json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load config
config_path = os.path.expanduser("~/.config/claude-seo/google-api.json")
with open(config_path) as f:
    config = json.load(f)

service_account_path = config["service_account_path"]
if service_account_path.startswith("/c/"):
    service_account_path = "C:" + service_account_path[2:].replace("/", "\\")
property_url = config["default_property"]

print(f"Fetching GSC sitemaps for {property_url}")

# Authenticate
credentials = service_account.Credentials.from_service_account_file(
    service_account_path,
    scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
)
service = build("searchconsole", "v1", credentials=credentials)

# Fetch sitemaps
sitemaps_response = service.sitemaps().list(siteUrl=property_url).execute()

print("\n=== GSC SITEMAPS ===")
if "sitemap" in sitemaps_response:
    for sitemap in sitemaps_response["sitemap"]:
        path = sitemap.get("path", "")
        last_submitted = sitemap.get("lastSubmitted", "")
        is_pending = sitemap.get("isPending", False)
        is_sitemaps_index = sitemap.get("isSitemapsIndex", False)
        type_ = sitemap.get("type", "")
        errors = sitemap.get("errors", 0)
        warnings = sitemap.get("warnings", 0)
        contents = sitemap.get("contents", [])
        print(f"  {path}")
        print(f"    Type: {type_}, Index: {is_sitemaps_index}, Pending: {is_pending}")
        print(f"    Last submitted: {last_submitted}")
        print(f"    Errors: {errors}, Warnings: {warnings}")
        for content in contents:
            content_type = content.get("type", "")
            submitted = content.get("submitted", 0)
            indexed = content.get("indexed", 0)
            print(f"    Content: {content_type} - Submitted: {submitted}, Indexed: {indexed}")
else:
    print("No sitemaps found")

# Also check URL inspection for a few key pages
print("\n=== URL INSPECTION (sample) ===")
key_urls = [
    "https://mechtoolshub.com/",
    "https://mechtoolshub.com/calculators/bolt-torque",
    "https://mechtoolshub.com/standards/agma-2001-gear-rating",
    "https://mechtoolshub.com/formulas/beam-bending-stress",
]

for url in key_urls:
    try:
        inspect_response = service.urlInspection().index().inspect(
            body={"inspectionUrl": url, "siteUrl": property_url}
        ).execute()
        result = inspect_response.get("inspectionResult", {})
        verdict = result.get("verdict", "UNKNOWN")
        coverage = result.get("indexStatusResult", {}).get("coverageState", "UNKNOWN")
        canonical = result.get("indexStatusResult", {}).get("canonicalUrl", "UNKNOWN")
        robots = result.get("indexStatusResult", {}).get("robotsTxtState", "UNKNOWN")
        print(f"  {url}")
        print(f"    Verdict: {verdict}")
        print(f"    Coverage: {coverage}")
        print(f"    Canonical: {canonical}")
        print(f"    Robots: {robots}")
    except Exception as e:
        print(f"  {url} - Error: {e}")