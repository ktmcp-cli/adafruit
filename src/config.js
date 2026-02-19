import Conf from 'conf';

const config = new Conf({ projectName: '@ktmcp-cli/adafruit' });

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function isConfigured() {
  return !!config.get('apiKey') && !!config.get('username');
}

export function getAllConfig() {
  return config.store;
}
