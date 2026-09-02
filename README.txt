Resume 2026 - Self Hosted PHP/MySQL Package

REQUIREMENTS
- PHP 8.1+
- MySQL 5.7+ / MySQL 8 / compatible MariaDB
- PDO MySQL enabled
- Writable uploads/ directory
- HTTPS recommended

INSTALL
1. Create a MySQL database.
2. Import database.sql.
3. Edit config.php with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS.
4. Upload the entire Resume-2026 folder to your web server.
5. Make uploads/ writable by PHP.
6. Open login.php.
7. The first visit lets you create the administrator account.
8. Sign in and use index.php.

AUTOSAVE
A record is not created until:
- Name is entered
- Job #1 title is entered
- Job #1 employer is entered

SKILLS
The Skills section uses two aligned columns:
- Left: editable skill name
- Right: dropdown skill level
Available levels: Novice, Beginner, Intermediate, Experienced, Expert.

HISTORY
One current resume record is stored per person per owner.
The History dropdown shows Name + last saved timestamp.

EMPLOYMENT TOTAL
Employment experience is calculated by unique calendar months.
Overlapping jobs are not double-counted.
Blank end date means Present.

PRINTING
Use the Print button. The toolbar and dropdown controls are hidden for print.

NOTE
This rebuild includes the latest two-column Skills change and is designed around the uploaded Resume 2026 structure. Browser font rendering can vary slightly between systems.
