const { sendTest, sendMessage } = require('./sms-api');
const puppeteer = require('puppeteer');

(async () => {

  // Extract items on the page, recursively check the next page in the URL pattern
  const extractItems = async url => {

    // Scrape the data we want
    const page = await browser.newPage();
    await page.goto(url);
    console.log(`Scrapping: ${url}`);
    const itemsOnPage = await page.evaluate(() => {
      let searchParam = document.querySelector("a.button-link.button_next");
      if (searchParam)
        return Array.from(
					document.querySelectorAll('tr.basic_info.finalized')
				).map(service => ({
					id: service.getAttribute('data-event_id'),
					title: service.querySelector('td.service_name').innerText.trim(),
					price: service
						.querySelector('td:nth-child(2) strong')
						.innerText.split(',')[0],
					date: service
						.querySelector('td:nth-child(3) div')
						.innerText.split(' ')[1]
				}));
      else 
        return [];
    });
    const searchFlag = await page.evaluate(
			() => document.querySelector("a.button-link.button_next")
		);
    await page.close();

    // Recursively scrape the next page
    if (!searchFlag) {
      console.log(
				'\x1b[33m%s\x1b[0m',
				`Terminate scrapping on: ${url}\n`
			);
      // Terminate if no items exist
      return itemsOnPage
    } else {
      // Go fetch the next page ?page=X+1
      const nextPageNumber = parseInt(url.match(/page=(\d+)/)[1], 10) + 1;
      const nextUrl = `${baseUrl}?page=${nextPageNumber}&size=100`;

      return itemsOnPage.concat(await extractItems(nextUrl))
    }
  };

  const browser = await puppeteer.launch();

  const baseUrl =
		'https://panel.versum.com/pinky/settings/employees/4360482/events_history';
  let month = '09';

  const firstUrl = `${baseUrl}?page=1&size=100`;

  
  const credentials = {
		login: 'justynagajzler@gmail.com',
		pass: 'K0k@rdk@7',
	};

	const page = await browser.newPage();
	await page.goto(firstUrl);
	await page.type('.user_login input', credentials.login);
	await page.type('.user_password input', credentials.pass);
	await page.click('button[type=submit]');

	const resultsSelector = '.list-table';
	await page.waitForSelector(resultsSelector);
  
  
  const items = await extractItems(firstUrl);

  // Todo: Update database with items
  // console.log(items.length, items[items.length - 1]);
  
  let sum = 0;
  
  items.map(item => {
    if(item.date.split('.')[1] === month)
      sum = sum + parseInt(item.price, 10);
  });
  
  const message = {
		from: 'Test',
		to: '512768443',
		text: `W wybranym miesiącu (${month}) zarobiłaś - ${sum} zł. Twoja prowizja - ${Math.floor(sum * 0.3)} zł`
	};

  sendTest(message);
  // sendMessage(message);

  await browser.close();
})();