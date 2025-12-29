#!/bin/bash
cd /Users/glengomezmeade/Projects/runbikecalc

echo "Fixing broken internal links..."

# Fix marathon training link
find . -name "*.html" -exec sed -i '' 's|/blog/marathon-training-complete-guide-2026|/blog/marathon-training-plan-complete-guide-2026|g' {} \;

# Fix zone 2 training link
find . -name "*.html" -exec sed -i '' 's|/blog/zone-2-training-complete-guide-2026|/blog/what-is-zone-2-training-complete-guide|g' {} \;

# Fix triathlon training for beginners
find . -name "*.html" -exec sed -i '' 's|/blog/triathlon-training-beginners-complete-guide-2026|/blog/sprint-triathlon-training-complete-guide|g' {} \;

# Fix indoor training links
find . -name "*.html" -exec sed -i '' 's|/blog/indoor-training-cycling-running-complete-guide-2026|/blog/indoor-training-complete-guide-2026|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/indoor-cycling-complete-guide-2026|/blog/indoor-cycling-setup-complete-guide-2026|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/indoor-cycling-training-guide-2025|/blog/indoor-cycling-zwift-training-complete-guide|g' {} \;

# Fix strength training link
find . -name "*.html" -exec sed -i '' 's|/blog/strength-training-for-runners-complete-guide-2025|/blog/strength-training-for-runners-complete-guide|g' {} \;

# Fix trail running link
find . -name "*.html" -exec sed -i '' 's|/blog/trail-running-beginners-complete-guide-2025|/blog/trail-running-training-complete-guide|g' {} \;

# Fix running injury prevention links
find . -name "*.html" -exec sed -i '' 's|/blog/running-injury-prevention-complete-guide-2025|/blog/running-injury-prevention-complete-guide|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/running-injury-prevention-guide-2025.html|/blog/running-injury-prevention-complete-guide|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/running-injuries-prevention-treatment-complete-guide-2026.html|/blog/running-injury-prevention-complete-guide|g' {} \;

# Fix running form link
find . -name "*.html" -exec sed -i '' 's|/blog/running-form-technique-complete-guide-2025|/blog/running-form-technique-complete-guide-2026|g' {} \;

# Fix VO2 max links
find . -name "*.html" -exec sed -i '' 's|/blog/vo2-max-training-guide-2026.html|/blog/vo2max-testing-training-complete-guide-2026|g' {} \;

# Fix 5k/10k training links
find . -name "*.html" -exec sed -i '' 's|/blog/5k-training-guide-2025.html|/blog/5k-training-complete-guide|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/10k-training-guide-2025.html|/blog/10k-training-plan-complete-guide-2026|g' {} \;

# Fix beginner cyclist link
find . -name "*.html" -exec sed -i '' 's|/blog/beginner-cyclist-guide-2025.html|/blog/beginner-cyclist-complete-guide|g' {} \;

# Fix cycling power zones links
find . -name "*.html" -exec sed -i '' 's|/blog/cycling-power-zones-guide-2025.html|/blog/cycling-power-zones-complete-guide-2026|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/cycling-ftp-zones.html|/blog/cycling-power-zones-complete-guide-2026|g' {} \;

# Fix FTP test link
find . -name "*.html" -exec sed -i '' 's|/blog/ftp-test-guide.html|/blog/ftp-test-complete-guide-2026|g' {} \;

# Fix heart rate monitor link
find . -name "*.html" -exec sed -i '' 's|/blog/heart-rate-monitor-guide-2026.html|/blog/heart-rate-monitor-running-complete-guide-2026|g' {} \;

# Fix cycling tire selection link
find . -name "*.html" -exec sed -i '' 's|/blog/cycling-tire-selection-guide-2026.html|/blog/cycling-tire-selection-complete-guide-2026|g' {} \;

# Fix nutrition link
find . -name "*.html" -exec sed -i '' 's|/blog/nutrition-endurance-athletes.html|/blog/nutrition-for-endurance-athletes-complete-guide|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/blog/running-nutrition-complete-guide-2026.html|/blog/nutrition-for-endurance-athletes-complete-guide|g' {} \;

# Fix running streaks link - redirect to a general running guide
find . -name "*.html" -exec sed -i '' 's|/blog/running-streaks-complete-guide-2026.html|/blog/long-run-training-complete-guide|g' {} \;

# Fix triathlon training plans link
find . -name "*.html" -exec sed -i '' 's|/blog/triathlon-training-plans.html|/blog/olympic-triathlon-training-complete-guide|g' {} \;

# Fix running heart rate zones link
find . -name "*.html" -exec sed -i '' 's|/blog/running-heart-rate-zones.html|/blog/heart-rate-zones-running|g' {} \;

# Fix broken calculator links
find . -name "*.html" -exec sed -i '' 's|/calculators/calorie-calculator.html|/calories-burned-running-calculator|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/calculators/pace-calculator.html|/running-pace-calculator|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/calculators/zone-calculator.html|/heart-rate-zone-calculator|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/power-zones-calculator.html|/ftp-calculator|g' {} \;
find . -name "*.html" -exec sed -i '' 's|/race-predictor.html|/race-time-predictor|g' {} \;

echo "Done fixing broken links!"
