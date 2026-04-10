# OpenClaw Twitter Skill

[![npm version](https://img.shields.io/npm/v/openclaw-twitter-skill.svg)](https://www.npmjs.com/package/openclaw-twitter-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Stable, automated Twitter (X) posting skill for [OpenClaw](https://openclaw.ai) agents.

## Problem

OpenClaw agents can control Chrome via browser tools, but Twitter posting is unreliable — login checks fail, buttons don't get clicked, content gets lost. This skill standardizes the entire process into a battle-tested 5-step workflow.

## The 5-Step Workflow

```
Step 1  →  Navigate to x.com/compose/post  (direct URL, never sidebar)
Step 2  →  Verify login (compose box visible?)
Step 3  →  Type content (type(), not paste)
Step 4  →  Screenshot → user confirms content
Step 5  →  Click Post → verify success toast
```

## Installation

### As an OpenClaw Skill

Copy `SKILL.md` to your agent's skills directory:

```bash
npm install -g openclaw-twitter-skill

# Copy the skill file
cp "$(npm root -g)/openclaw-twitter-skill/SKILL.md" ~/.agents/skills/twitter-post/SKILL.md
```

### CLI Usage

```bash
# Simulate the full posting workflow
oct-post post "Hello from OpenClaw! 🚀 #AI #Automation"

# Validate content against posting rules
oct-post validate "Testing content #test #openclaw"

# Dry run (validate only, don't mark as ready)
oct-post post "Draft tweet #draft" --dry-run

# Show workflow info
oct-post info

# Help
oct-post --help
```

## Content Guidelines

| Rule | Spec |
|------|------|
| Mode | New post only (no replies) |
| Length | < 200 characters recommended (280 max) |
| Emoji | 1–3, placed naturally |
| Hashtags | 1–3 relevant tags (supports CJK: `#人工智能`) |
| Links | Only if user explicitly provides them |
| Media | Text-only by default; image upload requires user interaction |

## Error Handling

- **Not logged in** → Stop immediately, ask user to login in Chrome
- **Post failed** → Screenshot + specific error description
- **Never retry silently** → Always report what happened
- **Never skip screenshot** → User must confirm before posting
- **One retry max** → Only for server errors, with 30s wait

## Key Lessons

1. Always use `/compose/post` direct URL (sidebar buttons break across UI updates)
2. Use `type()` not paste (Twitter CSP may block clipboard)
3. Screenshot before posting (biggest reliability win)
4. Wait 1–1.5s for Post button to enable after typing
5. One post per session (don't chain without spacing)
6. Check success toast, not URL change
7. Use `snapshot()` for logic checks, `screenshot()` for user confirmation

## Development

```bash
# Run tests
npm test

# Test CLI locally
node index.js post "Test tweet #dev" --dry-run
node index.js validate "Check this content #test"
```

## Release

Push a version tag to trigger auto-release:

```bash
npm version patch   # or minor / major
git push origin main --tags
```

GitHub Actions will:
1. Create a GitHub Release with auto-generated notes
2. Publish to NPM (requires `NPM_TOKEN` secret in repo settings)

## License

MIT
