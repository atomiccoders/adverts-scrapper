const puppeteer = require("puppeteer");
var moment = require("moment");

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

    return nodesArray.map(node => {
      const title =
        node.firstElementChild.firstElementChild.firstElementChild
          .firstElementChild.firstElementChild.alt;
      const link =
        node.firstElementChild.firstElementChild.firstElementChild
          .firstElementChild.href;
      const price =
        node.firstElementChild.firstElementChild.children[2].firstElementChild
          .children[0].innerText;
      const localization =
        node.firstElementChild.lastElementChild.firstElementChild
          .firstElementChild.firstElementChild.children[0].innerText;
      const date =
        node.firstElementChild.lastElementChild.firstElementChild
          .firstElementChild.firstElementChild.children[1].innerText;

      return {
        title: title,
        link: link,
        price: price,
        localization: localization,
        date: date
      };
    });
  }, resultsSelector);

  console.log(links);

  await browser.close();
})();
