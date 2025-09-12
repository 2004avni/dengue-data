const fs = require("fs");

async function main() {
  try {
    // fetch data directly from your API
    const response = await fetch("https://dengue-data.onrender.com/");
    const raw = await response.json();

    // take the first table
    const table = raw.tables[0];

    // extract years + labels
    const years = table[0].slice(2);
    const labels = table[1].slice(2);

    // build headers like "2015_Cases"
    const headers = ["Sl. No.", "State"].concat(
      years.map((y, i) => `${y}_${labels[i]}`)
    );

    // build documents
    const docs = table.slice(2).map((row) => {
      const doc = { "Sl. No.": parseInt(row[0], 10), State: row[1] };
      headers.slice(2).forEach((h, i) => {
        doc[h] = parseInt(row[i + 2], 10);
      });
      return doc;
    });

    // save to file
    fs.writeFileSync("dengue_ready.json", JSON.stringify(docs, null, 2));
    console.log("✅ Saved as dengue_ready.json");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
