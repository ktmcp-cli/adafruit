import { getConfig } from './config.js';

async function request(endpoint, method = 'GET', body = null) {
  const config = getConfig();
  if (!config.apiKey || !config.username) {
    throw new Error('API key and username not configured');
  }

  const url = `${config.baseUrl}${endpoint.replace('{username}', config.username)}`;
  
  const headers = {
    'X-AIO-Key': config.apiKey,
    'Content-Type': 'application/json'
  };

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error: ${response.status} ${text}`);
  }

  return response.json();
}

export async function getUser() {
  return request('/user');
}

export async function getFeeds() {
  const config = getConfig();
  return request(`/${config.username}/feeds`);
}

export async function getFeed(feedKey) {
  const config = getConfig();
  return request(`/${config.username}/feeds/${feedKey}`);
}

export async function getFeedData(feedKey, limit = 10) {
  const config = getConfig();
  const endpoint = `/${config.username}/feeds/${feedKey}/data`;
  return request(endpoint + `?limit=${limit}`);
}

export async function sendData(feedKey, value) {
  const config = getConfig();
  return request(`/${config.username}/feeds/${feedKey}/data`, 'POST', { value });
}
