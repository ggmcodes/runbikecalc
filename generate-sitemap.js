const fs = require('fs');
const path = require('path');

const baseUrl = 'https://runbikecalc.com';
const today = new Date().toISOString().split('T')[0];

// Get all HTML files
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'images') {
            getHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html') && file !== 'offline.html') {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const rootDir = '.';
const htmlFiles = getHtmlFiles(rootDir);

// Priority mapping
function getPriority(filePath) {
    if (filePath === './index.html' || filePath === 'index.html') return '1.0';
    if (filePath.includes('ultimate-endurance')) return '0.95';
    if (filePath.includes('calculator')) return '0.9';
    if (filePath.includes('-hub') || filePath.includes('training-plan-generator')) return '0.88';
    if (filePath.includes('complete-guide-2026')) return '0.85';
    if (filePath.includes('complete-guide')) return '0.8';
    if (filePath.includes('blog/')) return '0.75';
    if (filePath.includes('about') || filePath.includes('contact') || filePath.includes('privacy') || filePath.includes('terms')) return '0.4';
    return '0.7';
}

// Generate URLs
let urls = htmlFiles.map(file => {
    let url = file.replace('./', '').replace('.html', '');
    if (url === 'index') url = '';

    // Clean URL format
    const loc = url === '' ? baseUrl + '/' : baseUrl + '/' + url;

    return {
        loc: loc,
        lastmod: today,
        changefreq: file.includes('blog/') ? 'monthly' : 'weekly',
        priority: getPriority(file)
    };
});

// Sort by priority descending
urls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

// Generate XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

urls.forEach(u => {
    xml += '    <url>\n';
    xml += '        <loc>' + u.loc + '</loc>\n';
    xml += '        <lastmod>' + u.lastmod + '</lastmod>\n';
    xml += '        <changefreq>' + u.changefreq + '</changefreq>\n';
    xml += '        <priority>' + u.priority + '</priority>\n';
    xml += '    </url>\n';
});

xml += '</urlset>';

fs.writeFileSync('sitemap.xml', xml);
console.log('Generated sitemap with ' + urls.length + ' URLs');
console.log('Top priority pages:');
urls.slice(0, 10).forEach(u => console.log('  ' + u.priority + ' - ' + u.loc));
