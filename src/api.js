import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://io.adafruit.com/api/v2';

function getClient() {
  const apiKey = getConfig('apiKey');
  const username = getConfig('username');

  if (!apiKey || !username) {
    throw new Error('Adafruit IO credentials not configured. Run: adafruit config set --api-key YOUR_KEY --username YOUR_USERNAME');
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-AIO-Key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
}

function getUsername() {
  return getConfig('username');
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    if (status === 401) throw new Error('Authentication failed. Check your Adafruit IO API key.');
    if (status === 403) throw new Error('Access forbidden. Check your API key permissions.');
    if (status === 404) throw new Error('Resource not found on Adafruit IO.');
    if (status === 429) throw new Error('Rate limit exceeded. Free plan allows 30 data points/minute.');
    const message = data?.error || data?.message || JSON.stringify(data);
    throw new Error(`API Error (${status}): ${message}`);
  } else if (error.request) {
    throw new Error('No response from Adafruit IO API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// FEEDS
// ============================================================

export async function listFeeds() {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.get(`/${username}/feeds`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getFeed(feedKey) {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.get(`/${username}/feeds/${feedKey}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createFeed({ name, description, visibility = 'private' }) {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.post(`/${username}/feeds`, {
      feed: { name, description, visibility }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// DATA
// ============================================================

export async function sendData(feedKey, value, { lat, lon, ele, createdAt } = {}) {
  try {
    const client = getClient();
    const username = getUsername();
    const body = { value: String(value) };
    if (lat !== undefined) body.lat = lat;
    if (lon !== undefined) body.lon = lon;
    if (ele !== undefined) body.ele = ele;
    if (createdAt) body.created_at = createdAt;

    const response = await client.post(`/${username}/feeds/${feedKey}/data`, body);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getData(feedKey, dataId) {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.get(`/${username}/feeds/${feedKey}/data/${dataId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function listData(feedKey, { limit = 100, startTime, endTime } = {}) {
  try {
    const client = getClient();
    const username = getUsername();
    const params = { limit };
    if (startTime) params.start_time = startTime;
    if (endTime) params.end_time = endTime;

    const response = await client.get(`/${username}/feeds/${feedKey}/data`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

// ============================================================
// DASHBOARDS
// ============================================================

export async function listDashboards() {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.get(`/${username}/dashboards`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getDashboard(dashboardKey) {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.get(`/${username}/dashboards/${dashboardKey}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createDashboard({ name, description }) {
  try {
    const client = getClient();
    const username = getUsername();
    const response = await client.post(`/${username}/dashboards`, {
      name,
      description
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}
