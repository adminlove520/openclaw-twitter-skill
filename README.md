# OpenClaw Twitter Skill

Automated and stable Twitter (X) posting skill for OpenClaw agents.

## Features

- **Standardized Workflow**: Follows a strict 5-step process for reliability.
- **Login Verification**: Ensures the browser profile is authenticated before attempting to post.
- **Visual Feedback**: Mandatory screenshots for user confirmation.
- **CLI Tool**: Included `oct-post` command for workflow simulation.

## Installation

```bash
npm install -g openclaw-twitter-skill
```

## Usage

As an OpenClaw Skill:
1. Add to your `.agents/skills/` directory.
2. The agent will automatically use the logic defined in `SKILL.md`.

As a CLI:
```bash
oct-post post "Hello from OpenClaw! #AI #Automation"
```

## Release

This project uses GitHub Actions to automatically publish to NPM when a version tag (`v*`) is pushed.

## License

MIT
