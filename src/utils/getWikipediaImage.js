const queue = [];
let isProcessing = false;
const cache = new Map();

// Load from localStorage on initialization
try {
  const savedCache = localStorage.getItem('wikiImageCache');
  if (savedCache) {
    const parsed = JSON.parse(savedCache);
    for (const [key, val] of Object.entries(parsed)) {
      cache.set(key, val);
    }
  }
} catch (e) {}

const saveToLocalStorage = () => {
  try {
    const obj = Object.fromEntries(cache.entries());
    localStorage.setItem('wikiImageCache', JSON.stringify(obj));
  } catch (e) {}
};

const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;
  while (queue.length > 0) {
    const { driverFullName, resolve } = queue.shift();
    try {
      let searchName = driverFullName;
      if (driverFullName.includes('wikipedia.org/wiki/')) {
        searchName = decodeURIComponent(driverFullName.split('wikipedia.org/wiki/')[1]).replace(/_/g, ' ');
      }
      searchName = encodeURIComponent(searchName);
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchName}&prop=pageimages&format=json&pithumbsize=300&origin=*&redirects=1`;
      const res = await fetch(url);
      if (!res.ok) {
        // Don't save rate-limit failures to localStorage
        cache.set(driverFullName, null);
        resolve(null);
      } else {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0];
          const imgUrl = page?.thumbnail?.source || null;
          cache.set(driverFullName, imgUrl);
          if (imgUrl) saveToLocalStorage();
          resolve(imgUrl);
        } else {
          cache.set(driverFullName, null);
          saveToLocalStorage(); // Page exists but no image
          resolve(null);
        }
      }
    } catch(err) {
      cache.set(driverFullName, null);
      resolve(null);
    }
    // 350ms delay between Wikipedia requests to prevent rate-limiting and ERR_CONNECTION_RESET
    await new Promise(r => setTimeout(r, 350));
  }
  isProcessing = false;
};

async function getWikipediaImage(driverFullName) {
  if (!driverFullName) return null;
  if (cache.has(driverFullName)) {
    return cache.get(driverFullName);
  }
  return new Promise((resolve) => {
    queue.push({ driverFullName, resolve });
    processQueue();
  });
}

export default getWikipediaImage;
