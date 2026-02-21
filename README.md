![Banner](https://raw.githubusercontent.com/ktmcp-cli/adafruit/main/banner.svg)

> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Adafruit IO CLI

> **⚠️ Unofficial CLI** - Not officially sponsored or affiliated with Adafruit.

A production-ready command-line interface for [Adafruit IO](https://io.adafruit.com/) — the IoT data platform for makers. Manage feeds, send data, and read sensor values directly from your terminal.

## Features

- **Feeds Management** — List and view all your Adafruit IO feeds
- **Data Operations** — Send and retrieve data from feeds
- **User Info** — Check account details and quotas
- **JSON output** — All commands support `--json` for scripting
- **Colorized output** — Clean terminal output with chalk

## Installation

```bash
npm install -g @ktmcp-cli/adafruit
```

## Quick Start

```bash
# Get your API key at https://io.adafruit.com/
adafruit config set --api-key YOUR_KEY --username YOUR_USERNAME

# List your feeds
adafruit feeds

# Send data to a feed
adafruit send temperature 25.5

# Get recent data from a feed
adafruit data temperature --limit 10
```

## Commands

### Config

```bash
adafruit config set --api-key <key> --username <username>
adafruit config show
```

### User

```bash
adafruit user                      # Get user information
adafruit user --json               # JSON output
```

### Feeds

```bash
adafruit feeds                     # List all feeds
adafruit feed <key>                # Get specific feed details
adafruit feeds --json              # JSON output
```

### Data

```bash
adafruit data <feed-key>           # Get recent data (default: 10 points)
adafruit data <feed-key> --limit 50 # Get more data points
adafruit send <feed-key> <value>   # Send data to feed
```

## JSON Output

All commands support `--json` for structured output:

```bash
adafruit feeds --json | jq '.[].key'
adafruit data temperature --json | jq '.[].value'
```

## Why CLI > MCP?

No server to run. No protocol overhead. Just install and go.

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe to `jq`, `grep`, `awk`
- **Scriptable** — Works in cron jobs, CI/CD, shell scripts

## License

MIT — Part of the [Kill The MCP](https://killthemcp.com) project.


---

## Support KTMCP

If you find this CLI useful, we'd greatly appreciate your support! Share your experience on:
- Reddit
- Twitter/X
- Hacker News

**Incentive:** Users who can demonstrate that their support/advocacy helped advance KTMCP will have their feature requests and issues prioritized.

Just be mindful - these are real accounts and real communities. Authentic mentions and genuine recommendations go a long way!

## Support This Project

If you find this CLI useful, we'd appreciate support across Reddit, Twitter, Hacker News, or Moltbook. Please be mindful - these are real community accounts. Contributors who can demonstrate their support helped advance KTMCP will have their PRs and feature requests prioritized.
