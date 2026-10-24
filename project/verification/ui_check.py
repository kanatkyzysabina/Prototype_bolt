"""Browser check of the exported final prototype (Chromium via Playwright).
Usage: start the app (npm run preview -- --port 4173), then: python3 ui_check.py
The clock is fixed at 09:00 so the app's 'Current time' is 09:00 (now = 540)."""
import datetime, json, sys
from playwright.sync_api import sync_playwright

URL = "http://localhost:4173/"
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
results = []

def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS" if ok else "FAIL"), "|", name, "|", detail)

with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 800})
    page = ctx.new_page()
    page.clock.set_fixed_time(datetime.datetime(2026, 10, 24, 9, 0, 0))
    page.goto(URL)
    page.wait_for_selector("text=Check Availability")

    def run(room, start, end):
        page.select_option("select", label=None, value=room)
        page.fill("input[type=time] >> nth=0", start)
        page.fill("input[type=time] >> nth=1", end)
        page.click("text=Check Availability")
        page.wait_for_timeout(100)
        card = page.locator("div.rounded-lg.p-4").first
        return card.inner_text().replace("\n", " ")

    check("current time shown", "09:00" in page.inner_text("body"), "Current time 09:00")
    # blocked room reachable (AC3 fix)
    opt = page.locator("select option", has_text="Tesla Lab B")
    check("AC3 blocked option is NOT disabled", opt.get_attribute("disabled") is None)
    t = run("r2", "17:00", "18:00")
    check("AC3 blocked room -> Unavailable", t.startswith("Unavailable") and "blocked" in t, t)
    # Curie 220 bookings: 10:00-12:00 (600-720), 15:00-17:00 (900-1020)
    t = run("r3", "12:00", "14:00"); check("AC2 exactly 120 min (720-840) -> Available", t.startswith("Available"), t)
    t = run("r3", "12:00", "14:01"); check("AC2 121 min (720-841) -> Unavailable", t.startswith("Unavailable") and "121" in t, t)
    t = run("r3", "10:30", "11:30"); check("AC4 overlap inside 10:00-12:00 -> Unavailable", t.startswith("Unavailable") and "Overlaps" in t, t)
    t = run("r3", "12:00", "13:00"); check("AC4 touching end of 10:00-12:00 -> Available", t.startswith("Available"), t)
    t = run("r3", "13:00", "15:00"); check("AC4 touching start of 15:00-17:00 -> Available", t.startswith("Available"), t)
    t = run("r3", "09:00", "09:30"); check("AC1 starts now (09:00 = now) -> Unavailable", t.startswith("Unavailable") and "after the current time" in t, t)
    t = run("r3", "09:05", "09:35"); check("AC1 now+5 min -> Available", t.startswith("Available"), t)
    t = run("r3", "18:00", "17:00"); check("AC1/AC6 reversed times message", t.startswith("Unavailable") and "End time must be after start time" in t, t)
    t = run("r3", "17:00", "17:00"); check("AC1/AC6 start == end message", "End time must be after start time" in t, t)
    page.select_option("select", value="r3"); page.fill("input[type=time] >> nth=0", "17:00"); page.fill("input[type=time] >> nth=1", ""); page.click("text=Check Availability")
    t = page.locator("div.rounded-lg.p-4").first.inner_text().replace("\n", " ")
    check("AC6 empty End field message", "required" in t, t)
    # AC5: bookings list unchanged after checks
    page.select_option("select", value="r3")
    items = page.locator("ul li").all_inner_texts()
    check("AC5 booking list unchanged (2 Curie bookings)", len(items) == 2, " | ".join(i.replace("\n", " ") for i in items))
    # day bound: can the UI express 24:00 ?
    try:
        page.fill("input[type=time] >> nth=1", "24:00")
        val = page.input_value("input[type=time] >> nth=1")
        check("LIMITATION: 24:00 cannot be typed in the time field", val != "24:00", f"field value after typing 24:00 = '{val}'")
    except Exception as exc:
        check("LIMITATION: 24:00 cannot be typed in the time field", True, "browser rejected the value: " + str(exc).splitlines()[0])
    # screenshots (desktop, then mobile)
    page.select_option("select", value="r3"); page.fill("input[type=time] >> nth=0", "12:00"); page.fill("input[type=time] >> nth=1", "14:00"); page.click("text=Check Availability")
    page.screenshot(path=f"{OUT}/final_desktop_available.png", full_page=True)
    page.select_option("select", value="r2"); page.click("text=Check Availability")
    page.screenshot(path=f"{OUT}/final_desktop_blocked.png", full_page=True)
    m = b.new_context(viewport={"width": 375, "height": 800}, device_scale_factor=2)
    mp = m.new_page(); mp.clock.set_fixed_time(datetime.datetime(2026, 10, 24, 9, 0, 0)); mp.goto(URL); mp.wait_for_selector("text=Check Availability")
    mp.select_option("select", value="r3"); mp.fill("input[type=time] >> nth=0", "10:30"); mp.fill("input[type=time] >> nth=1", "11:30"); mp.click("text=Check Availability")
    mp.screenshot(path=f"{OUT}/final_mobile_375_unavailable.png", full_page=True)
    sw = mp.evaluate("document.documentElement.scrollWidth"); cw = mp.evaluate("document.documentElement.clientWidth")
    check("AC6 no horizontal scroll at 375px", sw <= cw, f"scrollWidth={sw}, clientWidth={cw}")
    b.close()
fails = [r for r in results if not r[1]]
print(f"\n{len(results)-len(fails)} of {len(results)} checks passed")
