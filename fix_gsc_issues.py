#!/usr/bin/env python3

import os
import re
from pathlib import Path

def fix_canonical_tags():
    """Fix canonical tags to use clean URLs without .html"""
    print("Fixing canonical tags...")
    
    project_dir = '/Users/glengomezmeade/Projects/runbikecalc'
    
    # Process all HTML files
    for root, dirs, files in os.walk(project_dir):
        # Skip hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                
                # Skip certain files
                if 'node_modules' in filepath or '.git' in filepath:
                    continue
                
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Get relative path for canonical URL
                rel_path = os.path.relpath(filepath, project_dir)
                
                # Determine canonical URL
                if file == 'index.html':
                    if root == project_dir:
                        canonical_url = 'https://runbikecalc.com/'
                    else:
                        # Subdirectory index
                        subdir = os.path.relpath(root, project_dir)
                        canonical_url = f'https://runbikecalc.com/{subdir}/'
                elif '.html' in file:
                    # Remove .html extension for clean URLs
                    name_without_ext = file[:-5]
                    if root == project_dir:
                        canonical_url = f'https://runbikecalc.com/{name_without_ext}'
                    else:
                        subdir = os.path.relpath(root, project_dir)
                        # For blog posts, keep the .html in the canonical
                        if 'blog' in subdir:
                            canonical_url = f'https://runbikecalc.com/{subdir}/{file}'
                        else:
                            canonical_url = f'https://runbikecalc.com/{subdir}/{name_without_ext}'
                
                # Fix duplicate canonical tags - remove all existing and add one
                # Remove existing canonical tags
                content = re.sub(r'<link[^>]*rel=["\']canonical["\'][^>]*>\s*\n?', '', content)
                
                # Add canonical tag after title
                title_match = re.search(r'</title>', content)
                if title_match:
                    insert_pos = title_match.end()
                    new_canonical = f'<link rel="canonical" href="{canonical_url}">'
                    content = content[:insert_pos] + f'\n    {new_canonical}' + content[insert_pos:]
                    print(f"  Fixed: {rel_path} -> {canonical_url}")
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

def create_studies_page():
    """Create the missing studies page"""
    print("\nCreating studies page...")
    
    studies_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Running & Cycling Studies | Scientific Research | RunBikeCalc</title>
    <link rel="canonical" href="https://runbikecalc.com/studies">
    <meta name="description" content="Scientific studies and research on running and cycling performance, training methods, VO2 max, lactate threshold, and endurance sports science.">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="text-xl font-bold text-indigo-600">RunBikeCalc</a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/calculators" class="text-gray-700 hover:text-indigo-600">Calculators</a>
                    <a href="/guides" class="text-gray-700 hover:text-indigo-600">Guides</a>
                    <a href="/blog/" class="text-gray-700 hover:text-indigo-600">Blog</a>
                    <a href="/studies" class="text-indigo-600 font-medium">Studies</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Scientific Studies & Research</h1>
        
        <p class="text-lg text-gray-700 mb-12">
            Evidence-based research and scientific studies that inform our calculators and training recommendations.
        </p>

        <!-- Study Categories -->
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <!-- VO2 Max Studies -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">VO2 Max Research</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/blog/vo2-max-training-guide-2025.html" class="text-gray-700 hover:text-indigo-600">
                            VO2 Max Training Guide: Scientific Approach
                        </a>
                    </li>
                    <li>
                        <a href="/vo2-max-calculator" class="text-gray-700 hover:text-indigo-600">
                            VO2 Max Calculator & Research
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Heart Rate Studies -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">Heart Rate Zone Research</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/heart-rate-zone-calculator" class="text-gray-700 hover:text-indigo-600">
                            Heart Rate Zone Calculator & Science
                        </a>
                    </li>
                    <li>
                        <a href="/heart-rate-zones" class="text-gray-700 hover:text-indigo-600">
                            Understanding Heart Rate Zones
                        </a>
                    </li>
                </ul>
            </div>

            <!-- FTP Studies -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">FTP & Cycling Power</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/blog/what-is-ftp-cycling-guide.html" class="text-gray-700 hover:text-indigo-600">
                            FTP Science & Testing Methods
                        </a>
                    </li>
                    <li>
                        <a href="/ftp-calculator" class="text-gray-700 hover:text-indigo-600">
                            FTP Calculator & Research
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Lactate Threshold Studies -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">Lactate Threshold Research</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/blog/lactate-threshold-training-guide-2025.html" class="text-gray-700 hover:text-indigo-600">
                            Lactate Threshold Training Science
                        </a>
                    </li>
                    <li>
                        <a href="/lactate-threshold-calculator" class="text-gray-700 hover:text-indigo-600">
                            Lactate Threshold Calculator
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Training Studies -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">Training Methodology</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/blog/marathon-training-guide-2025.html" class="text-gray-700 hover:text-indigo-600">
                            Marathon Training Research
                        </a>
                    </li>
                    <li>
                        <a href="/zone-2-training-plan-generator" class="text-gray-700 hover:text-indigo-600">
                            Zone 2 Training Science
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Performance Prediction -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold mb-4 text-indigo-600">Performance Prediction</h2>
                <ul class="space-y-3">
                    <li>
                        <a href="/race-time-predictor" class="text-gray-700 hover:text-indigo-600">
                            Race Time Prediction Models
                        </a>
                    </li>
                    <li>
                        <a href="/pace-calculator" class="text-gray-700 hover:text-indigo-600">
                            Pace Calculation Science
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Key Research Papers Section -->
        <section class="mt-16">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Key Research Papers & References</h2>
            <div class="bg-white rounded-lg shadow-md p-8">
                <div class="space-y-6">
                    <div>
                        <h3 class="font-semibold text-lg mb-2">VO2 Max & Endurance Performance</h3>
                        <p class="text-gray-700">Bassett, D. R., & Howley, E. T. (2000). "Limiting factors for maximum oxygen uptake and determinants of endurance performance." Medicine & Science in Sports & Exercise.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-lg mb-2">Heart Rate Training Zones</h3>
                        <p class="text-gray-700">Seiler, S. (2010). "What is best practice for training intensity and duration distribution in endurance athletes?" International Journal of Sports Physiology and Performance.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-lg mb-2">Lactate Threshold Training</h3>
                        <p class="text-gray-700">Faude, O., Kindermann, W., & Meyer, T. (2009). "Lactate threshold concepts: how valid are they?" Sports Medicine.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-lg mb-2">FTP & Cycling Performance</h3>
                        <p class="text-gray-700">Allen, H., & Coggan, A. (2010). "Training and Racing with a Power Meter." VeloPress.</p>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <p>&copy; 2025 RunBikeCalc. Science-based training tools.</p>
            </div>
        </div>
    </footer>
</body>
</html>'''
    
    with open('/Users/glengomezmeade/Projects/runbikecalc/studies.html', 'w', encoding='utf-8') as f:
        f.write(studies_content)
    print("  Created studies.html")

def create_redirects():
    """Create _redirects file for Netlify"""
    print("\nCreating _redirects file...")
    
    redirects_content = """# Netlify redirects for RunBikeCalc

# Clean URLs - remove .html extensions (except for blog posts)
/pace-calculator.html /pace-calculator 301!
/vo2-max-calculator.html /vo2-max-calculator 301!
/heart-rate-zone-calculator.html /heart-rate-zone-calculator 301!
/ftp-calculator.html /ftp-calculator 301!
/calorie-burn-calculator.html /calorie-burn-calculator 301!
/race-time-predictor.html /race-time-predictor 301!
/treadmill-pace-calculator.html /treadmill-pace-calculator 301!
/lactate-threshold-calculator.html /lactate-threshold-calculator 301!
/ftp-training-calculator.html /ftp-training-calculator 301!
/zone-2-training-plan-generator.html /zone-2-training-plan-generator 301!
/advanced-heart-rate-zones-calculator.html /advanced-heart-rate-zones-calculator 301!

# Page aliases
/calculators.html /calculators 301!
/guides.html /guides 301!
/glossary.html /glossary 301!
/studies.html /studies 301!
/heart-rate-zones.html /heart-rate-zones 301!

# Blog posts keep .html extension but need proper handling
/blog/ /blog/index.html 200

# Default clean URL handling (after specific redirects)
/*.html /:splat 301!
/* /:splat.html 200
"""
    
    with open('/Users/glengomezmeade/Projects/runbikecalc/_redirects', 'w') as f:
        f.write(redirects_content)
    print("  Created _redirects file")

def update_sitemap():
    """Update sitemap with proper URLs"""
    print("\nUpdating sitemap...")
    
    sitemap_path = '/Users/glengomezmeade/Projects/runbikecalc/sitemap.xml'
    
    if os.path.exists(sitemap_path):
        with open(sitemap_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix calculator URLs - remove .html extension
        calculators = [
            'pace-calculator', 'vo2-max-calculator', 'heart-rate-zone-calculator',
            'ftp-calculator', 'calorie-burn-calculator', 'race-time-predictor',
            'treadmill-pace-calculator', 'lactate-threshold-calculator',
            'ftp-training-calculator', 'zone-2-training-plan-generator',
            'advanced-heart-rate-zones-calculator'
        ]
        
        for calc in calculators:
            content = re.sub(f'{calc}\.html</loc>', f'{calc}</loc>', content)
        
        # Fix other pages
        content = re.sub(r'calculators\.html</loc>', 'calculators</loc>', content)
        content = re.sub(r'guides\.html</loc>', 'guides</loc>', content)
        content = re.sub(r'glossary\.html</loc>', 'glossary</loc>', content)
        content = re.sub(r'heart-rate-zones\.html</loc>', 'heart-rate-zones</loc>', content)
        
        # Add studies page if not present
        if 'studies</loc>' not in content:
            studies_entry = """    <url>
        <loc>https://runbikecalc.com/studies</loc>
        <lastmod>2025-08-15</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>"""
            content = content.replace('</urlset>', studies_entry)
        
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("  Updated sitemap.xml")

def main():
    print("Fixing Google Search Console issues for RunBikeCalc...\n")
    
    # Fix canonical tags and remove duplicates
    fix_canonical_tags()
    
    # Create missing studies page
    create_studies_page()
    
    # Create redirects file
    create_redirects()
    
    # Update sitemap
    update_sitemap()
    
    print("\n✅ All GSC issues fixed!")
    print("\nNext steps:")
    print("1. Review the changes")
    print("2. Commit and push to GitHub")
    print("3. Verify deployment on Netlify")
    print("4. Resubmit sitemap to Google Search Console")

if __name__ == '__main__':
    main()