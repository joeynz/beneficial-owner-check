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

// Serve static files from the src/config directory
app.use('/config', express.static(path.join(__dirname, 'src/config')));

// API endpoint to get a specific region configuration
app.get('/api/config/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const regionCode = region.toLowerCase();
    
    // Check if the region file exists
    const regionFilePath = path.join(__dirname, 'src/config/regions', `${regionCode}.yaml`);
    
    try {
      const fileContent = await fs.readFile(regionFilePath, 'utf8');
      const config = yaml.load(fileContent);
      
      res.json({
        success: true,
        config: config
      });
    } catch (fileError) {
      // If file doesn't exist, return a default structure
      const defaultConfig = {
        code: regionCode.toUpperCase(),
        name: regionCode.toUpperCase(),
        description: '',
        threshold: 25,
        currency: 'USD',
        availableBusinessTypes: [],
        notes: ''
      };
      
      res.json({
        success: true,
        config: defaultConfig
      });
    }
  } catch (error) {
    console.error('Error loading region config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load region configuration'
    });
  }
});

// API endpoint to save a region configuration
app.post('/api/config/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const { config } = req.body;
    const regionCode = region.toLowerCase();
    
    if (!config) {
      return res.status(400).json({
        success: false,
        error: 'Configuration data is required'
      });
    }

    // Ensure the regions directory exists
    const regionsDir = path.join(__dirname, 'src/config/regions');
    try {
      await fs.access(regionsDir);
    } catch {
      await fs.mkdir(regionsDir, { recursive: true });
    }

    // Save the configuration to the region file
    const regionFilePath = path.join(regionsDir, `${regionCode}.yaml`);
    const yamlContent = yaml.dump(config, { 
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });
    
    await fs.writeFile(regionFilePath, yamlContent, 'utf8');
    
    console.log(`Configuration saved for region: ${regionCode}`);
    
    res.json({
      success: true,
      message: `Configuration saved successfully for ${regionCode.toUpperCase()}`
    });
  } catch (error) {
    console.error('Error saving region config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save region configuration'
    });
  }
});

// API endpoint to get all available regions
app.get('/api/regions', async (req, res) => {
  try {
    const regionsDir = path.join(__dirname, 'src/config/regions');
    const files = await fs.readdir(regionsDir);
    
    const regions = files
      .filter(file => file.endsWith('.yaml'))
      .map(file => file.replace('.yaml', ''))
      .map(code => ({
        code: code.toUpperCase(),
        name: code.toUpperCase()
      }));
    
    res.json({
      success: true,
      regions: regions
    });
  } catch (error) {
    console.error('Error loading regions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load regions'
    });
  }
});

// API endpoint to get business types configuration
app.get('/api/business-types', async (req, res) => {
  try {
    const businessTypesPath = path.join(__dirname, 'src/config/business-types.yaml');
    const fileContent = await fs.readFile(businessTypesPath, 'utf8');
    const businessTypes = yaml.load(fileContent);
    
    res.json({
      success: true,
      businessTypes: businessTypes
    });
  } catch (error) {
    console.error('Error loading business types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load business types'
    });
  }
});

// API endpoint to get requirements configuration
app.get('/api/requirements', async (req, res) => {
  try {
    const requirementsPath = path.join(__dirname, 'src/config/requirements.yaml');
    const fileContent = await fs.readFile(requirementsPath, 'utf8');
    const requirements = yaml.load(fileContent);
    
    res.json({
      success: true,
      requirements: requirements
    });
  } catch (error) {
    console.error('Error loading requirements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load requirements'
    });
  }
});

// API endpoint to get relationships configuration
app.get('/api/relationships', async (req, res) => {
  try {
    const relationshipsPath = path.join(__dirname, 'src/config/relationships.yaml');
    const fileContent = await fs.readFile(relationshipsPath, 'utf8');
    const relationships = yaml.load(fileContent);
    
    res.json({
      success: true,
      relationships: relationships
    });
  } catch (error) {
    console.error('Error loading relationships:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load relationships'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Configuration server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Configuration server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/health - Health check`);
  console.log(`  GET  /api/regions - List all regions`);
  console.log(`  GET  /api/config/:region - Get region configuration`);
  console.log(`  POST /api/config/:region - Save region configuration`);
  console.log(`  GET  /api/business-types - Get business types`);
  console.log(`  GET  /api/requirements - Get requirements`);
  console.log(`  GET  /api/relationships - Get relationships`);
}); 