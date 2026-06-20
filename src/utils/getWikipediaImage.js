const queue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;
  while (queue.length > 0) {
    const { driverFullName, resolve } = queue.shift();
    try {
      const searchName = encodeURIComponent(driverFullName);
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchName}&prop=pageimages&format=json&pithumbsize=300&origin=*&redirects=1`;
      const res = await fetch(url);
      if (!res.ok) {
        resolve(null);
      } else {
        const data = await res.json();
        const pages = data.query?.pages;
        if (pages) {
          const page = Object.values(pages)[0];
          resolve(page?.thumbnail?.source || null);
        } else {
          resolve(null);
        }
      }
    } catch(err) {
      resolve(null);
    }
    // 100ms delay between Wikipedia requests to prevent rate-limiting (429 Too Many Requests)
    await new Promise(r => setTimeout(r, 100));
  }
  isProcessing = false;
};

async function getWikipediaImage(driverFullName) {
  if (!driverFullName) return null;
  return new Promise((resolve) => {
    queue.push({ driverFullName, resolve });
    processQueue();
  });
}

export default getWikipediaImage;
