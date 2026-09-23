# DevFlow ✦ A Place Where Developers Help Each Other

> "I asked the internet, and the internet answered." This project, basically.

DevFlow is a full-stack Stack Overflow-style community built with **Next.js**, where developers can ask questions, post answers, upvote useful stuff, save things for later, and browse a community of actual humans (well, and their embarrassing bootcamp-era questions. We've all been there.).

It's got everything you'd expect from a Q&A platform, plus one fun twist: **you can hit a button and let OpenAI draft an answer for you.** Your own private rubber duck, minus the existential crisis.

---

## 🚀 What Can You Actually Do Here?

- **Ask questions** with a rich Markdown editor, and tag them so the right people find them.
- **Answer questions** with the nice editor, or tap **"Generate AI answer"** and get a Markdown draft from GPT-4o-mini to edit and submit.
- **Vote.** Upvote what saved your afternoon, downvote what cost you an evening. Classic.
- **Save questions** to your Collection so you can find them when you actually need them.
- **Search and filter** the question feed (newest / popular / unanswered…), with pagination because nobody needs 9,000 results on one screen.
- **Visit the Community** page to ogle your future competitors, and check out any user's profile to see how smart they *really* are.
- **Browse by tag**, because sometimes you just want to look at `javascript` posts like it's a zoo.
- **Log in** the easy way: email + password, or with your GitHub / Google account.

## 🔧 Tech Stack (The People's Choices)

| What | Which |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (it scolds you nicely) |
| Styling | Tailwind CSS v4 + shadcn-style UI components |
| Database | MongoDB Atlas (via Mongoose v9) |
| Auth | better-auth (email/password + Google + GitHub) |
| Forms | react-hook-form + zod (validation that actually validates) |
| Editor | @mdxeditor/editor (Markdown, feels fancy) |
| AI answers | OpenAI SDK (`gpt-4o-mini`) |
| Extras | sonner toasts, pino logging, next-themes dark mode |

---

## 📦 Getting Started

### 1. Prerequisites

- **Node.js** 18+ (the repo was built against Node 24 on Windows, but any recent one works).
- A **MongoDB** database. This project points at an **Atlas** cluster; any MongoDB (including a local one) works if you give it a connection string.
- An **OpenAI API key** if you want the AI answer button to actually answer.

### 2. Environment Variables

Copy the shape below into a local `.env`. **`.env` is gitignored**, so your secrets stay yours. This file won't end up in the repo.

```env
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority"
BETTER_AUTH_SECRET="<a long random string>"
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

OPENAI_API_KEY=""
```

> **Tip:** `OPENAI_API_KEY` can start empty. The AI button will then politely tell you it's not configured instead of crashing. No explosions.

### 3. Install & Run

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and you're in. Make an account (or sign in with Google/GitHub) and go ask a question.

### 4. Useful Commands

```bash
npm run dev        # dev server (hot reload)
npm run build      # production build + type check
npm run start      # serve the production build
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check
```

---

## 🗂️ How the Codebase Is Organized (the 60-Second Tour)

```
app/            Next.js pages. (auth) = sign-in/sign-up screens,
                (root) = the main app shell (nav + sidebars + content).
components/     UI pieces (cards, forms, buttons, sidebars, the editor).
database/       Mongoose models (Question, Answer, Vote, Tag, …).
lib/            The engine room:
                ├── actions/   server actions (the "API" of this app)
                ├── ai/        OpenAI client + answer generator
                ├── handlers/  validation, errors, HTTP helpers
                ├── validations.ts  every zod schema, in one place
                └── mongoose.ts     the shared DB connection
constants/      routes, empty/error states, the tech map.
types/global.d.ts  global TypeScript interfaces (no imports needed).
auth.ts         better-auth setup. proxy.ts = middleware rules.
```

---

## 🧠 How It Actually Works

### Everything is a server action

This app has **no REST API for its own data**. Pages are server components that call functions in `lib/actions/` **directly**, server → database → back. It's just functions. No `fetch`, no `axios`, no drama.

Every action follows the same rhythm:

1. Validate the input against a **zod schema**.
2. If `authorize: true`, make sure there's a signed-in session.
3. Go talk to Mongo.
4. Return a consistent shape:
   `{ success: true, data: … }` or `{ success: false, status, error: { message } }`.

So a page like the **home feed** is really just: *grab the URL query → call `getQuestions` → render `QuestionCard`s.*

### Users live in a parallel dimension

Here's the one thing that confuses everyone at first: **there is no Mongoose `User` model.** better-auth owns the raw `user` collection, and the app joins to it manually whenever it needs a name or avatar:

```ts
const user = await mongoose.connection.getClient()
  .db("DevFlow").collection("user")
  .findOne({ _id: new mongoose.Types.ObjectId(authorId) });
```

Annoying? Slightly. But it's why signing up with Google "just works."

### The database

| Model | Collection | What it holds |
|---|---|---|
| `Question` | `questions` | title, content, tags, views, votes, **author** |
| `Answer` | `answers` | author, question, content, votes |
| `Vote` | `votes` | one row per person's up/down vote |
| `Collection` | `collections` | "this user saved this question" |
| `Tag` | `tags` | tags + how many questions they're on |
| `TagQuestion` | `tagquestions` | join table between tags and questions |
| `Interaction` | `interactions` | the seeds of future recommendations |

### The cool features, wired end-to-end

- **AI answers:** `lib/ai/generate.ts` loads the question + top answers, asks `gpt-4o-mini` for a structured Markdown answer, and injects it straight into the editor. Review it, tweak it, submit it. You're the editor-in-chief, the AI is just the intern.
- **Votes & saves:** `vote.action.ts` toggles a single vote row; `collection.action.ts` toggles saves. Both immediately reflect on the question page.
- **Vibe-driven right sidebar:** shows the hottest questions and most popular tags, computed from real data (`getHotQuestions`, `getTopTags`).

---

## ⚠️ Things That Will Trip You Up

1. **Schema changes need a server restart.** Mongoose registers a model *once per process*. If you edit `database/question.model.ts`, hot reload won't pick it up. Stop `npm run dev` and start it again. (Trust us, we lost an afternoon to this one.)
2. **`.env` changes also need a restart.**
3. **The `author` field stores an ObjectId, not a string.** The model declares it as `Schema.Types.ObjectId` on purpose, so Mongoose casts your string user-id into an ObjectId when querying. If you ever "simplify" it back to `String`, the profile page will quietly show **0 questions** for everyone. Don't be that person.
4. **The repo files are CRLF.** If you edit with scripts, write `\r\n` or git will show you a diff for every single line. Use `git diff -w` to see *actual* changes.
5. **`/jobs` is a placeholder** page (no data source yet) and the home "recommended" filter intentionally returns nothing. Both are features. Kind of.

---

## 🛠️ Troubleshooting Quick Hits

| Symptom | Likely Fix |
|---|---|
| Profile says 0 questions but they exist | Restart the dev server (stale model schema) |
| "Generate AI answer" fails | `OPENAI_API_KEY` is empty or invalid in `.env` |
| Can't sign in with OAuth | Check `GITHUB_*/GOOGLE_*` ids/secrets + `BETTER_AUTH_URL` |
| "CANNOT find module mongoose" or DB timeouts | Check `MONGODB_URI` and internet reachability to Atlas |
| Weird giant diffs | It's the line endings. `git diff -w`. Probably. |

---

## 🧭 "I Want to Change X": A Quick Map

- **Homepage behavior** → `app/(root)/page.tsx` + `getQuestions` in `lib/actions/question.action.ts`
- **Add a field to questions** → `database/question.model.ts` + `components/cards/QuestionCard.tsx`
- **Add a page** → new folder under `app/(root)/`, register the route in `constants/routes.ts`
- **AI prompt / model** → `lib/ai/generate.ts`
- **Vote/save logic** → `lib/actions/vote.action.ts` / `collection.action.ts`
- **Auth rules** → `auth.ts` and `proxy.ts`

---

## 🎤 Why It Exists

Because someone out there asked, *"but where do I put the `useEffect`?"*. The answer deserved to live somewhere searchable, with upvotes, for the rest of time. DevFlow is that somewhere.

Happy shipping. Ask good questions, write better answers, and remember: **the best way to learn something is to explain it to someone else.** Open source that knowledge. 🚀
