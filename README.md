# Resume 2026

Self-hosted PHP + MySQL resume editor built from the supplied two-page PDF. The resume pages use fixed A4 geometry and cleaned page backgrounds generated from the original PDF, while editable text is placed at fixed PDF-point coordinates.

## Requirements

- PHP 8.1+
- PDO MySQL extension
- fileinfo extension
- MySQL 8.x or MariaDB 10.4+
- HTTPS for production use
- A writable `uploads/` directory

## Installation

1. Create a database/user in your hosting panel.
2. Import `database.sql` with phpMyAdmin or the MySQL client.
3. Edit `config.php` and set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASS`.
4. Upload the whole `Resume-2026` folder to your site.
5. Ensure `uploads/` is writable by PHP (typically `0755`; some shared hosts may require `0775`).
6. Visit `login.php`. If the `users` table is empty, the first-run screen creates the first administrator.
7. After login, the resume editor opens at `index.php`.

## Behavior

- The editor begins with the supplied resume content.
- A database record is not created until Name + Job 1 title + Job 1 employer/location are present.
- Autosave is debounced by 750 ms.
- One current row is kept per person per owner (`owner_id + normalized name`); autosave updates that row instead of creating versions.
- History lists stored resumes and loads them back into the fixed layout.
- Employment experience is calculated from the union of job date ranges so overlapping jobs are not double-counted.
- Blank or `Present` end dates are treated as the current month.
- Text shrinks inside its own fixed rectangle when it overflows; surrounding regions never move.
- The profile photo can be replaced with JPEG/PNG/WebP after the resume is eligible for its first save.
- Print CSS hides the editor UI and locks every generated document page to A4 with zero page margins.

## Important print note

Browser print dialogs may add headers/footers independently of CSS. Disable browser headers/footers and use 100% scale for closest fidelity.

## File map

```text
Resume-2026/
├── index.php
├── login.php
├── logout.php
├── admin.php
├── config.php
├── database.sql
├── .htaccess
├── README.md
├── api/
│   ├── save.php
│   ├── load.php
│   ├── list.php
│   └── photo.php
├── includes/
│   ├── auth.php
│   ├── db.php
│   └── functions.php
├── assets/
│   ├── resume.css
│   ├── resume.js
│   ├── page-1.png
│   └── page-2.png
├── uploads/
│   └── .htaccess
└── reference/
    └── Resume 2026.pdf
```

## Visual master

`assets/page-1.png` and `assets/page-2.png` are cleaned renders of the supplied PDF. Live editable text is overlaid using the measured PDF coordinate system. The original static employment timeline area on page 2 is covered by a live SVG timeline generated from the employment start/end dates.

## Side-by-side form editor

The main editor uses a split layout: a form filler is shown on the left and the live A4 resume preview is shown on the right.

Employment entries are dynamic. Use **+ Add employment** to add as many jobs as needed. Jobs can be moved up/down or removed. Entries 1–9 are placed into the employment regions of the original two-page resume; entry 10 and later are placed on automatically generated A4 continuation pages. All employment entries are stored in the existing `resume_json` field, so no database migration is required.



## Dynamic employment timeline

The timeline at the bottom of page 2 is calculated from the employment form:

- Each job bar starts at its entered start month and ends at its entered end month.
- A blank end date or `Present`/`Current` uses the current month.
- Bar widths are proportional to the actual number of employed months.
- Overlapping jobs are stacked into separate lanes so they remain readable.
- Job numbers on the timeline match the employment numbers in the resume.
- The year scale begins at the earliest job start year and extends through one year beyond the current/latest employment year.
- The total experience shown in the toolbar merges overlapping employment ranges, so simultaneous jobs are not double-counted.


## Dynamic employment layout

- Unlimited employment entries are supported; there is no 7-job cap.
- Jobs 1-3 stay on the original first-page employment row.
- Jobs 4+ flow across additional A4 pages, six per page.
- Education and the employment timeline follow the last employment row automatically.
- The timeline is regenerated from every saved employment start/end date.


## Profile photo positioning

Uploaded profile photos can be adjusted directly in the resume preview. Drag the photo inside the circular frame to reposition it, use the Zoom slider in the left-side form to enlarge the crop, and use **Reset position** to return to the centered 100% crop. The crop position and zoom are stored in the resume JSON, so no database migration is required.


## Optional profile photo
The profile photo is optional. With no uploaded photo, the photo area is blank. When a photo exists it can be dragged and zoomed; use **Remove photo** to return to a blank photo area.
