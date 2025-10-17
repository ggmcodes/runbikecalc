#!/usr/bin/env python3
"""
Add comprehensive internal linking to RunBikeCalc blog posts
"""

import os
import re

# Blog post internal linking mappings
BLOG_LINKS = {
    'heart-rate-zones-running.html': {
        'related_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'FOUNDATIONAL',
                'title': 'Complete Guide to Zone 2 Training',
                'desc': 'Deep dive into Zone 2 training, the foundation of your heart rate training system.',
                'time': '15 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'ADVANCED',
                'title': 'Lactate Threshold Training Guide',
                'desc': 'Master Zone 4 training to improve your sustainable race pace and performance.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'MAX PERFORMANCE',
                'title': 'VO2 Max Training Guide',
                'desc': 'Build top-end aerobic power with structured Zone 5 intervals and protocols.',
                'time': '10 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training Guide',
                'desc': 'Apply heart rate zones to marathon training for optimal race day performance.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'marathon-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'INTENSITY ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Master all 5 heart rate zones to structure your marathon training effectively.',
                'time': '8 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'blue',
                'tag': 'HALF MARATHON',
                'title': 'Half Marathon Training Guide',
                'desc': 'Perfect stepping stone to the full marathon with a complete 12-week plan.',
                'time': '12 min read'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'purple',
                'tag': 'PACE STRATEGY',
                'title': 'Running Pace Training Guide',
                'desc': 'Learn how to calculate and train at the right paces for marathon success.',
                'time': '11 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE BUILDING',
                'title': 'Complete Zone 2 Training Guide',
                'desc': 'Build your aerobic base with Zone 2 training - the foundation of marathon fitness.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'ftp-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'FTP TESTING',
                'title': 'FTP Testing Guide for Cyclists',
                'desc': 'Learn the best methods for accurately testing your Functional Threshold Power.',
                'time': '7 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio Guide',
                'desc': 'Understand why power-to-weight ratio matters more than absolute FTP.',
                'time': '6 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'AEROBIC BASE',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your endurance foundation with Zone 2 training for better FTP.',
                'time': '15 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Combine FTP training with weight loss strategies for maximum performance.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'half-marathon-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'NEXT STEP',
                'title': 'Full Marathon Training Guide',
                'desc': 'Ready for the next challenge? Complete guide to training for your first marathon.',
                'time': '18 min read'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BUILD UP',
                'title': '10K Training Plan',
                'desc': 'Perfect preparation before tackling the half marathon distance.',
                'time': '10 min read'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'purple',
                'tag': 'PACE STRATEGY',
                'title': 'Running Pace Training Guide',
                'desc': 'Master pace training to optimize your half marathon performance.',
                'time': '11 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'TRAINING ZONES',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Use heart rate zones to structure your half marathon training effectively.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'lactate-threshold-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ZONE 4',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Understand Zone 4 (threshold zone) within the complete heart rate system.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your aerobic base before focusing on threshold training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'NEXT LEVEL',
                'title': 'VO2 Max Training Guide',
                'desc': 'After mastering threshold, develop top-end aerobic power.',
                'time': '10 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training Guide',
                'desc': 'Apply lactate threshold training to your marathon preparation.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'vo2-max-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/vo2-max-training-methods.html',
                'emoji': '🎯',
                'color': 'red',
                'tag': 'METHODS',
                'title': '5 Proven VO2 Max Training Methods',
                'desc': 'Different interval protocols to maximize your VO2 max development.',
                'time': '9 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🏃',
                'color': 'green',
                'tag': 'BASE FIRST',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your aerobic foundation before starting VO2 max intervals.',
                'time': '15 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Balance VO2 max work with threshold training for complete fitness.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'blue',
                'tag': 'ZONE 5',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Master Zone 5 training within the complete heart rate system.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'running-pace-training-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide',
                'desc': 'Apply pace training principles to your marathon preparation.',
                'time': '18 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'green',
                'tag': 'HALF MARATHON',
                'title': 'Half Marathon Training Guide',
                'desc': 'Use pace training for half marathon success with our complete plan.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR + PACE',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Combine pace and heart rate training for maximum effectiveness.',
                'time': '8 min read'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': '10K TRAINING',
                'title': '10K Training Plan',
                'desc': 'Perfect distance to master pace training principles.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'ftp-testing-guide-cyclists.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'Complete FTP Training Guide',
                'desc': 'Now that you know your FTP, learn how to train with it effectively.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-ftp-beginner-guide.html',
                'emoji': '📚',
                'color': 'blue',
                'tag': 'BEGINNER',
                'title': 'What is FTP? Beginner Guide',
                'desc': 'Complete introduction to Functional Threshold Power for new cyclists.',
                'time': '8 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio Guide',
                'desc': 'Why your FTP relative to weight matters more than absolute power.',
                'time': '6 min read'
            },
            {
                'url': '/blog/ftp-calculator-vs-zwift-vs-trainerroad.html',
                'emoji': '⚙️',
                'color': 'green',
                'tag': 'TOOLS',
                'title': 'FTP Calculator Comparison',
                'desc': 'Compare different FTP testing methods and platforms.',
                'time': '7 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'power-to-weight-ratio-cycling.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'FTP TRAINING',
                'title': 'Complete FTP Training Guide',
                'desc': 'Improve both your FTP and power-to-weight ratio with structured training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '💪',
                'color': 'green',
                'tag': 'WEIGHT LOSS',
                'title': 'Cycling for Weight Loss',
                'desc': 'Boost your power-to-weight ratio through strategic weight management.',
                'time': '10 min read'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Accurately test your FTP to track power-to-weight improvements.',
                'time': '7 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic efficiency to improve your sustainable power output.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'cycling-for-weight-loss-2025.html': {
        'related_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'FAT BURNING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Master Zone 2 training for optimal fat burning and weight loss.',
                'time': '15 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'PERFORMANCE',
                'title': 'FTP Training Guide',
                'desc': 'Maintain and improve cycling performance while losing weight.',
                'time': '12 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'POWER/WEIGHT',
                'title': 'Power-to-Weight Ratio',
                'desc': 'See how weight loss directly improves your cycling performance.',
                'time': '6 min read'
            },
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'RUNNING',
                'title': 'Weight Loss Through Running',
                'desc': 'Combine cycling and running for maximum weight loss results.',
                'time': '13 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'how-to-lose-weight-running-2025.html': {
        'related_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'FAT BURNING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Maximize fat burning with strategic Zone 2 training for weight loss.',
                'time': '15 min read'
            },
            {
                'url': '/blog/couch-to-5k-complete-guide-2025.html',
                'emoji': '👟',
                'color': 'blue',
                'tag': 'START HERE',
                'title': 'Couch to 5K Guide',
                'desc': 'Perfect starting point for beginners looking to lose weight through running.',
                'time': '12 min read'
            },
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '🏃',
                'color': 'purple',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Complete guide to starting your running journey for weight loss.',
                'time': '16 min read'
            },
            {
                'url': '/blog/cycling-for-weight-loss-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'CYCLING',
                'title': 'Cycling for Weight Loss',
                'desc': 'Cross-train with cycling for enhanced weight loss results.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    '10k-training-plan-2025.html': {
        'related_posts': [
            {
                'url': '/blog/5k-to-10k-progression-guide.html',
                'emoji': '📈',
                'color': 'green',
                'tag': 'PROGRESSION',
                'title': '5K to 10K Progression Guide',
                'desc': 'Safe and effective progression from 5K to 10K distance.',
                'time': '9 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'blue',
                'tag': 'NEXT STEP',
                'title': 'Half Marathon Training',
                'desc': 'Ready for the next challenge? Progress to half marathon training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'purple',
                'tag': 'PACE',
                'title': 'Running Pace Training',
                'desc': 'Master pace training to optimize your 10K performance.',
                'time': '11 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HEART RATE',
                'title': 'Heart Rate Zones',
                'desc': 'Use heart rate zones to structure your 10K training plan.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'couch-to-5k-complete-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Comprehensive guide covering everything beginners need to know.',
                'time': '16 min read'
            },
            {
                'url': '/blog/5k-to-10k-progression-guide.html',
                'emoji': '📈',
                'color': 'green',
                'tag': 'NEXT STEP',
                'title': '5K to 10K Progression',
                'desc': 'After completing C25K, progress safely to 10K with this guide.',
                'time': '9 min read'
            },
            {
                'url': '/blog/run-walk-method-beginners.html',
                'emoji': '🚶',
                'color': 'purple',
                'tag': 'METHOD',
                'title': 'Run-Walk Method',
                'desc': 'Master the run-walk strategy perfect for Couch to 5K training.',
                'time': '7 min read'
            },
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Lose Weight Running',
                'desc': 'Use C25K as your foundation for a weight loss journey.',
                'time': '13 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'running-for-beginners-ultimate-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/couch-to-5k-complete-guide-2025.html',
                'emoji': '👟',
                'color': 'green',
                'tag': 'START RUNNING',
                'title': 'Couch to 5K Guide',
                'desc': 'Structured 8-week plan to get you running your first 5K.',
                'time': '12 min read'
            },
            {
                'url': '/blog/run-walk-method-beginners.html',
                'emoji': '🚶',
                'color': 'blue',
                'tag': 'TECHNIQUE',
                'title': 'Run-Walk Method',
                'desc': 'Perfect beginner-friendly approach to building running fitness.',
                'time': '7 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'TRAINING',
                'title': 'Heart Rate Zones',
                'desc': 'Learn to train smarter with heart rate zone training.',
                'time': '8 min read'
            },
            {
                'url': '/blog/best-running-shoes-2025.html',
                'emoji': '👟',
                'color': 'purple',
                'tag': 'GEAR',
                'title': 'Best Running Shoes 2025',
                'desc': 'Find the perfect shoes to start your running journey right.',
                'time': '14 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'vo2-max-training-methods.html': {
        'related_posts': [
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'COMPLETE GUIDE',
                'title': 'Complete VO2 Max Training Guide',
                'desc': 'Comprehensive guide to understanding and implementing VO2 max training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Balance VO2 max intervals with threshold training for complete fitness.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your aerobic foundation before starting VO2 max intervals.',
                'time': '15 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'blue',
                'tag': 'ZONE 5',
                'title': 'Heart Rate Zones',
                'desc': 'Understand Zone 5 training within the complete heart rate system.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'what-is-ftp-beginner-guide.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Learn how to accurately test your Functional Threshold Power.',
                'time': '7 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Complete guide to training with power for cycling performance.',
                'time': '12 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Why FTP relative to weight matters more than absolute power.',
                'time': '6 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build your aerobic base - the foundation of cycling fitness.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    '5k-to-10k-progression-guide.html': {
        'related_posts': [
            {
                'url': '/blog/couch-to-5k-complete-guide-2025.html',
                'emoji': '👟',
                'color': 'green',
                'tag': 'START HERE',
                'title': 'Couch to 5K Guide',
                'desc': 'Begin with C25K before progressing to 10K distance.',
                'time': '12 min read'
            },
            {
                'url': '/blog/10k-training-plan-2025.html',
                'emoji': '🎯',
                'color': 'blue',
                'tag': '10K PLAN',
                'title': '10K Training Plan',
                'desc': 'Complete 10K training plan with weekly structure and progression.',
                'time': '10 min read'
            },
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'purple',
                'tag': 'PACE',
                'title': 'Running Pace Training',
                'desc': 'Master pace training as you progress to longer distances.',
                'time': '11 min read'
            },
            {
                'url': '/blog/run-walk-method-beginners.html',
                'emoji': '🚶',
                'color': 'orange',
                'tag': 'METHOD',
                'title': 'Run-Walk Method',
                'desc': 'Use run-walk intervals to safely build up to 10K.',
                'time': '7 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'aerobic-vs-anaerobic-training.html': {
        'related_posts': [
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'AEROBIC',
                'title': 'Zone 2 Training Guide',
                'desc': 'Deep dive into aerobic training with Zone 2 endurance work.',
                'time': '15 min read'
            },
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'THRESHOLD',
                'title': 'Lactate Threshold Training',
                'desc': 'Master the transition zone between aerobic and anaerobic.',
                'time': '12 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'ANAEROBIC',
                'title': 'VO2 Max Training Guide',
                'desc': 'Develop anaerobic capacity with high-intensity interval training.',
                'time': '10 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ALL ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Understand all 5 heart rate zones from aerobic to anaerobic.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'run-walk-method-beginners.html': {
        'related_posts': [
            {
                'url': '/blog/couch-to-5k-complete-guide-2025.html',
                'emoji': '👟',
                'color': 'green',
                'tag': 'C25K',
                'title': 'Couch to 5K Guide',
                'desc': 'Perfect run-walk structured plan for complete beginners.',
                'time': '12 min read'
            },
            {
                'url': '/blog/running-for-beginners-ultimate-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'BEGINNER',
                'title': 'Running for Beginners',
                'desc': 'Complete beginner guide covering all fundamentals.',
                'time': '16 min read'
            },
            {
                'url': '/blog/5k-to-10k-progression-guide.html',
                'emoji': '📈',
                'color': 'purple',
                'tag': 'NEXT STEP',
                'title': '5K to 10K Progression',
                'desc': 'Use run-walk method to safely progress to 10K.',
                'time': '9 min read'
            },
            {
                'url': '/blog/how-to-lose-weight-running-2025.html',
                'emoji': '💪',
                'color': 'orange',
                'tag': 'WEIGHT LOSS',
                'title': 'Lose Weight Running',
                'desc': 'Run-walk method is perfect for weight loss goals.',
                'time': '13 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'first-marathon-training-complete-guide.html': {
        'related_posts': [
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'MARATHON',
                'title': 'Marathon Training Guide 2025',
                'desc': 'Comprehensive marathon training with latest science and strategies.',
                'time': '18 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'green',
                'tag': 'BUILD UP',
                'title': 'Half Marathon Training',
                'desc': 'Start with a half marathon before tackling your first full.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'TRAINING ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Use heart rate zones to pace your marathon training properly.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': 'BASE BUILDING',
                'title': 'Zone 2 Training',
                'desc': 'Build your aerobic base - crucial for first-time marathoners.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'how-to-calculate-running-pace-for-marathon-training.html': {
        'related_posts': [
            {
                'url': '/blog/running-pace-training-guide-2025.html',
                'emoji': '⏱️',
                'color': 'blue',
                'tag': 'PACE TRAINING',
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
                'desc': 'Apply pace calculations to comprehensive marathon training.',
                'time': '18 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR + PACE',
                'title': 'Heart Rate Zones',
                'desc': 'Combine pace and heart rate training for best results.',
                'time': '8 min read'
            },
            {
                'url': '/blog/half-marathon-training-guide-2025.html',
                'emoji': '🏃‍♂️',
                'color': 'purple',
                'tag': 'HALF MARATHON',
                'title': 'Half Marathon Training',
                'desc': 'Practice pace strategies on the half marathon distance.',
                'time': '12 min read'
            }
        ],
        'hub_url': '/marathon-training-hub.html',
        'hub_title': 'Marathon Training Hub'
    },

    'how-to-increase-lactate-threshold.html': {
        'related_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'COMPLETE GUIDE',
                'title': 'Lactate Threshold Training Guide',
                'desc': 'Comprehensive guide with proven methods to increase threshold.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ZONE 4',
                'title': 'Heart Rate Zones for Running',
                'desc': 'Understand Zone 4 training for threshold improvement.',
                'time': '8 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE FIRST',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic foundation before threshold work.',
                'time': '15 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'HIGH INTENSITY',
                'title': 'VO2 Max Training Guide',
                'desc': 'Combine threshold and VO2 max for complete fitness.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'ftp-test-week-by-week-training-plan-2025.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Learn all FTP testing methods and protocols.',
                'time': '7 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'FTP Training Guide',
                'desc': 'Train systematically after testing to improve FTP.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-ftp-beginner-guide.html',
                'emoji': '📚',
                'color': 'green',
                'tag': 'BEGINNER',
                'title': 'What is FTP?',
                'desc': 'Complete introduction to Functional Threshold Power.',
                'time': '8 min read'
            },
            {
                'url': '/blog/couch-to-20-min-ftp-test.html',
                'emoji': '🚴‍♂️',
                'color': 'purple',
                'tag': 'BEGINNER',
                'title': 'Couch to 20-Min FTP Test',
                'desc': 'Build fitness to complete your first FTP test.',
                'time': '9 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'couch-to-20-min-ftp-test.html': {
        'related_posts': [
            {
                'url': '/blog/what-is-ftp-beginner-guide.html',
                'emoji': '📚',
                'color': 'green',
                'tag': 'START HERE',
                'title': 'What is FTP? Beginner Guide',
                'desc': 'Understand FTP basics before starting your training.',
                'time': '8 min read'
            },
            {
                'url': '/blog/ftp-test-week-by-week-training-plan-2025.html',
                'emoji': '📅',
                'color': 'blue',
                'tag': 'TRAINING PLAN',
                'title': 'FTP Test Training Plan',
                'desc': 'Week-by-week plan to prepare for FTP testing.',
                'time': '11 min read'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'orange',
                'tag': 'TESTING',
                'title': 'FTP Testing Guide',
                'desc': 'Master the 20-minute FTP test protocol.',
                'time': '7 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'purple',
                'tag': 'BASE TRAINING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build aerobic base for cycling fitness.',
                'time': '15 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'why-your-ftp-dropped.html': {
        'related_posts': [
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'orange',
                'tag': 'REBUILD',
                'title': 'FTP Training Guide',
                'desc': 'Structured training to rebuild and improve your FTP.',
                'time': '12 min read'
            },
            {
                'url': '/blog/ftp-testing-guide-cyclists.html',
                'emoji': '🧪',
                'color': 'blue',
                'tag': 'RETEST',
                'title': 'FTP Testing Guide',
                'desc': 'Accurate testing methods to track your progress.',
                'time': '7 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'BASE BUILDING',
                'title': 'Zone 2 Training Guide',
                'desc': 'Rebuild aerobic foundation with Zone 2 training.',
                'time': '15 min read'
            },
            {
                'url': '/blog/power-to-weight-ratio-cycling.html',
                'emoji': '⚖️',
                'color': 'purple',
                'tag': 'PERFORMANCE',
                'title': 'Power-to-Weight Ratio',
                'desc': 'Focus on ratio improvement, not just absolute FTP.',
                'time': '6 min read'
            }
        ],
        'hub_url': '/cycling-power-hub.html',
        'hub_title': 'Cycling Power Training Hub'
    },

    'lactate-threshold-training-triathletes.html': {
        'related_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'COMPLETE GUIDE',
                'title': 'Lactate Threshold Training',
                'desc': 'Complete threshold training guide for all endurance athletes.',
                'time': '12 min read'
            },
            {
                'url': '/blog/ftp-training-guide-2025.html',
                'emoji': '🚴',
                'color': 'blue',
                'tag': 'CYCLING',
                'title': 'FTP Training Guide',
                'desc': 'Threshold training for the cycling leg of triathlons.',
                'time': '12 min read'
            },
            {
                'url': '/blog/what-is-zone-2-training-complete-guide.html',
                'emoji': '🎯',
                'color': 'green',
                'tag': 'AEROBIC BASE',
                'title': 'Zone 2 Training Guide',
                'desc': 'Build the aerobic base needed for triathlon success.',
                'time': '15 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'RUNNING',
                'title': 'Heart Rate Zones',
                'desc': 'Zone 4 training for the run leg of triathlons.',
                'time': '8 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'lactate-vs-anaerobic-threshold.html': {
        'related_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'Lactate Threshold Training',
                'desc': 'Train at your lactate threshold for performance gains.',
                'time': '12 min read'
            },
            {
                'url': '/blog/aerobic-vs-anaerobic-training.html',
                'emoji': '⚡',
                'color': 'purple',
                'tag': 'ENERGY SYSTEMS',
                'title': 'Aerobic vs Anaerobic Training',
                'desc': 'Understand both energy systems for complete fitness.',
                'time': '10 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Use heart rate zones to train both thresholds effectively.',
                'time': '8 min read'
            },
            {
                'url': '/blog/vo2-max-training-guide-2025.html',
                'emoji': '🎯',
                'color': 'blue',
                'tag': 'VO2 MAX',
                'title': 'VO2 Max Training',
                'desc': 'Train above threshold with VO2 max intervals.',
                'time': '10 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    },

    'lthr-test-protocol-guide-2025.html': {
        'related_posts': [
            {
                'url': '/blog/lactate-threshold-training-guide-2025.html',
                'emoji': '🔥',
                'color': 'orange',
                'tag': 'TRAINING',
                'title': 'Lactate Threshold Training',
                'desc': 'Use your LTHR to structure threshold training.',
                'time': '12 min read'
            },
            {
                'url': '/blog/heart-rate-zones-running.html',
                'emoji': '💓',
                'color': 'red',
                'tag': 'HR ZONES',
                'title': 'Heart Rate Zones',
                'desc': 'Calculate all training zones from your LTHR.',
                'time': '8 min read'
            },
            {
                'url': '/blog/how-to-increase-lactate-threshold.html',
                'emoji': '📈',
                'color': 'green',
                'tag': 'IMPROVEMENT',
                'title': 'How to Increase Lactate Threshold',
                'desc': 'Proven methods to improve your threshold over time.',
                'time': '9 min read'
            },
            {
                'url': '/blog/marathon-training-guide-2025.html',
                'emoji': '🏃',
                'color': 'blue',
                'tag': 'APPLICATION',
                'title': 'Marathon Training',
                'desc': 'Apply LTHR training to marathon preparation.',
                'time': '18 min read'
            }
        ],
        'hub_url': '/heart-rate-training-hub.html',
        'hub_title': 'Heart Rate Training Hub'
    }
}


def create_related_posts_html(blog_file, config):
    """Generate the related posts HTML section"""

    posts_html = []
    for post in config['related_posts']:
        post_html = f'''
            <a href="{post['url']}" class="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow border-l-4 border-{post['color']}-500">
                <div class="flex items-start">
                    <div class="flex-shrink-0 mr-4">
                        <div class="h-10 w-10 bg-{post['color']}-100 rounded-lg flex items-center justify-center">
                            <span class="text-{post['color']}-600 font-bold text-lg">{post['emoji']}</span>
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-{post['color']}-600 font-semibold mb-1">{post['tag']}</div>
                        <h4 class="text-lg font-semibold text-gray-900 mb-2">{post['title']}</h4>
                        <p class="text-gray-600 text-sm mb-3">{post['desc']}</p>
                        <div class="flex items-center text-xs text-gray-500">
                            <span>{post['time']}</span>
                        </div>
                    </div>
                </div>
            </a>'''
        posts_html.append(post_html)

    section = f'''
        <!-- Related Training Guides -->
        <div class="max-w-4xl mx-auto mt-12">
            <h3 class="text-2xl font-bold text-gray-900 mb-6">Continue Your Training Journey</h3>
            <div class="grid md:grid-cols-2 gap-6">
                {"".join(posts_html)}
            </div>

            <!-- Training Hub CTA -->
            <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h4 class="text-lg font-semibold text-gray-900 mb-3">🗺️ Explore the {config['hub_title']}</h4>
                <p class="text-gray-700 mb-4">Access all related calculators, guides, and training plans in one place.</p>
                <a href="{config['hub_url']}" class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors">
                    Visit {config['hub_title']} →
                </a>
            </div>
        </div>
'''
    return section


def add_related_posts_to_blog(filepath, config):
    """Add related posts section before </main> or </article> tag"""

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has related training guides
        if 'Continue Your Training Journey' in content:
            print(f"✓ {os.path.basename(filepath)} already has related posts")
            return False

        # Generate the related posts HTML
        related_section = create_related_posts_html(filepath, config)

        # Insert before </main> or </article>
        if '    </main>' in content:
            content = content.replace('    </main>', f'{related_section}\n\n    </main>')
        elif '</article>' in content:
            content = content.replace('</article>', f'{related_section}\n\n</article>')
        else:
            print(f"⚠️  {os.path.basename(filepath)} - No </main> or </article> tag found")
            return False

        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"✅ Added related posts to {os.path.basename(filepath)}")
        return True

    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False


def main():
    blog_dir = '/Users/glengomezmeade/runbikecalc/blog'

    updated_count = 0
    for blog_file, config in BLOG_LINKS.items():
        filepath = os.path.join(blog_dir, blog_file)
        if os.path.exists(filepath):
            if add_related_posts_to_blog(filepath, config):
                updated_count += 1

    print(f"\n🎉 Updated {updated_count} blog posts with internal linking!")


if __name__ == '__main__':
    main()
