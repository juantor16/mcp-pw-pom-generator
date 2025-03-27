import express from 'express';
import { analyzePage } from './analyzer';
import { generatePOM } from './pomGenerator';
import { crawlAndGeneratePOMs } from './navigator';

const app = express();
app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { url, output } = req.body;
  if (!url) res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await analyzePage(url);
    generatePOM(result.elements, output || 'GeneratedPage.ts');
    res.json({ success: true, message: 'POM generated', elements: result.elements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error analyzing the page' });
  }
});

app.post('/crawl', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ error: 'Missing URL' });
    return;
  }

  try {
    const result = await crawlAndGeneratePOMs(url);
    res.json({ success: true, message: 'Crawl complete', pages: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error during the crawl' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ MCP Server running at http://localhost:${PORT}`);
});