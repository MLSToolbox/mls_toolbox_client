const fs = require('fs');

// Load the response
const response = JSON.parse(fs.readFileSync('./PACKAGES_RESPONSE.json', 'utf8'));

console.log('=== DEBUGGING FOLDER METRICS MAPPING ===\n');

// Analyze each metric
const metrics = ['ifc_p', 'lpcml', 'pmcr', 'pdsc', 'pfp'];

metrics.forEach(metricId => {
  const metric = response.data.results[metricId];
  
  console.log(`\n--- METRIC: ${metricId.toUpperCase()} ---`);
  console.log(`Analyzer ID: ${metric.analyzer_id}`);
  console.log(`Module Count: ${metric.module_count}`);
  console.log(`Score: ${metric.score}`);
  
  // Check packages
  const packages = Object.keys(metric.details?.packages || {});
  console.log(`\nTotal Packages: ${packages.length}`);
  console.log('Package Paths:');
  packages.forEach((pkgPath, idx) => {
    console.log(`  ${idx + 1}. "${pkgPath}"`);
  });
  
  // Check messages
  const messagesByFile = metric.messages?.by_file || {};
  const messagesKeys = Object.keys(messagesByFile);
  console.log(`\nMessages for ${messagesKeys.length} paths:`);
  messagesKeys.forEach((msgPath, idx) => {
    const msgs = messagesByFile[msgPath];
    console.log(`  ${idx + 1}. "${msgPath}" - ${msgs.length} message(s)`);
  });
  
  // Check if all packages have messages
  console.log('\nPackage-Message Matching:');
  packages.forEach(pkgPath => {
    const hasMessage = messagesByFile.hasOwnProperty(pkgPath);
    const status = hasMessage ? '✓ HAS MESSAGE' : '✗ NO MESSAGE';
    console.log(`  "${pkgPath}": ${status}`);
  });
});

// Analyze path patterns
console.log('\n\n=== PATH PATTERN ANALYSIS ===\n');
console.log('All unique package paths across all metrics:');
const allPackagePaths = new Set();
metrics.forEach(metricId => {
  const packages = Object.keys(response.data.results[metricId].details?.packages || {});
  packages.forEach(p => allPackagePaths.add(p));
});

const pathsArray = Array.from(allPackagePaths).sort();
pathsArray.forEach((path, idx) => {
  const hasLeadingSlash = path.startsWith('/');
  const hasTrailingSlash = path.endsWith('/');
  const segments = path.split('/').filter(s => s.length > 0);
  
  console.log(`${idx + 1}. "${path}"`);
  console.log(`   - Leading slash: ${hasLeadingSlash}`);
  console.log(`   - Trailing slash: ${hasTrailingSlash}`);
  console.log(`   - Segments: ${segments.length} [${segments.join(', ')}]`);
});

console.log('\n\n=== EXPECTED PATH TRANSFORMATIONS ===\n');
console.log('Assuming project root is: /home/alberto/some-project\n');
pathsArray.forEach((path, idx) => {
  console.log(`${idx + 1}. Backend path: "${path}"`);
  console.log(`   Expected variations:`);
  console.log(`   - Original: "${path}"`);
  console.log(`   - With leading slash: "/${path}"`);
  console.log(`   - Without leading slash: "${path.startsWith('/') ? path.substring(1) : path}"`);
  console.log(`   - Absolute (root/path): "/home/alberto/some-project/${path}"`);
  console.log(`   - Absolute (root/path no slash): "/home/alberto/some-project${path.startsWith('/') ? path : '/' + path}"`);
  console.log('');
});
