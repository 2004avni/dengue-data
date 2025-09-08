const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // Allow requests from frontend

// Function to scrape tables from the given URL
async function scrapeTables(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const tables = [];

        $('table').each((i, table) => {
            const rows = [];
            $(table).find('tr').each((j, row) => {
                const cells = [];
                $(row).find('th, td').each((k, cell) => {
                    cells.push($(cell).text().trim());
                });
                if (cells.length) rows.push(cells);
            });

            if (rows.length > 1) {
                const headers = rows[0];
                const dataRows = rows.slice(1);
                const tableData = dataRows.map(row => {
                    const rowData = {};
                    headers.forEach((header, i) => {
                        rowData[header || `Column${i+1}`] = row[i] || '';
                    });
                    return rowData;
                });
                tables.push({
                    headers,
                    rows: tableData
                });
            }
        });

        return tables;
    } catch (err) {
        console.error(err.message);
        throw new Error("Failed to fetch or parse tables.");
    }
}

// API endpoint
app.get('/api/tables', async (req, res) => {
    const targetUrl = 'https://ncvbdc.mohfw.gov.in/index4.php?lang=1&level=0&linkid=431&lid=3715';
    
    try {
        const tables = await scrapeTables(targetUrl);
        res.json({
            success: true,
            tableCount: tables.length,
            data: tables
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Web Table Scraper API is running...');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
