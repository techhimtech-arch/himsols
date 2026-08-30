"""Playwright RBAC regression test: logged-out visitors must get NO 401/403/5xx.

Guards the regression where revoking anon EXECUTE on public.has_role broke every
RLS policy on public tables (navigation_items, footer_links, live_stats,
testimonials, corporate_*), leaving navbar/footer/stats empty for crawlers.

Run:  python3 tests/e2e/public_rbac.py
      BASE_URL=https://himsols.online python3 tests/e2e/public_rbac.py
"""

import asyncio
import os
import sys
from collections import defaultdict
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080").rstrip("/")
SCREENSHOTS = Path("/tmp/browser/public-rbac")

PUBLIC_ROUTES = [
    "/",
    "/about",
    "/corporate",
    "/schools",
    "/tree-plantation",
    "/partner-with-us",
    "/learn",
    "/blog",
    "/gallery",
    "/impact",
    "/contact",
    "/days",
]

# RPCs / tables a logged-out visitor must be able to read.
REQUIRED_PUBLIC_READS = [
    "navigation_items",
    "footer_links",
]

BAD_STATUSES = (401, 403)
results: list[tuple[bool, str]] = []


def check(ok: bool, label: str) -> None:
    results.append((ok, label))
    print(("PASS  " if ok else "FAIL  ") + label)


async def main() -> int:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    failures: dict[str, list[str]] = defaultdict(list)
    seen_reads: set[str] = set()
    console_errors: dict[str, list[str]] = defaultdict(list)
    current = {"route": "/"}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        # brand-new context each run => guaranteed logged-out (no storage state)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()

        def on_response(resp):
            status = resp.status
            url = resp.url
            for table in REQUIRED_PUBLIC_READS:
                if f"/rest/v1/{table}" in url:
                    seen_reads.add(table)
            if status in BAD_STATUSES or status >= 500:
                failures[current["route"]].append(f"{status} {url}")

        def on_console(msg):
            if msg.type == "error":
                console_errors[current["route"]].append(msg.text[:200])

        page.on("response", on_response)
        page.on("console", on_console)

        for route in PUBLIC_ROUTES:
            current["route"] = route
            await page.goto(f"{BASE_URL}{route}", wait_until="domcontentloaded")
            await page.wait_for_timeout(2500)
            bad = failures.get(route, [])
            check(not bad, f"logged out {route}: no 401/403/5xx ({len(bad)} bad)")
            for entry in bad[:5]:
                print("      " + entry)
            await page.screenshot(
                path=str(SCREENSHOTS / f"{route.strip('/').replace('/', '_') or 'home'}.png")
            )

        # Public chrome must actually render (proves anon reads resolved, not just 200-empty)
        current["route"] = "/"
        await page.goto(f"{BASE_URL}/", wait_until="domcontentloaded")
        await page.wait_for_timeout(2500)
        nav_links = await page.locator("nav a").count()
        footer_links = await page.locator("footer a").count()
        check(nav_links >= 3, f"navbar renders dynamic links (got {nav_links})")
        check(footer_links >= 3, f"footer renders dynamic links (got {footer_links})")

        for table in REQUIRED_PUBLIC_READS:
            check(table in seen_reads, f"anon read attempted for {table}")

        await browser.close()

    failed = [label for ok, label in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    for label in failed:
        print("  failed: " + label)
    if console_errors:
        print("\nconsole errors by route:")
        for route, msgs in console_errors.items():
            print(f"  {route}: {len(msgs)}")
            for m in msgs[:3]:
                print("     " + m)
    return 1 if failed else 0


sys.exit(asyncio.run(main()))
