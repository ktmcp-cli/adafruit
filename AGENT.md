# Adafruit IO CLI - Agent Guide

This CLI provides access to Adafruit IO's IoT data platform API.

## Authentication

API key and username required. Get them at: https://io.adafruit.com/

```bash
adafruit config set --api-key YOUR_KEY --username YOUR_USERNAME
```

## Common Operations

### List Feeds

```bash
adafruit feeds --json
```

### Get Feed Data

```bash
# Recent data (default 10 points)
adafruit data temperature --json

# More data points
adafruit data temperature --limit 50 --json
```

### Send Data

```bash
adafruit send temperature 25.5 --json
```

### User Information

```bash
adafruit user --json
```

## Usage Patterns

All commands support `--json` for machine-readable output. Perfect for:
- IoT monitoring dashboards
- Sensor data logging
- Home automation scripts
- Device management tools

## Error Handling

- Returns exit code 0 on success
- Returns exit code 1 on error
- Use `--json` and check exit codes in scripts
