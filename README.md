# Fleet Tracker v1.0

**Vehicle / Machine / Trailer Status Tracker**  
Inspired by [LubeLogger](https://lubelogger.com) · Spec from `Vehicle_Maint_v1.pdf`

Pure **HTML + CSS + JavaScript** client-side app. No build step required.

---

## Quick Start

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).
2. That’s it. Data is stored in the browser’s `localStorage`.

Or serve it locally:

```bash
npx serve .
# or
python -m http.server 8080
```

---

## Features (v1.0)

| Module            | Status | Notes |
|-------------------|--------|-------|
| Garage            | ✅     | Vehicles, Machines, Trailers · unit #, plate, dual odometer/hours |
| Multi-asset switch| ✅     | Dropdown in sidebar |
| Dashboard         | ✅     | KPI cards, expense doughnut, reminder urgency chart (Chart.js) |
| Service Records   | ✅     | Service / Repair / Upgrade with cost & notes |
| Fuel Logs         | ✅     | Gallons, $/gal, MPG calculation, fuel type |
| Supplies          | ✅     | Inventory with low-stock alerts |
| Inspections       | ✅     | Checklist · **Fail → Out of Service** cascade |
| Reminders         | ✅     | Date / mileage / hour based · urgency badges |
| Tools             | ✅     | Catalog with location & assignment |
| Export            | ✅     | Full Excel (.xlsx) via SheetJS |
| Mobile-first UI   | ✅     | Collapsible sidebar, Tailwind industrial theme |

---

## Design System (from PDF)

- **Framework**: Tailwind CSS (CDN)
- **Layout**: Responsive, mobile-first, collapsible sidebar
- **Colors**: Slate/zinc dark background, white cards, blue primary accents
- **Status**: Green = Healthy/Pass · Amber = Due Soon · Red = Overdue / Out of Service
- **Data**: Client-side only for v1 (localStorage). Ready for Cloudflare D1 + R2 later.

---

## File Structure

```
vehicle-tracker-v1/
├── index.html          # App shell
├── css/app.css         # Custom styles
├── js/
│   ├── data.js         # Sample data + localStorage helpers
│   └── app.js          # All views & logic
└── README.md
```

---

## Next Steps (future versions)

- Cloudflare Pages + Workers + D1 + R2 (as specified in PDF)
- Photo / receipt uploads to R2
- Email / SMS reminder dispatch
- Multi-user auth
- Custom inspection templates
- Planner (Kanban) like LubeLogger

---

**Version**: 1.0.0  
**License**: MIT (same spirit as LubeLogger)
