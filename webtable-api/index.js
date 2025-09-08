const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&linkid=431&lid=3715';

async function scrapeTables() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const tables = [];

    $('table').each((i, table) => {
      const rows = [];
      $(table).find('tr').each((j, row) => {
        const rowData = [];
        $(row).find('th, td').each((k, cell) => {
          rowData.push($(cell).text().trim());
        });
        rows.push(rowData);
      });
      tables.push(rows);
    });

    return tables; // Array of tables (each table is array of rows, each row is array of cells)
  } catch (error) {
    console.error('Error scraping tables:', error);
    return null;
  }
}

app.get('/', async (req, res) => {
  const tables = await scrapeTables();
  if (!tables) {
    return res.status(500).json({ error: 'Failed to scrape tables' });
  }
  res.json({ tables }); // Send tables as JSON
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
