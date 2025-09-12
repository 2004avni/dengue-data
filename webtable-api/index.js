const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const url =
  "https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&linkid=431&lid=3715";

// Function to scrape live tables
async function scrapeTables() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const tables = [];

    $("table").each((i, table) => {
      const rows = [];
      $(table)
        .find("tr")
        .each((j, row) => {
          const rowData = [];
          $(row)
            .find("th, td")
            .each((k, cell) => {
              rowData.push($(cell).text().trim());
            });
          rows.push(rowData);
        });
      tables.push(rows);
    });

    return tables; // Array of tables
  } catch (error) {
    console.error("Error scraping tables:", error);
    return null;
  }
}

// 👉 Route 1: Live scraped data
app.get("/", async (req, res) => {
  const tables = await scrapeTables();
  if (!tables) {
    return res.status(500).json({ error: "Failed to scrape tables" });
  }
  res.json({ tables });
});

// 👉 Route 2: Serve processed JSON from file
app.get("/dengue-processed", (req, res) => {
  fs.readFile("dengue_ready.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading dengue_ready.json:", err);
      return res.status(500).json({ error: "Failed to read processed data" });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing dengue_ready.json:", parseError);
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
