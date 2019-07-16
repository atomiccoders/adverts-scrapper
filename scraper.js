const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const url = "http://olx.pl/";
  const city = "gdansk";
  let query = "lodówka";

  query = query.replace(" ", "-");

  await page.goto(`${url}/${city}/q-${query}`);
  await page.screenshot({ path: "screenshot.png", fullPage: true });

  const resultsSelector = "td.offer:not(.promoted) table";
  await page.waitForSelector(resultsSelector);

  const links = await page.evaluate(resultsSelector => {
    const nodesArray = Array.from(document.querySelectorAll(resultsSelector));

    return nodesArray.map(node => ({
      title: node.querySelector('h3 a strong').innerText,
      link: node.querySelector('h3 a').href,
      price: node.querySelector('p.price strong').innerText,
      localization: node.querySelector('.bottom-cell small:first-child span').innerText,
      date: node.querySelector('.bottom-cell small:last-child span').innerText
    }));
  }, resultsSelector);

  console.log(links.length);

  await browser.close();
})();
