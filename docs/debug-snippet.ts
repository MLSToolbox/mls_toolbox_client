// Add this temporary debugging code to the selectNode method
// Put this at the very beginning of the selectNode method

console.group('🔍 DEBUG selectNode');
console.log('selectedPath:', path);
console.log('nodeType:', nodeType);
console.log('projectStructure.path:', this.projectStructure?.path);

// Log what's in fileMetricsMap
console.log('\n📦 fileMetricsMap keys (first 20):');
let count = 0;
this.fileMetricsMap.forEach((_, key) => {
    if (count < 20) {
        console.log(`  ${count + 1}. "${key}"`);
        count++;
    }
});
console.log(`  ... total: ${this.fileMetricsMap.size} entries`);

// Check if the selected path exists in any form
console.log('\n🔎 Checking if selectedPath exists in fileMetricsMap:');
const exists = this.fileMetricsMap.has(path);
console.log(`  Direct match: ${exists}`);

if (!exists) {
    console.log('\n  Trying variations:');

    const variations = [
        path,
        path.startsWith('/') ? path.substring(1) : '/' + path,
        path.replace(this.projectStructure?.path || '', '').replace(/^\/+/, ''),
        (this.projectStructure?.path || '') + '/' + path.replace(/^\/+/, ''),
    ];

    variations.forEach((v, idx) => {
        const varExists = this.fileMetricsMap.has(v);
        console.log(`  ${idx + 1}. "${v}" -> ${varExists ? '✓ FOUND' : '✗ not found'}`);
    });
}

console.groupEnd();
