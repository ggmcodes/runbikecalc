#!/usr/bin/env python3
"""
Add 'Learn More' blog post sections to RunBikeCalc calculator pages
"""

import os
import re

# Calculator to blog post mappings
CALCULATOR_LINKS = {
    'heart-rate-zone-calculator.html': {
        'title': 'Master Heart Rate Training',
        'subtitle': 'Now that you know your zones, learn how to use them effectively',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'blue',
                'tag': 'START HERE',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Complete guide to training with all 5 heart rate zones for optimal performance.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'ZONE 2 GUIDE',
                'title': 'Complete Zone 2 Training Guide',
                'desc': 'Master aerobic base training with our comprehensive Zone 2 guide.',
                'time': '15 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'purple',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Apply heart rate training to marathon preparation for race day success.',
                'time': '18 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'ADVANCED',
                'title': 'Lactate Threshold Training',
                'desc': 'Improve race pace with lactate threshold training methods.',
                'time': '12 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'running-pace-calculator.html': {
        'title': 'Master Pace Training',
        'subtitle': 'Learn how to use pace and heart rate together for optimal running',
        'blog_posts': [
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'blue',
                'tag': 'PACE GUIDE',
                'title': 'Running Pace Training Guide',
                'desc': 'Complete guide to pace-based training for runners of all levels.',
                'time': '11 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Use pace training for marathon preparation from base to race day.',
                'time': '18 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'purple',
                'tag': 'HALF MARATHON',
                'title': 'Half Marathon Training',
                'desc': 'Complete 12-week half marathon plan with pace training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Combine pace and heart rate training for maximum effectiveness.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'ftp-calculator.html': {
        'title': 'Master FTP Training',
        'subtitle': 'Learn how to use your FTP for structured cycling training',
        'blog_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP GUIDE',
                'title': 'Complete FTP Training Guide',
                'desc': 'Comprehensive guide to power-based training for cyclists.',
                'time': '12 min read'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Best methods for accurately testing your Functional Threshold Power.',
                'time': '7 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Why power-to-weight ratio matters more than absolute FTP.',
                'time': '6 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'green',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Combine FTP training with weight loss for peak performance.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'vo2-max-calculator.html': {
        'title': 'Master VO2 Max Training',
        'subtitle': 'Build your aerobic engine with structured high-intensity training',
        'blog_posts': [
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'VO2 MAX GUIDE',
                'title': 'Complete VO2 Max Training Guide',
                'desc': 'Science-backed methods to improve your maximum aerobic capacity.',
                'time': '10 min read'
            },
            {
                'url': '/blog/vo2-max-training-methods.html',
                'emoji': '🎯',
                'color': 'red',
                'tag': 'METHODS',
                'title': '5 Proven VO2 Max Methods',
                'desc': 'Different interval protocols to boost aerobic power.',
                'time': '9 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base before focusing on VO2 max training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'blue',
                'tag': 'TRAINING ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Understand Zone 5 training for VO2 max development.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'lactate-threshold-calculator.html': {
        'title': 'Master Lactate Threshold Training',
        'subtitle': 'Now that you know your threshold, learn how to train at it effectively',
        'blog_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'COMPLETE GUIDE',
                'title': 'Lactate Threshold Training Guide',
                'desc': 'Comprehensive guide to improving your sustainable race pace.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ZONE 4',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Understand Zone 4 threshold training within the heart rate system.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE FIRST',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your aerobic foundation before threshold training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Apply lactate threshold training to marathon preparation.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'calories-burned-running-calculator.html': {
        'title': 'Maximize Your Running Results',
        'subtitle': 'Learn how to optimize calorie burn and training effectiveness',
        'blog_posts': [
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'How to Lose Weight Running',
                'desc': 'Complete guide to using running for sustainable weight loss.',
                'time': '13 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'FAT BURNING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Master Zone 2 training for optimal fat burning and endurance.',
                'time': '15 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'TRAINING',
                'title': 'Marathon Training Guide',
                'desc': 'Build endurance and burn calories with marathon training.',
                'time': '18 min read'
            },
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '👟',
                'color': 'purple',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Start your running journey with proper guidance and technique.',
                'time': '16 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'advanced-heart-rate-zones-calculator.html': {
        'title': 'Advanced Heart Rate Training',
        'subtitle': 'Take your training to the next level with precision heart rate zones',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'COMPLETE GUIDE',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Master all 5 heart rate training zones for optimal performance.',
                'time': '8 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Advanced Zone 4 training to improve race pace.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'VO2 MAX',
                'title': 'VO2 Max Training Guide',
                'desc': 'Develop maximum aerobic capacity with Zone 5 training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training Guide',
                'desc': 'Apply advanced heart rate training to marathon prep.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'cooper-test-calculator.html': {
        'title': 'Improve Your Fitness Level',
        'subtitle': 'Use your Cooper test results to build a better training plan',
        'blog_posts': [
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'VO2 MAX',
                'title': 'VO2 Max Training Guide',
                'desc': 'Improve your Cooper test score with VO2 max training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base to improve your 12-minute run distance.',
                'time': '15 min read'
            },
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Start your running fitness journey with proper guidance.',
                'time': '16 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'TRAINING ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Train smarter with heart rate zone guidance.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'ftp-improvement-calculator.html': {
        'title': 'Boost Your Cycling Power',
        'subtitle': 'Learn proven methods to increase your FTP systematically',
        'blog_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'Complete FTP Training Guide',
                'desc': 'Structured training plans to systematically improve your FTP.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base for long-term FTP improvement.',
                'time': '15 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Improve FTP and optimize your power-to-weight ratio.',
                'time': '6 min read'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Accurately test your FTP to track improvement over time.',
                'time': '7 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'max-heart-rate-calculator.html': {
        'title': 'Master Heart Rate Training',
        'subtitle': 'Now that you know your max heart rate, learn how to train with zones',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'TRAINING ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Use your max HR to calculate and train in all 5 heart rate zones.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Master aerobic base training with proper heart rate guidance.',
                'time': '15 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Improve race pace with Zone 4 threshold training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training Guide',
                'desc': 'Apply heart rate zones to marathon training.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'mhr-karvonen-calculator.html': {
        'title': 'Advanced Heart Rate Training',
        'subtitle': 'Use the Karvonen formula for more accurate training zones',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'COMPLETE GUIDE',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Complete guide to all 5 heart rate zones using Karvonen method.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'ZONE 2',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base with accurate heart rate reserve zones.',
                'time': '15 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training Guide',
                'desc': 'Train at maximum intensity with precise heart rate guidance.',
                'time': '10 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Perfect your threshold training with accurate zones.',
                'time': '12 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'power-to-weight-ratio-calculator.html': {
        'title': 'Optimize Cycling Performance',
        'subtitle': 'Learn how to improve your power-to-weight ratio for climbing and racing',
        'blog_posts': [
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'COMPLETE GUIDE',
                'title': 'Power-to-Weight Ratio Guide',
                'desc': 'Comprehensive guide to understanding and improving your ratio.',
                'time': '6 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Increase your power output with structured FTP training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'green',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Improve your ratio by optimizing body composition.',
                'time': '10 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'blue',
                'tag': 'ENDURANCE',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build sustainable power with aerobic base training.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'race-pace-calculator.html': {
        'title': 'Perfect Your Race Strategy',
        'subtitle': 'Learn how to pace your races for optimal performance',
        'blog_posts': [
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'blue',
                'tag': 'PACE TRAINING',
                'title': 'Running Pace Training Guide',
                'desc': 'Master pace-based training for race day success.',
                'time': '11 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Complete guide to pacing your marathon training and race.',
                'time': '18 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'purple',
                'tag': 'HALF MARATHON',
                'title': 'Half Marathon Training',
                'desc': 'Perfect half marathon pacing strategies and training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR + PACE',
                'title': 'Heart Rate Zones',
                'desc': 'Combine pace and heart rate for optimal race pacing.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'lthr-zone-calculator.html': {
        'title': 'Master Threshold Training',
        'subtitle': 'Use your LTHR to train at the perfect intensity for performance gains',
        'blog_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'COMPLETE GUIDE',
                'title': 'Lactate Threshold Training Guide',
                'desc': 'Complete guide to training at and improving your threshold.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ALL ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Understand LTHR within the complete heart rate system.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE FIRST',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base before focusing on threshold work.',
                'time': '15 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'MAX POWER',
                'title': 'VO2 Max Training Guide',
                'desc': 'Combine threshold and VO2 max training for complete fitness.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'run-walk-calculator.html': {
        'title': 'Master the Run-Walk Method',
        'subtitle': 'Learn how to use run-walk intervals for better performance and recovery',
        'blog_posts': [
            {
                'url': '/blog/run-walk-method-beginners.html',
                'emoji': '🚶',
                'color': 'purple',
                'tag': 'METHOD GUIDE',
                'title': 'Run-Walk Method for Beginners',
                'desc': 'Complete guide to run-walk training for all fitness levels.',
                'time': '7 min read'
            },
            {
                'url': '/blog/couch-to-5k-complete-guide-2025.html',
                'emoji': '👟',
                'color': 'green',
                'tag': 'C25K',
                'title': 'Couch to 5K Guide',
                'desc': 'Perfect run-walk structured plan for beginners.',
                'time': '12 min read'
            },
            {
                'url': '/blog/5k-to-10k-progression-guide.html',
                'emoji': '📈',
                'color': 'blue',
                'tag': 'PROGRESSION',
                'title': '5K to 10K Progression',
                'desc': 'Use run-walk to safely progress to longer distances.',
                'time': '9 min read'
            },
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '🏃',
                'color': 'orange',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Complete beginner guide including run-walk strategies.',
                'time': '16 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'pace-converter-calculator.html': {
        'title': 'Master Pace Training',
        'subtitle': 'Learn how to use different pace metrics for better training',
        'blog_posts': [
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'blue',
                'tag': 'PACE GUIDE',
                'title': 'Running Pace Training Guide',
                'desc': 'Complete guide to pace-based training for all distances.',
                'time': '11 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Use pace training for marathon success.',
                'time': '18 min read'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': '10K TRAINING',
                'title': '10K Training Plan',
                'desc': 'Master pace training for 10K races.',
                'time': '10 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR + PACE',
                'title': 'Heart Rate Zones',
                'desc': 'Combine pace and heart rate for optimal training.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'zone-2-calculator.html': {
        'title': 'Master Zone 2 Training',
        'subtitle': 'Build your aerobic base with the most important training zone',
        'blog_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'COMPLETE GUIDE',
                'title': 'Complete Zone 2 Training Guide',
                'desc': 'Deep dive into Zone 2 - the foundation of endurance training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ALL ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Understand Zone 2 within the complete 5-zone system.',
                'time': '8 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training Guide',
                'desc': 'Apply Zone 2 training to marathon preparation.',
                'time': '18 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Zone 2 training for optimal fat burning.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'target-heart-rate-calculator.html': {
        'title': 'Train at the Right Intensity',
        'subtitle': 'Learn how to use target heart rate zones for optimal training',
        'blog_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Complete guide to training with all 5 heart rate zones.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'ZONE 2',
                'title': 'Zone 2 Training Guide',
                'desc': 'Master the most important training zone for endurance.',
                'time': '15 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Train at threshold with precise heart rate guidance.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training',
                'desc': 'High-intensity training with target heart rates.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'treadmill-pace-calculator.html': {
        'title': 'Master Treadmill Training',
        'subtitle': 'Learn how to train effectively on the treadmill',
        'blog_posts': [
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'blue',
                'tag': 'PACE TRAINING',
                'title': 'Running Pace Training Guide',
                'desc': 'Apply pace training principles to treadmill workouts.',
                'time': '11 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Use treadmill training for marathon preparation.',
                'time': '18 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Combine pace and heart rate on the treadmill.',
                'time': '8 min read'
            },
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Lose Weight Running',
                'desc': 'Effective treadmill workouts for weight loss.',
                'time': '13 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'recovery-calculator.html': {
        'title': 'Optimize Your Recovery',
        'subtitle': 'Learn how to balance training and recovery for maximum progress',
        'blog_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'ACTIVE RECOVERY',
                'title': 'Zone 2 Training Guide',
                'desc': 'Use Zone 2 for active recovery between hard sessions.',
                'time': '15 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'TRAINING',
                'title': 'Marathon Training Guide',
                'desc': 'Balance hard training with proper recovery strategies.',
                'time': '18 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'CYCLING',
                'title': 'FTP Training Guide',
                'desc': 'Recovery strategies for power-based training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training',
                'desc': 'Recovery protocols for high-intensity training.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'aerobic-anaerobic-calculator.html': {
        'title': 'Understand Your Energy Systems',
        'subtitle': 'Learn how to train both aerobic and anaerobic systems effectively',
        'blog_posts': [
            {
                'url': '/blog/aerobic-vs-anaerobic-training.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'ENERGY SYSTEMS',
                'title': 'Aerobic vs Anaerobic Training',
                'desc': 'Complete guide to both energy systems and how to train them.',
                'time': '10 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'AEROBIC',
                'title': 'Zone 2 Training Guide',
                'desc': 'Master aerobic training with Zone 2 endurance work.',
                'time': '15 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'red',
                'tag': 'ANAEROBIC',
                'title': 'VO2 Max Training',
                'desc': 'Develop anaerobic capacity with high-intensity training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'blue',
                'tag': 'ALL ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Train both systems with the complete zone system.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'bike-gearing-calculator.html': {
        'title': 'Optimize Your Cycling Performance',
        'subtitle': 'Learn how gear selection affects your training and racing',
        'blog_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'POWER TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Use optimal gearing for power-based training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'green',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Choose the right gears for fat-burning workouts.',
                'time': '10 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Optimize gear selection for climbing and racing.',
                'time': '6 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'blue',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training',
                'desc': 'Find the perfect cadence and gearing for Zone 2 rides.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'cadence-speed-calculator.html': {
        'title': 'Perfect Your Cycling Cadence',
        'subtitle': 'Learn how to optimize cadence for different training goals',
        'blog_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Maintain optimal cadence during FTP intervals.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'ZONE 2',
                'title': 'Zone 2 Training Guide',
                'desc': 'Find your ideal Zone 2 cadence for aerobic development.',
                'time': '15 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'EFFICIENCY',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Optimize cadence for maximum power efficiency.',
                'time': '6 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'blue',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Best cadence strategies for fat burning.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'bmi-calculator.html': {
        'title': 'Optimize Your Health & Performance',
        'subtitle': 'Learn how body composition affects training and racing',
        'blog_posts': [
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'How to Lose Weight Running',
                'desc': 'Achieve your optimal weight through running.',
                'time': '13 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '🚴',
                'color': 'green',
                'tag': 'CYCLING',
                'title': 'Cycling for Weight Loss',
                'desc': 'Lose weight effectively with cycling training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'How body weight directly impacts cycling performance.',
                'time': '6 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training',
                'desc': 'Optimize weight for marathon performance.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'training-load-calculator.html': {
        'title': 'Balance Training & Recovery',
        'subtitle': 'Learn how to optimize training load for maximum progress',
        'blog_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Manage training load through marathon preparation.',
                'time': '18 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Balance high-intensity FTP work with recovery.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training',
                'desc': 'Manage training load during intense intervals.',
                'time': '10 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'RECOVERY',
                'title': 'Zone 2 Training',
                'desc': 'Use Zone 2 for active recovery and load management.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'watts-to-calories-calculator.html': {
        'title': 'Understand Energy Expenditure',
        'subtitle': 'Learn how power output relates to calorie burn and training',
        'blog_posts': [
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'green',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Use power-based calorie tracking for weight loss.',
                'time': '10 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Understand energy demands of FTP training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'blue',
                'tag': 'FAT BURNING',
                'title': 'Zone 2 Training',
                'desc': 'Optimize fat burning with power-based Zone 2 training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Balance power output with body weight for performance.',
                'time': '6 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'km-to-miles-calculator.html': {
        'title': 'Master Distance Conversions',
        'subtitle': 'Learn how to use both metric and imperial systems for training',
        'blog_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Train for 42.2km (26.2 miles) with our complete guide.',
                'time': '18 min read'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'green',
                'tag': 'PACE TRAINING',
                'title': 'Running Pace Training',
                'desc': 'Master pace training in kilometers or miles per hour.',
                'time': '11 min read'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': '10K',
                'title': '10K Training Plan',
                'desc': 'Complete 10 kilometer (6.2 mile) training program.',
                'time': '10 min read'
            },
            {
                'url': '/blog/5k-to-10k-progression-guide.html',
                'emoji': '📈',
                'color': 'orange',
                'tag': 'PROGRESSION',
                'title': '5K to 10K Progression',
                'desc': 'Progress from 5km to 10km with structured training.',
                'time': '9 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'sweat-test-calculator.html': {
        'title': 'Optimize Hydration Strategy',
        'subtitle': 'Learn how to calculate and implement proper hydration for training',
        'blog_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Hydration strategies for marathon distance training and racing.',
                'time': '18 min read'
            },
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Lose Weight Running',
                'desc': 'Proper hydration for weight loss and performance.',
                'time': '13 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'green',
                'tag': 'CYCLING',
                'title': 'FTP Training Guide',
                'desc': 'Hydration during intense cycling training sessions.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training',
                'desc': 'Stay hydrated during high-intensity interval training.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    }
}


def create_learn_more_html(calc_file, config):
    """Generate the Learn More section HTML"""

    posts_html = []
    for post in config['blog_posts']:
        post_html = f'''
            <a href="{post['url']}" class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-{post['color']}-500">
                <div class="flex items-start">
                    <div class="flex-shrink-0 mr-4">
                        <div class="h-12 w-12 bg-{post['color']}-100 rounded-lg flex items-center justify-center">
                            <span class="text-2xl">{post['emoji']}</span>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-{post['color']}-600 font-semibold mb-1">{post['tag']}</div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{post['title']}</h3>
                        <p class="text-gray-600 text-sm mb-3">{post['desc']}</p>
                        <div class="flex items-center text-xs text-gray-500">
                            <span>{post['time']}</span>
                        </div>
                    </div>
                </div>
            </a>'''
        posts_html.append(post_html)

    section = f'''
    <!-- Learn More Section -->
    <section class="mt-12 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-8 border border-blue-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">📚 {config['title']}</h2>
        <p class="text-gray-600 mb-6">{config['subtitle']}</p>

        <div class="grid md:grid-cols-2 gap-6">
            {"".join(posts_html)}
        </div>

        <!-- Training Hub CTA -->
        <div class="mt-6 bg-white rounded-lg p-6 border-2 border-blue-300">
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="mb-4 md:mb-0">
                    <h3 class="text-lg font-semibold text-gray-900 mb-1">🗺️ Explore the {config['hub_title']}</h3>
                    <p class="text-gray-600 text-sm">Access all related calculators, guides, and training plans in one place.</p>
                </div>
                <a href="{config['hub_url']}" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg whitespace-nowrap">
                    Visit {config['hub_title']} →
                </a>
            </div>
        </div>
    </section>
'''
    return section


def add_learn_more_to_calculator(filepath, config):
    """Add Learn More section before </main> or <footer> tag"""

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has Learn More section
        if 'Learn More Section' in content or config['title'] in content:
            print(f"✓ {os.path.basename(filepath)} already has Learn More section")
            return False

        # Generate the Learn More HTML
        learn_more_section = create_learn_more_html(filepath, config)

        # Insert before </main> or <footer>
        if '    </main>' in content:
            content = content.replace('    </main>', f'{learn_more_section}\n\n    </main>')
        elif '<footer' in content:
            content = content.replace('    <footer', f'{learn_more_section}\n\n    <footer')
        else:
            print(f"⚠️  {os.path.basename(filepath)} - No </main> or <footer> tag found")
            return False

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Added Learn More section to {os.path.basename(filepath)}")
        return True

    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False


def main():
    calc_dir = '/Users/glengomezmeade/runbikecalc'

    updated_count = 0
    for calc_file, config in CALCULATOR_LINKS.items():
        filepath = os.path.join(calc_dir, calc_file)
        if os.path.exists(filepath):
            if add_learn_more_to_calculator(filepath, config):
                updated_count += 1

    print(f"\n🎉 Updated {updated_count} calculator pages with Learn More sections!")


if __name__ == '__main__':
    main()
