# AV Edge

**AV Edge** is a web platform designed for professional audio-visual (AV) end-users and rental companies to **search, compare, and connect** with equipment rental providers across the United States.

The goal is to simplify the process of finding specific gear — especially when local inventory is limited — by creating a **centralized, searchable network** of verified rental houses and integrators.

---

## 🚀 Project Overview

### Problem
Finding AV rental gear today often means endless calls and emails to regional providers. There’s no single source of truth for what gear is available nearby, or how to quickly compare pricing and lead time.

### Solution
AV Edge aggregates regional rental inventories into one searchable platform.  
Users can:
- Search by model, category, or state  
- View equipment details and providers  
- Request rental quotes directly from verified companies  
- List their own company and upload inventory data  

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | [React](https://react.dev/) (TypeScript) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Routing** | [React Router DOM](https://reactrouter.com/) |
| **Deployment** | [GitHub Pages](https://pages.github.com/) with GitHub Actions CI/CD |
| **Forms** | [Formspree](https://formspree.io/) for provider intake (no backend required) |
| **Data Storage (MVP)** | Local JSON files (`/src/data/`) for mocked listings and providers |
| **Validation** | [Zod](https://zod.dev/) (light client-side schema validation) |

---

## ⚙️ Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- A text editor like [VS Code](https://code.visualstudio.com/)

### 1. Clone and install
```bash
git clone https://github.com/YOUR_USERNAME/avedge.github.io.git
cd avedge.github.io
npm install
