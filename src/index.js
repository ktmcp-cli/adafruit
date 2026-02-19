import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured, getAllConfig } from './config.js';
import {
  listFeeds, getFeed, createFeed,
  sendData, getData, listData,
  listDashboards, getDashboard, createDashboard
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }
  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });
  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));
  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });
  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Adafruit IO credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  adafruit config set --api-key YOUR_AIO_KEY --username YOUR_USERNAME'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('adafruit')
  .description(chalk.bold('Adafruit IO CLI') + ' - IoT feeds and dashboards from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Adafruit IO API key (AIO Key)')
  .option('--username <user>', 'Adafruit IO username')
  .action((options) => {
    if (options.apiKey) { setConfig('apiKey', options.apiKey); printSuccess('API key set'); }
    if (options.username) { setConfig('username', options.username); printSuccess(`Username set: ${options.username}`); }
    if (!options.apiKey && !options.username) {
      printError('No options provided. Use --api-key or --username');
    }
  });

configCmd
  .command('get <key>')
  .description('Get a configuration value')
  .action((key) => {
    const value = getConfig(key);
    if (value === undefined) {
      printError(`Key "${key}" not found`);
    } else {
      console.log(value);
    }
  });

configCmd
  .command('list')
  .description('List all configuration values')
  .action(() => {
    const all = getAllConfig();
    console.log(chalk.bold('\nAdafruit IO CLI Configuration\n'));
    console.log('API Key:  ', all.apiKey ? chalk.green('aio_' + '*'.repeat(20)) : chalk.red('not set'));
    console.log('Username: ', all.username ? chalk.green(all.username) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// FEEDS
// ============================================================

const feedsCmd = program.command('feeds').description('Manage Adafruit IO feeds');

feedsCmd
  .command('list')
  .description('List all feeds')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const feeds = await withSpinner('Fetching feeds...', () => listFeeds());
      if (options.json) { printJson(feeds); return; }
      printTable(feeds, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'key', label: 'Key' },
        { key: 'visibility', label: 'Visibility' },
        { key: 'last_value', label: 'Last Value' },
        { key: 'status', label: 'Status' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

feedsCmd
  .command('get <feed-key>')
  .description('Get details of a specific feed')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, options) => {
    requireAuth();
    try {
      const feed = await withSpinner('Fetching feed...', () => getFeed(feedKey));
      if (options.json) { printJson(feed); return; }
      console.log(chalk.bold('\nFeed Details\n'));
      console.log('ID:          ', chalk.cyan(feed.id));
      console.log('Name:        ', chalk.bold(feed.name));
      console.log('Key:         ', feed.key);
      console.log('Visibility:  ', feed.visibility);
      console.log('Last Value:  ', feed.last_value !== null ? chalk.green(feed.last_value) : chalk.dim('no data'));
      console.log('Unit Symbol: ', feed.unit_symbol || 'N/A');
      console.log('Unit Type:   ', feed.unit_type || 'N/A');
      console.log('Status:      ', feed.status || 'N/A');
      console.log('Created:     ', feed.created_at || 'N/A');
      console.log('Updated:     ', feed.updated_at || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

feedsCmd
  .command('create')
  .description('Create a new feed')
  .requiredOption('--name <name>', 'Feed name')
  .option('--description <desc>', 'Feed description')
  .option('--visibility <vis>', 'Feed visibility (public|private)', 'private')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const feed = await withSpinner('Creating feed...', () =>
        createFeed({ name: options.name, description: options.description, visibility: options.visibility })
      );
      if (options.json) { printJson(feed); return; }
      printSuccess(`Feed created: ${chalk.bold(feed.name)}`);
      console.log('Key:        ', feed.key);
      console.log('Visibility: ', feed.visibility);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// DATA
// ============================================================

const dataCmd = program.command('data').description('Send and retrieve feed data');

dataCmd
  .command('send <feed-key> <value>')
  .description('Send a data point to a feed')
  .option('--lat <lat>', 'Latitude for location data')
  .option('--lon <lon>', 'Longitude for location data')
  .option('--ele <ele>', 'Elevation for location data')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, value, options) => {
    requireAuth();
    try {
      const dataPoint = await withSpinner(`Sending value "${value}" to feed "${feedKey}"...`, () =>
        sendData(feedKey, value, {
          lat: options.lat,
          lon: options.lon,
          ele: options.ele
        })
      );
      if (options.json) { printJson(dataPoint); return; }
      printSuccess(`Data sent to ${chalk.bold(feedKey)}`);
      console.log('ID:         ', dataPoint.id);
      console.log('Value:      ', chalk.green(dataPoint.value));
      console.log('Created At: ', dataPoint.created_at);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

dataCmd
  .command('get <feed-key> <data-id>')
  .description('Get a specific data point from a feed')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, dataId, options) => {
    requireAuth();
    try {
      const dataPoint = await withSpinner('Fetching data point...', () => getData(feedKey, dataId));
      if (options.json) { printJson(dataPoint); return; }
      console.log(chalk.bold('\nData Point\n'));
      console.log('ID:         ', chalk.cyan(dataPoint.id));
      console.log('Value:      ', chalk.green(dataPoint.value));
      console.log('Created At: ', dataPoint.created_at);
      if (dataPoint.lat) console.log('Location:   ', `${dataPoint.lat}, ${dataPoint.lon}`);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

dataCmd
  .command('list <feed-key>')
  .description('List data points from a feed')
  .option('--limit <n>', 'Maximum number of points', '100')
  .option('--start <time>', 'Start time (ISO 8601)')
  .option('--end <time>', 'End time (ISO 8601)')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching data...', () =>
        listData(feedKey, {
          limit: parseInt(options.limit),
          startTime: options.start,
          endTime: options.end
        })
      );
      if (options.json) { printJson(data); return; }
      printTable(data, [
        { key: 'id', label: 'ID' },
        { key: 'value', label: 'Value' },
        { key: 'created_at', label: 'Created At' },
        { key: 'lat', label: 'Lat', format: (v) => v || 'N/A' },
        { key: 'lon', label: 'Lon', format: (v) => v || 'N/A' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// DASHBOARDS
// ============================================================

const dashboardsCmd = program.command('dashboards').description('Manage Adafruit IO dashboards');

dashboardsCmd
  .command('list')
  .description('List all dashboards')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const dashboards = await withSpinner('Fetching dashboards...', () => listDashboards());
      if (options.json) { printJson(dashboards); return; }
      printTable(dashboards, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'key', label: 'Key' },
        { key: 'description', label: 'Description' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

dashboardsCmd
  .command('get <dashboard-key>')
  .description('Get details of a specific dashboard')
  .option('--json', 'Output as JSON')
  .action(async (dashboardKey, options) => {
    requireAuth();
    try {
      const dashboard = await withSpinner('Fetching dashboard...', () => getDashboard(dashboardKey));
      if (options.json) { printJson(dashboard); return; }
      console.log(chalk.bold('\nDashboard Details\n'));
      console.log('ID:          ', chalk.cyan(dashboard.id));
      console.log('Name:        ', chalk.bold(dashboard.name));
      console.log('Key:         ', dashboard.key);
      console.log('Description: ', dashboard.description || 'N/A');
      console.log('Created:     ', dashboard.created_at || 'N/A');
      console.log('Updated:     ', dashboard.updated_at || 'N/A');
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

dashboardsCmd
  .command('create')
  .description('Create a new dashboard')
  .requiredOption('--name <name>', 'Dashboard name')
  .option('--description <desc>', 'Dashboard description')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const dashboard = await withSpinner('Creating dashboard...', () =>
        createDashboard({ name: options.name, description: options.description })
      );
      if (options.json) { printJson(dashboard); return; }
      printSuccess(`Dashboard created: ${chalk.bold(dashboard.name)}`);
      console.log('ID:  ', dashboard.id);
      console.log('Key: ', dashboard.key);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
