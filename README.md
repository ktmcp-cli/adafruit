> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Adafruit IO CLI

Production-ready CLI for Adafruit IO IoT Platform API.

## Installation

```bash
npm install -g @ktmcp-cli/adafruit
```

## Configuration

```bash
adafruit config set --api-key YOUR_AIO_KEY
adafruit config set --username YOUR_USERNAME
```

Get your AIO key from: https://io.adafruit.com/api/docs/

## Usage

### Feeds

```bash
# List all feeds
adafruit feeds list

# Get feed details
adafruit feeds get temperature-sensor

# Create a new feed
adafruit feeds create --name "Temperature" --description "Indoor temp" --visibility private
adafruit feeds create --name "GPS Location" --visibility public
```

### Data

```bash
# Send a data point to a feed
adafruit data send temperature-sensor 72.5

# Send with GPS location
adafruit data send gps-tracker 1 --lat 40.7128 --lon -74.0060

# Get a specific data point
adafruit data get temperature-sensor <data-id>

# List recent data points
adafruit data list temperature-sensor --limit 50
adafruit data list temperature-sensor --start 2024-01-01T00:00:00Z --end 2024-01-31T23:59:59Z
```

### Dashboards

```bash
# List all dashboards
adafruit dashboards list

# Get dashboard details
adafruit dashboards get my-home-dashboard

# Create a dashboard
adafruit dashboards create --name "Home Monitoring" --description "Temperature and humidity"
```

### Configuration

```bash
adafruit config set --api-key YOUR_KEY
adafruit config set --username YOUR_USERNAME
adafruit config get username
adafruit config list
```

## JSON Output

All commands support `--json` flag for machine-readable output:

```bash
adafruit feeds list --json
adafruit data list temperature-sensor --json
```

## Rate Limits

- Free plan: 30 data points per minute
- Plus plan: 60 data points per minute

## License

MIT
