"""Playwright regression tests: protected-route auth redirects + post-login return.

Run:  python3 tests/e2e/auth_redirects.py            (against http://localhost:8080)
      BASE_URL=https://himsols.online python3 tests/e2e/auth_redirects.py

Covers:
  1. Logged out: /my-contributions, /profile, /order-history redirect to
     /auth?redirect=<original path>.
  2. Logged in (only when a Supabase session is injected into the env):
     visiting /auth?redirect=<path> returns the user to <path>.
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import requests
from playwright.async_api import async_playwright

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8080")
PROTECTED = ["/my-contributions", "/profile", "/order-history"]
SCREENSHOTS = Path("/tmp/browser/auth-redirects")

results: list[tuple[bool, str]] = []


def check(ok: bool, label: str) -> None:
    results.append((ok, label))
    print(("PASS  " if ok else "FAIL  ") + label)


async def test_logged_out(context) -> None:
    page = await context.new_page()
    for path in PROTECTED:
        await page.goto(f"{BASE_URL}{path}", wait_until="domcontentloaded")
        # allow the auth listener + redirect effect to settle
        await page.wait_for_timeout(2500)
        url = page.url
        check(
            "/auth" in url and f"redirect={path}" in url,
            f"logged out {path} -> /auth?redirect={path} (got {url})",
        )
        await page.screenshot(path=str(SCREENSHOTS / f"out{path.replace('/', '_')}.png"))
    await page.close()


def mint_session_via_password():
    """Sign in with TEST_EMAIL/TEST_PASSWORD to get a real session (fallback
    when Lovable does not inject one). Returns (storage_key, session_json)."""
    email = os.environ.get("TEST_EMAIL")
    password = os.environ.get("TEST_PASSWORD")
    url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    anon = os.environ.get("VITE_SUPABASE_PUBLISHABLE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    if not (email and password and url and anon):
        return None, None
    resp = requests.post(
        f"{url}/auth/v1/token?grant_type=password",
        headers={"apikey": anon, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=30,
    )
    if resp.status_code != 200:
        print(f"NOTE  password sign-in failed ({resp.status_code})")
        return None, None
    session = resp.json()
    project_ref = url.split("//")[1].split(".")[0]
    return f"sb-{project_ref}-auth-token", json.dumps(session)


async def restore_session(context, page) -> bool:
    storage_key = os.environ.get("LOVABLE_BROWSER_SUPABASE_STORAGE_KEY")
    session_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_SESSION_JSON")
    cookies_json = os.environ.get("LOVABLE_BROWSER_SUPABASE_COOKIES_JSON")
    if not (storage_key and session_json):
        storage_key, session_json = mint_session_via_password()
        cookies_json = None
    if not (storage_key and session_json):
        return False
    if cookies_json:
        cookies = json.loads(cookies_json)
        for c in cookies:
            c["url"] = BASE_URL
        await context.add_cookies(cookies)
    await page.goto(BASE_URL, wait_until="domcontentloaded")
    await page.evaluate(
        f"window.localStorage.setItem({json.dumps(storage_key)}, {json.dumps(session_json)})"
    )
    return True



async def test_logged_in(context) -> None:
    page = await context.new_page()
    if not await restore_session(context, page):
        print("SKIP  logged-in return-path tests (no Supabase session in env)")
        await page.close()
        return
    for path in PROTECTED:
        await page.goto(f"{BASE_URL}/auth?redirect={path}", wait_until="domcontentloaded")
        await page.wait_for_timeout(2500)
        check(
            page.url.rstrip("/").endswith(path),
            f"logged in /auth?redirect={path} -> {path} (got {page.url})",
        )
        await page.goto(f"{BASE_URL}{path}", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        check("/auth" not in page.url, f"logged in {path} stays put (got {page.url})")
    await page.close()


async def main() -> int:
    SCREENSHOTS.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        try:
            await test_logged_out(context)
            await test_logged_in(context)
        finally:
            await browser.close()

    failed = [label for ok, label in results if not ok]
    print(f"\n{len(results) - len(failed)}/{len(results)} checks passed")
    for label in failed:
        print("  failed: " + label)
    return 1 if failed else 0


sys.exit(asyncio.run(main()))
