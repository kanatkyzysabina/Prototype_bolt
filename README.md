# Smart Campus Room Availability Checker (Assignment #03 prototype)

Kanatkyzy Sabina, 24B032141. One-page React + TypeScript + Vite + Tailwind prototype generated with Bolt.new
(project `sb1-aqh5e7ln`, final = Version 3). Fictional data only. It checks availability; it never saves or confirms a booking.
No login, backend, database or external API.

- `project/`        full Bolt source (exported Version 3)
- `demo_build/`     production build with relative paths: open `index.html` through any static host
- `screenshots/`    `bolt/` = captures from Bolt (v1, before/after the AC3 fix, final); the rest = final build, desktop and 375 px
- `project/verification/` scripts that produced the automated evidence in the report

## Run locally
    cd project && npm install && npm run dev

## Re-run the checks
    cd project
    npm run build && npm run typecheck && npm run lint     # lint reports 1 known error: unused setCurrentTime
    npx tsx verification/logic_check.ts                    # checkAvailability with the assignment base data
    npm run preview -- --port 4173 &                       # then, in another terminal:
    python3 verification/ui_check.py ../screenshots        # needs: pip install playwright && playwright install chromium

## Demo link
DEMO_LINK_HERE
