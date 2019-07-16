const puppeteer = require("puppeteer");

(async () => {

  // Extract items on the page, recursively check the next page in the URL pattern
  const extractItems = async url => {

    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Scrapping: ${url}`);
    const itemsOnPage = await page.evaluate(() => {
      let searchParam = document.querySelector('input#search-text').value;
      if (searchParam !== 'Szukaj...')
        return Array.from(document.querySelectorAll("td.offer:not(.promoted) table")).map(compact => ({
          title: compact.querySelector("h3 a strong").innerText.trim(),
          logo: compact.querySelector("a.thumb img") !== null ? compact.querySelector("a.thumb img").src : '',
          link: compact.querySelector("h3 a").href
        }))
      else 
        return [];
    });
    const searchFlag = await page.evaluate(() => document.querySelector('input#search-text').value);
    await page.close();

    // Recursively scrape the next page
    if (searchFlag === 'Szukaj...') {
      console.log(`Terminate scrapping on: ${url}`);
      // Terminate if no items exist
      return itemsOnPage
    } else {
      // Go fetch the next page ?page=X+1
      const nextPageNumber = parseInt(url.match(/page=(\d+)$/)[1], 10) + 1;
      const nextUrl = `${baseUrl}/${city}/q-${query}/?page=${nextPageNumber}`;

      return itemsOnPage.concat(await extractItems(nextUrl))
    }
  };

  const browser = await puppeteer.launch();

  const baseUrl = "http://olx.pl/";
  const city = "gdansk";
  let query = "ponton";

  query = query.replace(" ", "-");

  const firstUrl = `${baseUrl}/${city}/q-${query}/?page=1`;

  const items = await extractItems(firstUrl);

  // Todo: Update database with items
  console.log(items.length, items[items.length-1]);

  await browser.close();
})();