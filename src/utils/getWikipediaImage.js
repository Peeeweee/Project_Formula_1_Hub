async function getWikipediaImage(driverFullName) {
  const searchName = encodeURIComponent(driverFullName);
  const url = "https://en.wikipedia.org/w/api.php?action=query&titles=" + searchName + "&prop=pageimages&format=json&pithumbsize=300&origin=*";
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const page = Object.values(pages)[0];
  return page?.thumbnail?.source || null;
}

export default getWikipediaImage;
