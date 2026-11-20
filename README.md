# Product Sales Insight

A sales dashboard built with Next.js. It reads product sales data from a SQLite database (using Prisma) and shows charts for revenue, products, cities and trends.

## Features
- 5 tabs on one page: Overview, Revenue, Products, Cities, Trends
- Filters: category, city, date range (month)
- KPI cards with % change vs the previous 7 / 30 / 90 days
- Monthly revenue with a 3-month rolling average
- Month × Year revenue heatmap
- Price vs quantity scatter plot with correlation

## Tech stack
Next.js 16, React 19, Tailwind CSS 4, Recharts, Prisma 6 + SQLite.
Python (pandas) was used for the exploration notebook.

## Data
- `product_sales_dataset.csv`: 1000 orders (Jan 2025 – May 2026), 6 categories, 5 cities
- `model.ipynb`: exploratory data analysis notebook

## Run locally

1. Clone and install

```bash
git clone https://github.com/Nitesh-Ray/product-sales-insight.git
cd product-sales-insight
npm install
```

2. Create a file named `.env` in the project root with this line:

```
DATABASE_URL="file:./dev.db"
```

3. Create the database and load the CSV into it

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

4. Start the app

```bash
npm run dev
```

Open http://localhost:3000





# Product Sales Insight

A sales analytics dashboard. Data is explored in a Python notebook, stored in a SQLite database with Prisma, and shown in a dark-themed Next.js dashboard deployed on Vercel.

**Live demo:** https://YOUR-APP.vercel.app

## Features
- 5 views in one page: Overview, Revenue, Products, Cities, Trends
- Filters: category, city, month range
- KPI cards with % change vs the previous 7 / 30 / 90 days
- Monthly revenue with a 3-month rolling average
- Month × Year heatmap
- Price vs quantity scatter plot with correlation

## How it works

```
product_sales_dataset.csv
        │  explore with Python (model.ipynb)
        ▼
SQLite database (Prisma)  ── npm run data ──►  data/rows.json
                                                    │
                                                    ▼
                                         Next.js dashboard ──► Vercel
```

The database is where the data lives. Vercel cannot use a local SQLite file, so the deployed app reads `data/rows.json`, a snapshot exported from the database.

## Tech stack
- **Web:** Next.js 16, React 19, Tailwind CSS 4, Recharts, lucide-react
- **Data:** SQLite + Prisma
- **Notebook:** Python 3.12, pandas, numpy, matplotlib, seaborn (managed with uv)
- **Hosting:** Vercel

## Project structure
```
app/               Next.js page and layout
components/        Dashboard and chart components
lib/               analytics.ts (KPI logic), theme.ts (chart colors)
prisma/            schema.prisma, seed.ts, export.ts
data/rows.json     data used by the app
model.ipynb        exploratory data analysis notebook
product_sales_dataset.csv
```

## Requirements
- Node.js 20.9 or newer
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- VS Code with the **Python** and **Jupyter** extensions (to run the notebook)

## Setup

### 1. Clone
```bash
git clone https://github.com/Nitesh-Ray/product-sales-insight.git
cd product-sales-insight
```

### 2. Python notebook (optional, for the analysis)
```bash
uv sync
```
This creates `.venv` and installs everything from `pyproject.toml` (pandas, numpy, matplotlib, seaborn, ipykernel). uv installs the right Python version if needed.

Run the notebook in VS Code:
1. Open `model.ipynb`
2. Click **Select Kernel** (top right) → **Python Environments** → choose **.venv**
3. Click **Run All**

To add a new Python package: `uv add <package-name>`

### 3. Web app
```bash
npm install
```

Create a file named `.env` in the project root:
```
DATABASE_URL="file:./dev.db"
```

Create the database and the data file:
```bash
npm run data
```

This runs three things:
1. `prisma db push`: creates the SQLite file `prisma/dev.db` from `schema.prisma`
2. `tsx prisma/seed.ts`: loads the CSV into the `Sale` table
3. `tsx prisma/export.ts`: writes all rows to `data/rows.json`

Start the app:
```bash
npm run dev
```
Open http://localhost:3000

To browse the database visually: `npx prisma studio`

## Updating the data
1. Replace `product_sales_dataset.csv` (keep the same columns)
2. Run `npm run data`
3. Commit `data/rows.json` and push. Vercel redeploys automatically.

## Deploy on Vercel
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project** and import the repo
3. Vercel detects Next.js automatically. Add one environment variable: `DATABASE_URL` = `file:./dev.db`
4. Click **Deploy**. Every `git push` to `main` redeploys the site.

`.env` and `prisma/dev.db` are not committed, they are created locally by the setup above.

## Notes
- The data ends on 16 May 2026, so May 2026 is an incomplete month.

## Credits
UI design inspired by the NexusPulse dashboard: https://github.com/PraneetGogoi/product-sales-insight