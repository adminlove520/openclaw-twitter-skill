---
name: twitter-post
description: >
  Stable automated Twitter (X) posting skill for OpenClaw agents. 
  Uses browser tools to navigate to /compose/post, verify login, type content, 
  and confirm post with screenshots. Use when the agent needs to share updates 
  on X.com.
---

# Twitter Post Skill

This skill provides a standardized 5-step process for OpenClaw agents to post to Twitter (X) reliably using browser tools.

## When to use

Use this skill when:
- The agent needs to post a new status/update to Twitter.
- The user asks to "tweet something" or "post to X".
- Automated social media updates are required.

## Posting Workflow (Standard 5 Steps)

1. **Open Post Page**: Navigate to `https://x.com/compose/post`.
2. **Verify Login**: Check if the posting box is visible. If redirected to login, stop and notify the user.
3. **Input Content**: Use `browser.type()` to enter text. Keep it under 200 characters.
4. **Visual Confirmation**: Take a screenshot (`browser.screenshot()`) for the user to verify the draft.
5. **Click Post**: Locate and click the "Post" button. Confirm success by checking for the "Your post was sent" toast or navigating to the profile.

## Content Guidelines

- **Format**: New post only (no replies).
- **Length**: Concise, < 200 characters.
- **Emoji**: Use 1-3 emojis appropriately.
- **Hashtags**: Include 1-3 relevant hashtags.

## Error Handling

- **Login Failure**: If not logged in, do NOT attempt to guess credentials. Report to user.
- **Post Failure**: If the "Post" button is disabled or an error popup appears, capture a screenshot and report the exact state.
- **No Silent Retry**: Never retry silently. Twitter anti-bot measures may trigger on repeated attempts.

## Experience & Lessons

- **Direct Navigation**: Always use `https://x.com/compose/post` instead of clicking through the sidebar to avoid UI changes.
- **Slow Typing**: Use `type()` with a slight delay if the site feels laggy.
- **Explicit Wait**: Wait for the "Post" button to be enabled before clicking.
- **Screenshots**: Screenshots are the best way to debug "why didn't it post?".
