#!/usr/bin/env python3
"""
Add training resources section to tool collection pages
"""

import os

TOOL_PAGE_LINKS = {
    'heart-rate-tools.html': {
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'title': 'Complete Guide to Heart Rate Zones',
                'desc': 'Master all 5 heart rate zones for optimal training.'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'title': 'Zone 2 Training Complete Guide',
                'desc': 'Build your aerobic base with Zone 2 training.'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'title': 'Lactate Threshold Training',
                'desc': 'Improve race pace with threshold training.'
            }
        ]
    },
    'running-tools.html': {
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub',
        'blog_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'title': 'Complete Marathon Training Guide',
                'desc': '18-week plan from base building to race day.'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'title': 'Running Pace Training Guide',
                'desc': 'Master pace-based training for all distances.'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'title': '10K Training Plan',
                'desc': 'Complete 8-week plan for 10K success.'
            }
        ]
    },
    'cycling-tools.html': {
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub',
        'blog_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'title': 'Complete FTP Training Guide',
                'desc': 'Power-based training for cycling performance.'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'title': 'FTP Testing Guide',
                'desc': 'Accurately test your Functional Threshold Power.'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Why this ratio matters more than absolute power.'
            }
        ]
    },
    'vo2-tools.html': {
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub',
        'blog_posts': [
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'title': 'Complete VO2 Max Training Guide',
                'desc': 'Build maximum aerobic capacity with intervals.'
            },
            {
                'url': '/blog/vo2-max-training-methods.html',
                'title': '5 Proven VO2 Max Training Methods',
                'desc': 'Different protocols to maximize VO2 max.'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'title': 'Lactate Threshold Training',
                'desc': 'Combine threshold and VO2 max training.'
            }
        ]
    }
}


def create_training_resources_html(config):
    """Generate training resources section"""

    posts_html = []
    for post in config['blog_posts']:
        post_html = f'''
                    <a href="{post['url']}" class="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">{post['title']}</h4>
                        <p class="text-gray-600 text-sm">{post['desc']}</p>
                    </a>'''
        posts_html.append(post_html)

    section = f'''
        <!-- Training Resources Section -->
        <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-8 md:p-12 mb-16">
            <div class="text-center mb-8">
                <h2 class="text-3xl font-bold text-gray-900 mb-3">📚 Training Resources</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Learn how to use these calculators effectively with our comprehensive training guides</p>
            </div>

            <div class="grid md:grid-cols-3 gap-6 mb-8">
                {"".join(posts_html)}
            </div>

            <div class="text-center">
                <a href="{config['hub_url']}" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                    🗺️ Explore the {config['hub_title']} →
                </a>
                <p class="text-gray-600 text-sm mt-3">Access all related calculators, guides, and training plans in one place</p>
            </div>
        </div>
'''
    return section


def add_training_resources(filepath, config):
    """Add training resources section before footer"""

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has training resources
        if 'Training Resources Section' in content:
            print(f"✓ {os.path.basename(filepath)} already has training resources")
            return False

        # Generate HTML
        resources_section = create_training_resources_html(config)

        # Insert before footer or </main>
        if '    </main>' in content:
            content = content.replace('    </main>', f'{resources_section}\n    </main>')
        elif '    <!-- Footer -->' in content:
            content = content.replace('    <!-- Footer -->', f'{resources_section}\n\n    <!-- Footer -->')
        else:
            print(f"⚠️  {os.path.basename(filepath)} - No </main> or <!-- Footer --> found")
            return False

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Added training resources to {os.path.basename(filepath)}")
        return True

    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False


def main():
    tool_dir = '/Users/glengomezmeade/runbikecalc'

    updated_count = 0
    for tool_file, config in TOOL_PAGE_LINKS.items():
        filepath = os.path.join(tool_dir, tool_file)
        if os.path.exists(filepath):
            if add_training_resources(filepath, config):
                updated_count += 1

    print(f"\n🎉 Updated {updated_count} tool pages with training resources!")


if __name__ == '__main__':
    main()
