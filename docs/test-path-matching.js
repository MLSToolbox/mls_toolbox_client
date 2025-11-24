// Simulate what happens when user selects a folder
const projectRoot = '/home/alberto/mlevol/mls_code_assessment';

// Backend paths (from the JSON response)
const backendPaths = [
  'src',
  'src/mls_lib/data_cleaning',
  'src/mls_lib/data_collection',
  'src/mls_lib/deployment',
  // ... etc
];

// What the frontend tree might provide when you click on "data_cleaning"
const possibleFrontendPaths = [
  `${projectRoot}/src/mls_lib/data_cleaning`,  // Absolute path
  '/src/mls_lib/data_cleaning',  // Relative with leading slash
  'src/mls_lib/data_cleaning',  // Relative without leading slash
];

console.log('=== PATH MATCHING SIMULATION ===\n');
console.log(`Project Root: ${projectRoot}\n`);

// Simulate the registerMetric function
function simulateRegisterMetric(backendPath, projectRoot) {
  const paths = new Set();
  paths.add(backendPath);
  
  // Add variations with/without leading slash
  if (!backendPath.startsWith('/')) paths.add('/' + backendPath);
  if (backendPath.startsWith('/')) paths.add(backendPath.substring(1));
  
  // Handle root path variations
  if (backendPath === '.' || backendPath === '' || backendPath === '/') {
    paths.add('.');
    paths.add('');
    paths.add('/');
    if (projectRoot) {
      paths.add(projectRoot);
    }
  } else if (projectRoot) {
    // If we have project root, try to construct absolute path
    const root = projectRoot.endsWith('/') 
      ? projectRoot.slice(0, -1) 
      : projectRoot;
      
    // If path is relative (doesn't start with root), add absolute version
    if (!backendPath.startsWith(root)) {
      const cleanPath = backendPath.startsWith('/') ? backendPath.slice(1) : backendPath;
      paths.add(`${root}/${cleanPath}`);
    }
  }
  
  return Array.from(paths);
}

console.log('Backend Path: "src/mls_lib/data_cleaning"');
console.log('\nRegistered variations:');
const variations = simulateRegisterMetric('src/mls_lib/data_cleaning', projectRoot);
variations.forEach((v, idx) => {
  console.log(`  ${idx + 1}. "${v}"`);
});

console.log('\nPossible Frontend Paths:');
possibleFrontendPaths.forEach((fp, idx) => {
  const matches = variations.includes(fp);
  console.log(`  ${idx + 1}. "${fp}" - ${matches ? '✓ MATCHES' : '✗ NO MATCH'}`);
});

console.log('\n\n=== TESTING ALL BACKEND PATHS ===\n');
backendPaths.forEach(backendPath => {
  const vars = simulateRegisterMetric(backendPath, projectRoot);
  console.log(`Backend: "${backendPath}"`);
  console.log(`  Variations: ${vars.length}`);
  vars.forEach(v => console.log(`    - "${v}"`));
  console.log('');
});
