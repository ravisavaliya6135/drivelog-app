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
# Convert MSYS path to Windows path
if service_account_path.startswith("/c/"):
    service_account_path = "C:" + service_account_path[2:].replace("/", "\\")
property_url = config["default_property"]

# Calculate date range: last 7 days ending 2 days ago (GSC lag)
end_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
start_date = (datetime.now() - timedelta(days=9)).strftime("%Y-%m-%d")

print(f"Fetching GSC data for {property_url}")
print(f"Date range: {start_date} to {end_date}")
print(f"Service account: {service_account_path}")

# Authenticate
credentials = service_account.Credentials.from_service_account_file(
    service_account_path,
    scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
)
service = build("searchconsole", "v1", credentials=credentials)

# Fetch query data
response = service.searchanalytics().query(
    siteUrl=property_url,
    body={
        "startDate": start_date,
        "endDate": end_date,
        "dimensions": ["query", "page"],
        "rowLimit": 1000
    }
).execute()

# Fetch totals (dimensionless)
totals_response = service.searchanalytics().query(
    siteUrl=property_url,
    body={
        "startDate": start_date,
        "endDate": end_date,
        "rowLimit": 1
    }
).execute()

print("\n=== GSC TOTALS ===")
if "rows" in totals_response and totals_response["rows"]:
    row = totals_response["rows"][0]
    print(f"Clicks: {row.get('clicks', 0)}")
    print(f"Impressions: {row.get('impressions', 0)}")
    print(f"CTR: {row.get('ctr', 0):.4f} ({row.get('ctr', 0)*100:.2f}%)")
    print(f"Position: {row.get('position', 0):.2f}")

print("\n=== TOP QUERIES (by clicks) ===")
if "rows" in response:
    rows = sorted(response["rows"], key=lambda x: x.get("clicks", 0), reverse=True)
    for row in rows[:20]:
        keys = row.get("keys", ["", ""])
        query = keys[0]
        page = keys[1] if len(keys) > 1 else ""
        clicks = row.get("clicks", 0)
        impressions = row.get("impressions", 0)
        ctr = row.get("ctr", 0)
        position = row.get("position", 0)
        if clicks > 0:
            print(f"  {clicks} clicks | {impressions} imp | {ctr*100:.2f}% CTR | pos {position:.1f} | {query} | {page}")

# Quick wins: position 4-10 with impressions but low CTR
print("\n=== QUICK WINS (pos 4-10, >5 impressions, <5% CTR) ===")
quick_wins = [
    row for row in response.get("rows", [])
    if 4 <= row.get("position", 100) <= 10
    and row.get("impressions", 0) > 5
    and row.get("ctr", 0) < 0.05
]
for row in sorted(quick_wins, key=lambda x: x.get("impressions", 0), reverse=True)[:15]:
    keys = row.get("keys", ["", ""])
    query = keys[0]
    page = keys[1] if len(keys) > 1 else ""
    clicks = row.get("clicks", 0)
    impressions = row.get("impressions", 0)
    ctr = row.get("ctr", 0)
    position = row.get("position", 0)
    print(f"  {impressions} imp | {clicks} clicks | {ctr*100:.2f}% CTR | pos {position:.1f} | {query} | {page}")

# This week vs last week comparison
this_week_end = datetime.now() - timedelta(days=2)
this_week_start = this_week_end - timedelta(days=6)
last_week_end = this_week_start - timedelta(days=1)
last_week_start = last_week_end - timedelta(days=6)

print(f"\n=== THIS WEEK vs LAST WEEK ===")
print(f"This week: {this_week_start.strftime('%Y-%m-%d')} to {this_week_end.strftime('%Y-%m-%d')}")
print(f"Last week: {last_week_start.strftime('%Y-%m-%d')} to {last_week_end.strftime('%Y-%m-%d')}")

for label, start, end in [
    ("This week", this_week_start.strftime("%Y-%m-%d"), this_week_end.strftime("%Y-%m-%d")),
    ("Last week", last_week_start.strftime("%Y-%m-%d"), last_week_end.strftime("%Y-%m-%d"))
]:
    r = service.searchanalytics().query(
        siteUrl=property_url,
        body={"startDate": start, "endDate": end, "rowLimit": 1}
    ).execute()
    if "rows" in r and r["rows"]:
        row = r["rows"][0]
        print(f"  {label}: {row.get('clicks',0)} clicks, {row.get('impressions',0)} imp, {row.get('ctr',0)*100:.2f}% CTR, pos {row.get('position',0):.2f}")
    else:
        print(f"  {label}: No data")