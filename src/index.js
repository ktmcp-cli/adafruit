import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { getUser, getFeeds, getFeed, getFeedData, sendData } from './api.js';

const program = new Command();

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
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
    printError('Configuration incomplete.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  adafruit config set --api-key YOUR_KEY --username YOUR_USERNAME'));
    console.log('\nGet your API key at: https://io.adafruit.com/');
    process.exit(1);
  }
}

program
  .name('adafruit')
  .description(chalk.bold('Adafruit IO CLI') + ' - IoT data platform from your terminal')
  .version('1.0.0');

// CONFIG
const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'Set API key')
  .option('--username <username>', 'Set Adafruit IO username')
  .option('--base-url <url>', 'Set base URL (optional)')
  .action((options) => {
    const updates = {};
    if (options.apiKey) updates.apiKey = options.apiKey;
    if (options.username) updates.username = options.username;
    if (options.baseUrl) updates.baseUrl = options.baseUrl;

    setConfig(updates);
    printSuccess('Configuration updated');
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const config = getConfig();
    console.log(chalk.bold('\nCurrent configuration:'));
    console.log('  API Key:', config.apiKey ? chalk.green('✓ Set') : chalk.red('✗ Not set'));
    console.log('  Username:', config.username ? chalk.green(config.username) : chalk.red('✗ Not set'));
    console.log('  Base URL:', config.baseUrl);
  });

// USER
program
  .command('user')
  .description('Get current user info')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching user info...', getUser);
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan('\nUser Info:\n'));
        console.log(`  Username: ${chalk.yellow(data.username)}`);
        console.log(`  Name: ${data.name || 'N/A'}`);
        console.log(`  ID: ${data.id}`);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// FEEDS
program
  .command('feeds')
  .description('List all feeds')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching feeds...', getFeeds);
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan('\nFeeds:\n'));
        data.forEach(feed => {
          console.log(`  ${chalk.yellow(feed.key)} - ${feed.name}`);
          console.log(`    Last value: ${chalk.green(feed.last_value || 'N/A')}`);
        });
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// FEED
program
  .command('feed')
  .description('Get feed details')
  .argument('<key>', 'Feed key')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, options) => {
    requireAuth();
    try {
      const data = await withSpinner(`Fetching feed ${feedKey}...`, () => getFeed(feedKey));
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan(`\nFeed: ${data.name}\n`));
        console.log(`  Key: ${chalk.yellow(data.key)}`);
        console.log(`  Last value: ${chalk.green(data.last_value || 'N/A')}`);
        console.log(`  Description: ${data.description || 'N/A'}`);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// DATA
program
  .command('data')
  .description('Get feed data points')
  .argument('<key>', 'Feed key')
  .option('--limit <n>', 'Number of data points', '10')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, options) => {
    requireAuth();
    try {
      const limit = parseInt(options.limit);
      const data = await withSpinner(`Fetching data for ${feedKey}...`, () => getFeedData(feedKey, limit));
      
      if (options.json) {
        printJson(data);
      } else {
        console.log(chalk.bold.cyan(`\nData for ${feedKey}:\n`));
        data.forEach(point => {
          const date = new Date(point.created_at).toLocaleString();
          console.log(`  ${chalk.gray(date)} ${chalk.green(point.value)}`);
        });
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// SEND
program
  .command('send')
  .description('Send data to a feed')
  .argument('<key>', 'Feed key')
  .argument('<value>', 'Value to send')
  .option('--json', 'Output as JSON')
  .action(async (feedKey, value, options) => {
    requireAuth();
    try {
      const data = await withSpinner(`Sending to ${feedKey}...`, () => sendData(feedKey, value));
      
      if (options.json) {
        printJson(data);
      } else {
        printSuccess(`Sent ${chalk.green(value)} to ${chalk.yellow(feedKey)}`);
      }
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

program.parse();
