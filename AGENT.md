# Adafruit IO CLI - AI Agent Guide

This CLI provides programmatic access to the Adafruit IO IoT Platform API.

## Quick Start for AI Agents

```bash
adafruit config set --api-key YOUR_AIO_KEY
adafruit config set --username YOUR_USERNAME
adafruit feeds list
```

## Available Commands

### config
- `adafruit config set --api-key <key>` - Set Adafruit IO API key
- `adafruit config set --username <user>` - Set Adafruit IO username
- `adafruit config get <key>` - Get a config value
- `adafruit config list` - List all config values

### feeds
- `adafruit feeds list` - List all feeds
- `adafruit feeds get <feed-key>` - Get feed details
- `adafruit feeds create --name <name>` - Create a new feed

### data
- `adafruit data send <feed-key> <value>` - Send data to a feed
- `adafruit data send <feed-key> <value> --lat <lat> --lon <lon>` - Send with GPS
- `adafruit data get <feed-key> <data-id>` - Get a specific data point
- `adafruit data list <feed-key>` - List recent data points
- `adafruit data list <feed-key> --limit <n>` - List with limit
- `adafruit data list <feed-key> --start <iso> --end <iso>` - List by date range

### dashboards
- `adafruit dashboards list` - List all dashboards
- `adafruit dashboards get <dashboard-key>` - Get dashboard details
- `adafruit dashboards create --name <name>` - Create a new dashboard

## Output Format

All commands output formatted tables by default. Use `--json` flag for machine-readable JSON output.

## Authentication

This CLI uses your Adafruit IO AIO Key for authentication. Get your key at https://io.adafruit.com/api/docs/
Rate limit: 30 data points/minute on free plan.
