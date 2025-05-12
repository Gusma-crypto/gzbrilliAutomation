const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const prompt = require('prompt-sync')({ sigint: true });
const fs = require('fs').promises;

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  white: '\x1b[37m',
  bold: '\x1b[1m',
};

const logger = {
  info: (msg) => console.log(`${colors.green}[✓] ${msg}${colors.reset}`),
  wallet: (msg) => console.log(`${colors.yellow}[➤] ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
  loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
  step: (msg) => console.log(`\n${colors.white}[➤] ${msg}${colors.reset}`),
  banner: () => {
    console.log(`${colors.cyan}${colors.bold}`);
    console.log(`---------------------------------------------`);
    console.log(`  Brilliance Auto Ref - Airdrop Insiders `);
    console.log(`---------------------------------------------${colors.reset}\n`);
  },
};

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
];

const secChUaOptions = [
  '"Chromium";v="136", "Microsoft Edge";v="136", "Not.A/Brand";v="99"',
  '"Chromium";v="120", "Google Chrome";v="120", "Not.A/Brand";v="99"',
  '"Firefox";v="115", "Gecko";v="20100101", "Not.A/Brand";v="99"',
];

const firstNames = ['John', 'Emma', 'Michael', 'Sophia', 'James', 'Olivia', 'William', 'Ava', 'Carole'];
const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Wilson', 'Davis', 'Clark', 'Harris'];
const randomString = (length) => Math.random().toString(36).substring(2, 2 + length);

const EMAIL_DOMAIN = 'gmail.com';

const generateEmail = async () => {
  const existingAccounts = await loadExistingAccounts();
  const existingEmails = existingAccounts.map(acc => acc.email);
  let email;
  do {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const num = Math.floor(Math.random() * 10000);
    email = `${num}${first.toLowerCase()}@${EMAIL_DOMAIN}`;
  } while (existingEmails.includes(email));
  return email;
};

const generateUsername = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `@${first}${randomString(5)}`;
};

const generatePassword = () => {
  const base = randomString(8);
  const upper = base.charAt(0).toUpperCase() + base.slice(1);
  return `${upper}@${Math.floor(Math.random() * 100)}`;
};

async function readReferralCode() {
  try {
    const data = await fs.readFile('code.txt', 'utf8');
    return data.trim();
  } catch (err) {
    logger.error('Failed to read code.txt');
    process.exit(1);
  }
}

async function readProxies() {
  try {
    const data = await fs.readFile('proxies.txt', 'utf8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line);
    return [...new Set(proxies)]; 
  } catch (err) {
    logger.error('Failed to read proxies.txt');
    return [];
  }
}

async function loadExistingAccounts() {
  try {
    const data = await fs.readFile('accounts.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveAccount(account) {
  try {
    let accounts = await loadExistingAccounts();
    accounts.push(account);
    await fs.writeFile('accounts.json', JSON.stringify(accounts, null, 2));
    logger.success('Account saved to accounts.json');
  } catch (err) {
    logger.error('Failed to save account');
  }
}

async function makeRequest(config, proxy, retries = 3) {
  const headers = {
    ...config.headers,
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': secChUaOptions[Math.floor(Math.random() * secChUaOptions.length)],
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'Referer': 'https://brillianceglobal.ltd/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'priority': 'u=1, i',
  };

  const axiosConfig = {
    ...config,
    headers,
    httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    timeout: 10000,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios(axiosConfig);
      return response.data;
    } catch (err) {
      if (attempt === retries) {
        const errorMsg = err.response
          ? `Request failed with status ${err.response.status}: ${JSON.stringify(err.response.data)}`
          : `Request failed: ${err.message}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
      logger.warn(`Retrying request (${attempt}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function register(email, password, referBy, proxy) {
  const boundary = `WebKitFormBoundaryKsGEYWlCYHLABhUx`;
  const body = [
    `------${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\n${email}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="password"\r\n\r\n${password}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="confirmpass"\r\n\r\n${password}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="refer_by"\r\n\r\n${referBy}\r\n`,
    `------${boundary}--\r\n`,
  ].join('');

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/register',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid registration response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function login(email, password, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = [
    `------${boundary}\r\nContent-Disposition: form-data; name="email"\r\n\r\n${email}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="password"\r\n\r\n${password}\r\n`,
    `------${boundary}--\r\n`,
  ].join('');

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/login',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.token) {
    throw new Error(`Invalid login response: ${JSON.stringify(response)}`);
  }

  return response.token;
}

async function getProfile(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/profile',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !Array.isArray(response) || !response[0]) {
    throw new Error(`Invalid profile response: ${JSON.stringify(response)}`);
  }

  return response[0];
}

async function claim(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/claim',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid claim response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function mining(token, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n------${boundary}--\r\n`;

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/mining',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid mining response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function joinAirdrop(token, twitter, telegram, retweetLink, proxy) {
  const boundary = `WebKitFormBoundary${randomString(16)}`;
  const body = [
    `------${boundary}\r\nContent-Disposition: form-data; name="twitter"\r\n\r\n${twitter}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="retweet"\r\n\r\n${retweetLink}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="telegram"\r\n\r\n${telegram}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="telegram2"\r\n\r\n${telegram}\r\n`,
    `------${boundary}\r\nContent-Disposition: form-data; name="token"\r\n\r\n${token}\r\n`,
    `------${boundary}--\r\n`,
  ].join('');

  const response = await makeRequest({
    url: 'https://api.brillianceglobal.ltd/joinairdrop',
    method: 'POST',
    headers: {
      'content-type': `multipart/form-data; boundary=----${boundary}`,
    },
    data: body,
  }, proxy);

  if (!response || !response.success) {
    throw new Error(`Invalid airdrop response: ${JSON.stringify(response)}`);
  }

  return response;
}

async function main() {
  logger.banner(); 

  const numAccounts = parseInt(prompt('Enter number of accounts to create: '));
  if (isNaN(numAccounts) || numAccounts <= 0) {
    logger.error('Invalid number of accounts');
    return;
  }

  const referBy = await readReferralCode();
  let proxies = await readProxies();
  logger.info(`Loaded referral code: ${referBy}`);
  logger.info(`Loaded ${proxies.length} proxies`);

  if (proxies.length === 0) {
    logger.warn('No proxies available. Using local IP, which may be flagged as already registered.');
  }

  for (let i = 1; i <= numAccounts; i++) {
    logger.step(`Processing account ${i}/${numAccounts}`);
    const proxy = proxies.length > 0 ? proxies[(i - 1) % proxies.length] : null;
    if (proxy) logger.info(`Using proxy: ${proxy}`);
    else logger.warn('No proxy used');

    try {
      const email = await generateEmail();
      const password = generatePassword();
      const twitter = generateUsername();
      const telegram = generateUsername();
      const retweetLink = `https://x.com/${randomString(8)}/status/${Math.floor(Math.random() * 1000000000000000)}`;

      logger.loading(`Registering ${email}...`);
      const regResponse = await register(email, password, referBy, proxy);
      logger.success(`Registered ${email}: ${regResponse.success}`);

      logger.loading('Logging in...');
      const token = await login(email, password, proxy);
      logger.success('Logged in successfully');

      logger.loading('Fetching profile...');
      const profile = await getProfile(token, proxy);
      logger.success(`Profile fetched: ${profile.myrefcode || 'N/A'}`);

      logger.loading('Claiming reward...');
      const claimResponse = await claim(token, proxy);
      logger.success(`Claim: ${claimResponse.success}`);

      logger.loading('Submitting airdrop...');
      const airdropResponse = await joinAirdrop(token, twitter, telegram, retweetLink, proxy);
      logger.success(`Airdrop: ${airdropResponse.success}`);

      logger.loading('Starting mining...');
      const miningResponse = await mining(token, proxy);
      logger.success(`Mining: ${miningResponse.success}, BINC: ${miningResponse.binc}`);

      const account = {
        email,
        password,
        token,
        twitter,
        telegram,
        retweetLink,
        profile,
      };
      await saveAccount(account);
      logger.wallet(`Account ${i} completed: ${email}`);

    } catch (err) {
      if (err.message.includes('Your device already registered')) {
        logger.error(`Account ${i} failed: Device already registered with proxy ${proxy || 'none'}`);
      } else {
        logger.error(`Error with account ${i}: ${err.message}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); 
  }

  logger.success(`Completed processing ${numAccounts} accounts`);
}

main().catch(err => {
  logger.error(`Fatal error: ${err.message}`);
  process.exit(1);
});