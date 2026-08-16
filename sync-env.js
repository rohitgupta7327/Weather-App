const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const configPath = path.join(__dirname, 'config.js');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/(?:VITE_WEATHER_API_KEY|API_KEY)\s*=\s*["']?([^"'\r\n]+)["']?/);
  const apiKey = match ? match[1].trim() : '';
  
  fs.writeFileSync(configPath, `const apiKey = "${apiKey}";\n`);
  console.log('✅ Generated config.js from .env');
} else {
  console.error('❌ .env file not found.');
}
