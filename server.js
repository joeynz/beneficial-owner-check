import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint to save YAML configuration
app.post('/api/save-config', async (req, res) => {
  try {
    const { regionCode, config } = req.body;
    
    if (!regionCode || !config) {
      return res.status(400).json({ error: 'Missing regionCode or config' });
    }
    
    // Convert config object to YAML
    const yamlContent = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
      noRefs: true
    });
    
    // Path to the YAML file
    const yamlPath = path.join(__dirname, 'src', 'config', 'regions', `${regionCode}.yaml`);
    
    // Write the YAML content to file
    await fs.writeFile(yamlPath, yamlContent, 'utf8');
    
    console.log(`Saved configuration for ${regionCode} to ${yamlPath}`);
    
    res.json({ 
      success: true, 
      message: `${regionCode}.yaml saved successfully!`,
      path: yamlPath 
    });
    
  } catch (error) {
    console.error('Error saving YAML file:', error);
    res.status(500).json({ 
      error: 'Failed to save YAML file',
      details: error.message 
    });
  }
});

// API endpoint to get YAML configuration
app.get('/api/config/:regionCode', async (req, res) => {
  try {
    const { regionCode } = req.params;
    const yamlPath = path.join(__dirname, 'src', 'config', 'regions', `${regionCode}.yaml`);
    
    const content = await fs.readFile(yamlPath, 'utf8');
    const config = yaml.load(content);
    
    res.json({ success: true, config });
    
  } catch (error) {
    console.error('Error reading YAML file:', error);
    res.status(500).json({ 
      error: 'Failed to read YAML file',
      details: error.message 
    });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 