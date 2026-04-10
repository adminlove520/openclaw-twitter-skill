# OpenClaw Twitter Skill

[![npm version](https://img.shields.io/npm/v/openclaw-twitter-skill.svg)](https://www.npmjs.com/package/openclaw-twitter-skill)

Stable, automated Twitter (X) posting skill for [OpenClaw](https://openclaw.ai) agents.

## Problem

OpenClaw agents can control Chrome via browser tools, but Twitter posting is unreliable — login checks fail, buttons don't get clicked, content gets lost. This skill standardizes the entire process into a battle-tested 5-step workflow.

## The 5-Step Workflow

```
Step 1  →  Navigate to x.com/compose/post
Step 2  →  Verify login (compose box visible?)
Step 3  →  Type content into compose box
Step 4  →  Screenshot → user confirms content
Step 5  →  Click Post → verify success toast
```

## Installation

### As an OpenClaw Skill

Copy to your agent's skills directory:

```bash
# Install globally
npm install -g openclaw-twitter-skill

# Or copy SKILL.md to your skills folder
cp node_modules/openclaw-twitter-skill/SKILL.md ~/.agents/skills/twitter-post/SKILL.md
```

### CLI Usage

```bash
# Simulate the full workflow
oct-post post "Hello from OpenClaw! 🚀 #AI #Automation"

# Validate content without posting
oct-post validate "Testing hashtags #test #openclaw"

# Dry run (validate only)
oct-post post "Draft tweet #draft" --dry-run

# Show workflow info
oct-post info
```

## Content Guidelines

| Rule | Spec |
|------|------|
| Mode | New post only (no replies) |
| Length | < 200 characters |
| Emoji | 1–3, placed naturally |
| Hashtags | 1–3 relevant tags |
| Links | Only if user provides them |

## Error Handling

- **Not logged in** → Stop immediately, ask user to login in Chrome
- **Post failed** → Screenshot + specific error message
- **Never retry silently** → Always report what happened
- **Never skip screenshot** → User must confirm before posting

## Lessons Learned

1. Always use `/compose/post` direct URL (sidebar buttons break)
2. Use `type()` not paste (anti-bot detection)
3. Screenshot before posting (biggest reliability win)
4. Wait for Post button to be enabled before clicking
5. One post per session (don't chain)

## Release

Push a version tag to trigger auto-release:

```bash
npm version patch
git push origin --tags
```

GitHub Actions will:
1. Create a GitHub Release with auto-generated notes
2. Publish to NPM (requires `NPM_TOKEN` secret)

## License

MIT
