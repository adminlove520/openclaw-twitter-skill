---
name: twitter-post
description: >
  Stable automated Twitter (X) posting skill for OpenClaw agents.
  Uses browser tools to navigate to x.com/compose/post, verify login,
  type content, screenshot for confirmation, and click Post.
  Use when: "发推", "tweet", "post to X", "发帖", "share on Twitter",
  "推特发布", or any social media posting request targeting X/Twitter.
---

# Twitter Post Skill

Standardized 5-step workflow for OpenClaw agents to post on X (Twitter) via browser tools.

## Quick Start

When the user asks to post to Twitter, follow these steps **exactly in order**:

```
Step 1 → Open https://x.com/compose/post
Step 2 → Verify login (is the compose box visible?)
Step 3 → Type content into the compose box
Step 4 → Screenshot → show user for confirmation
Step 5 → Click Post → verify success
```

## Detailed Instructions

### Step 1: Open Compose Page

```javascript
// ALWAYS use the direct compose URL — never click sidebar buttons
await browser.navigate("https://x.com/compose/post");
await browser.wait(3000); // wait for page load
```

**Why direct URL?** Twitter's sidebar UI changes frequently. The `/compose/post` modal route is the most stable entry point.

### Step 2: Verify Login

After navigation, take a snapshot to check page state:

```javascript
const snapshot = await browser.snapshot();
```

**Check for these indicators:**

| State | Indicator | Action |
|-------|-----------|--------|
| ✅ Logged in | Compose box / text area visible | Proceed to Step 3 |
| ❌ Not logged in | Login form / "Sign in" button | **STOP** — report to user |
| ⚠️ Rate limited | Error banner / unusual page | **STOP** — screenshot and report |

**If not logged in, respond with:**
> ⚠️ Twitter 未登录。请先在 Chrome OpenClaw profile 中手动登录 x.com，然后重试。

Do NOT attempt to enter credentials or guess passwords.

### Step 3: Type Content

```javascript
// Click the compose text area first
await browser.act("click the tweet compose text area");
await browser.wait(500);

// Type the content (do NOT paste — type character by character)
await browser.type("Your tweet content here #OpenClaw");
await browser.wait(1000);
```

**Content rules (MUST follow):**

- **Mode**: New post ONLY. Never reply to existing tweets.
- **Length**: Maximum 200 characters (leave room for rendering).
- **Emoji**: 1–3 emojis, placed naturally (not emoji spam).
- **Hashtags**: 1–3 relevant hashtags at the end.
- **Language**: Match user's language preference.
- **NO links** unless the user explicitly provides one.

**Content template:**
```
[Core message, 1-2 sentences] [1-2 emoji]

#Tag1 #Tag2
```

### Step 4: Screenshot for Confirmation

```javascript
// MANDATORY — never skip this step
const screenshot = await browser.screenshot();
// Show to user with message:
```

Present the screenshot to the user and say:
> 📸 请确认推文内容是否正确。确认后我将点击发布。

**Wait for user confirmation before proceeding.** If the user wants changes, go back to Step 3.

### Step 5: Click Post & Verify

```javascript
// Wait for the Post button to be enabled
await browser.wait(1000);

// Click the Post button
await browser.act('click the "Post" button');

// Wait for the post to be submitted
await browser.wait(3000);

// Take a screenshot to verify success
const result = await browser.screenshot();
```

**Success indicators:**
- "Your post was sent" toast notification
- Compose modal closes
- Return to timeline

**Failure indicators:**
- Post button still visible (not clicked)
- Error message popup
- "Something went wrong" toast

**On success, respond:**
> ✅ 推文已发布成功！

**On failure, respond with screenshot:**
> ❌ 发布失败。截图如上，请检查。[具体错误描述]

## Error Handling Rules

1. **NEVER retry silently.** If posting fails, report the error with a screenshot immediately.
2. **NEVER guess or fill in credentials.** Login is the user's responsibility.
3. **NEVER post without user confirmation** (Step 4 screenshot approval).
4. **NEVER modify the user's content** without telling them.
5. **Report specific errors:** "Button disabled", "Page not loaded", "Rate limited" — not just "failed".

## Common Failure Modes & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Compose box not found | Page didn't load | Wait longer, retry navigation |
| Post button disabled | Content empty or invalid | Check if text was actually typed |
| "Something went wrong" | Twitter server error | Wait 30s, retry once, then report |
| Page shows login | Session expired | Ask user to re-login in Chrome |
| Content truncated | Typed too fast | Use slower typing with waits |

## Lessons Learned (经验教训)

1. **`/compose/post` is king** — Sidebar "Post" button and keyboard shortcuts are unreliable across UI updates.
2. **Type, don't paste** — `type()` simulates human input; paste may be blocked by Twitter's CSP.
3. **Always screenshot before posting** — This is the single biggest reliability improvement. Users catch errors, and you have evidence of what was attempted.
4. **Wait before clicking Post** — The Post button may take 500ms–1s to become active after content is entered.
5. **One post per session** — Don't chain multiple posts. Complete one full cycle before starting another.
6. **Check toast, not URL** — After posting, the URL may not change immediately. Look for the success toast notification.
