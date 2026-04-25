#!/usr/bin/env python3
"""
AI Citation Optimization for RunBikeCalc.com
Adds Article schemas, FAQPage schemas, and refreshes dateModified sitewide.
"""

import os
import re
import json

SITE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATE_MODIFIED = "2026-04-24"
PUBLISHER = {
    "@type": "Organization",
    "name": "RunBikeCalc",
    "logo": {"@type": "ImageObject", "url": "https://runbikecalc.com/logo.png"},
}

# --------------------------------------------------------------------------
# Category-specific FAQ data
# --------------------------------------------------------------------------
CATEGORY_FAQS = {
    "calculator": [
        (
            "How accurate are the RunBikeCalc calculators?",
            "RunBikeCalc calculators use validated sports science formulas: the Jack Daniels VDOT system for running pace zones, the 95% of FTP standard for cycling threshold power, and the Karvonen formula for heart rate zones. Results are accurate within ±3-5% for most athletes under normal conditions. Individual variation from lab-tested values is expected — use calculator results as a starting baseline, then adjust based on how you actually feel at those intensities during training. For racing, always verify paces in training before committing to a race plan.",
        ),
        (
            "What is the difference between heart rate zones and power zones?",
            "Heart rate zones (typically 5 zones based on max HR or lactate threshold HR) reflect cardiovascular effort — useful for all endurance activities. Power zones (7 zones based on FTP) measure actual work output in watts — available only on bikes with power meters. Power zones respond immediately to effort changes; heart rate lags 30-90 seconds. For steady-state riding, both methods produce similar training stress. For intervals, power is more precise. Beginners should start with HR zones (cheaper, sufficient); serious cyclists wanting performance data should invest in a power meter.",
        ),
        (
            "How do I find my FTP (Functional Threshold Power)?",
            "The most common FTP test: warm up 20 minutes, then ride all-out for 20 minutes, take 95% of your average power as your FTP. Alternative: the 8-minute test (2 × 8 minutes all-out, rest 10 minutes between, take 90% of the higher effort's average power). Ramp tests (increasing power every minute until failure) are popular on smart trainers and typically correlate to within 5-10% of traditional FTP tests. FTP typically improves 10-20% in the first training year and 3-5% annually for experienced athletes. Retest every 6-8 weeks during a training block.",
        ),
    ],
    "training_plan": [
        (
            "How many weeks does it take to train for a marathon?",
            "Standard marathon training plans run 16-20 weeks for most runners. Beginners with a base of 20-25 miles per week should use 18-20 weeks. Runners with a half-marathon base (30+ miles/week) can use 16-18 weeks. Elite-level runners follow year-round periodized plans with specific 12-16 week race-specific blocks. The key constraint is long run buildup: the peak long run (20-22 miles) should be reached 3 weeks before race day, with a full 3-week taper. Rushing the long run buildup increases injury risk significantly — mileage should not increase more than 10% per week.",
        ),
        (
            "What is the 80/20 rule in endurance training?",
            "The 80/20 rule (polarized training) means 80% of training volume at easy, conversational effort (Zone 1-2) and 20% at moderate-to-hard effort (Zone 3-5). Most self-coached athletes spend too much time in the 'gray zone' (Zone 3 — comfortably hard) which accumulates fatigue without the aerobic base benefits of Zone 2 or the neuromuscular adaptations of Zone 4-5. Research by Dr. Stephen Seiler on elite endurance athletes consistently shows this distribution. In practice: if you can hold a conversation without pausing, you're in Zone 2. If you're breathing hard but can speak in short sentences, you're in Zone 3 — too hard for an easy day.",
        ),
        (
            "How much running mileage per week is optimal for a half marathon?",
            "Half marathon training mileage by goal: sub-2:30 (beginner) = 20-30 miles/week peak; sub-2:00 = 30-40 miles/week peak; sub-1:45 = 40-55 miles/week peak; sub-1:30 = 55-70 miles/week peak. The single best predictor of half marathon performance is consistent weekly mileage over 12+ weeks — one 50-mile week after months of 30 miles does not produce the adaptation that 12 weeks of 45 miles does. Include one long run (10-14 miles at easy pace), one tempo run (3-6 miles at half marathon effort), and one interval session per week in the final 8 weeks.",
        ),
    ],
    "gear_running": [
        (
            "How do I choose the right running shoes?",
            "The most important factors in running shoe selection: (1) fit — there should be a thumb's width of space at the toe; (2) stack height — maximalist (30mm+) for easy/long runs, moderate (20-25mm) for tempo, minimal (under 15mm) for track and drills; (3) carbon plate — only beneficial at race pace (under 8:00/mile), adds ~1-4% efficiency at that pace, not needed for training; (4) foot strike — modern research shows shoe selection matters more than 'correcting' your natural gait. Try on shoes at the end of the day (feet swell), run in them on a treadmill if possible. Rotate 2-3 different pairs to reduce repetitive stress injury risk.",
        ),
        (
            "What is the difference between GPS running watches?",
            "Key differentiators in GPS running watches: (1) battery life — basic GPS: 8-30 hours; solar-assisted: 100+ hours in optimal conditions; (2) GPS accuracy — multi-band GPS (Garmin's multi-GNSS, Apple's dual-frequency) is significantly more accurate in cities and tree cover; (3) training metrics — VO2 max estimate, Training Readiness, Body Battery, HRV status vary in quality by brand; (4) ecosystem — Garmin Connect, Polar Flow, Suunto App, Apple Fitness — choose based on which health/training apps you already use; (5) price/performance — Garmin Forerunner 265 (~$450) and 965 (~$600) are the best mid-range endurance options; Apple Watch Ultra 2 if you're Apple-ecosystem and want best GPS accuracy.",
        ),
        (
            "How often should I replace running shoes?",
            "Replace running shoes every 300-500 miles depending on: surface (road wears faster than trail), your weight (heavier runners compress midsole faster), and running form (forefoot strikers wear the forefoot faster). Signs to replace sooner: the midsole feels flat under your thumb press, you notice more knee/shin soreness on routes where you previously felt good, or visible wear through the outsole. Rotate two pairs to extend life — alternating allows the EVA foam to decompress between runs. Keep old shoes for gym work or short errands — their remaining cushion is fine for standing but insufficient for running.",
        ),
    ],
    "gear_cycling": [
        (
            "What cycling gear do I need to start road cycling?",
            "Essential road cycling gear by priority: (1) helmet — non-negotiable, MIPS certification recommended, budget $75-150; (2) bike — a used aluminum endurance bike ($500-800) is better value than a new cheap bike; (3) padded bib shorts ($60-120) — more important for comfort than the bike saddle; (4) clipless pedals + cycling shoes ($100-200) — improves efficiency by 15-20% vs. platform pedals; (5) CO2 inflators + spare tubes + tire levers — always carry; (6) cycling gloves and glasses. A power meter ($300-600) and GPS computer ($150-300) are worthwhile after 3-6 months of consistent riding. Avoid buying cheap gear you'll replace in 6 months.",
        ),
        (
            "How do I choose a bike computer vs. using my phone?",
            "Dedicated bike computers (Garmin Edge, Wahoo ELEMNT) beat phones for cycling because: longer battery life (10-20+ hours vs. 4-6 hours for phone GPS), easier glanceable display, handlebar mounting that survives crashes better, ANT+ sensor connectivity for power meters and cadence sensors, and better data recording for training analysis. Phone apps (Strava, Wahoo) are fine for casual riders. For training with power or structured workouts, a dedicated computer is strongly recommended. Entry level (Garmin Edge 130+, Wahoo ELEMNT Bolt): $200-350. Advanced with mapping (Garmin Edge 540/840): $350-500.",
        ),
        (
            "What is a good FTP for a beginner cyclist?",
            "Average FTP by experience level: complete beginner = 100-150W; recreational cyclist (1 year) = 150-200W; trained amateur (3-5 years) = 200-280W; advanced amateur = 280-350W; elite amateur = 350-420W; professional = 400-500W+. More meaningful than raw watts is watts per kilogram (W/kg): 2.0 W/kg is recreational, 3.0 W/kg is trained amateur, 4.0 W/kg is advanced, 5.0+ W/kg is elite. Women's FTP is typically 10-15% lower in absolute watts but similar in W/kg when accounting for body composition differences. First-year FTP gains of 20-40% are common with consistent training.",
        ),
    ],
    "race_guide": [
        (
            "How do I set a realistic marathon goal time?",
            "Use these predictor methods: (1) Double your half marathon time and add 10-20 minutes for a realistic first marathon; (2) 5K time × 4.66 gives a theoretical marathon time; (3) The Riegel formula: marathon time = 5K time × (26.2/3.1)^1.06. Most runners slow 4-8% from the first to second half (positive split) — plan for even splits or 1-2% negative splits. Conditions matter: heat above 60°F adds 1-3% per 5°F increase; humidity above 60% adds 2-5%. Course elevation: add 30-60 seconds per mile for significant net gain. Common mistake: running first 10 miles 10-20 seconds/mile too fast and dying at mile 20.",
        ),
        (
            "What should I eat the week before a marathon?",
            "Marathon race week nutrition: days 7-4 before the race, eat normally. Days 3-1 (carbohydrate loading phase): increase carbohydrate intake to 10-12g per kg of body weight daily while reducing training volume — this tops off muscle glycogen stores by 20-30%. Focus on: white rice, pasta, bread, potatoes, oatmeal, sports drinks. Reduce fiber, fat, and protein relative to carbs. Race morning: eat 200-400 calories of familiar, easily digestible food 2-3 hours before the start — bagel with peanut butter and banana is a classic. Don't try anything new on race day. Hydrate with water and electrolytes; avoid excessive plain water which can cause hyponatremia.",
        ),
        (
            "How long does it take to recover from a marathon?",
            "The common recovery guideline: one easy day per mile raced (26 days for a marathon). More precisely: return to easy running at days 3-5 if legs feel good; return to moderate effort at weeks 2-3; first quality workout (tempo/intervals) at week 3-4; race fitness returns at week 6-8. Signs you're recovered: normal resting heart rate, sleep quality restored, motivation to train returns, legs feel springy again. Most runners can run another marathon at 8-12 weeks if the first went well, 12+ weeks if the first was a hard effort or conditions were difficult. Rushing return increases injury risk significantly.",
        ),
    ],
    "training_guide": [
        (
            "What is Zone 2 training and why is it important?",
            "Zone 2 training is low-intensity aerobic exercise performed at 60-70% of maximum heart rate — the zone where you can hold a conversation without pausing but are still breathing noticeably. At this intensity, your body primarily uses fat as fuel (mitochondrial fat oxidation) and builds the aerobic base that supports all higher-intensity training. Elite endurance athletes spend 75-85% of training volume in Zone 2. Benefits: increased mitochondrial density, improved fat oxidation efficiency, aerobic base that supports Zone 4-5 performance, and low recovery cost. The mistake most athletes make: Zone 2 feels uncomfortably slow at first — trust the process for 8-12 weeks before judging results.",
        ),
        (
            "How do I know if I'm overtraining?",
            "Overtraining syndrome (OTS) symptoms: persistent fatigue that doesn't improve with rest, declining performance despite training, elevated resting heart rate (5+ BPM above normal), sleep disturbances, mood changes (irritability, depression), frequent illness, loss of motivation. Early warning signs (overreaching, not OTS): legs feel heavy every session, workout performance drops 5-10%, heart rate is elevated during efforts that previously felt easier. Treatment: reduce training volume by 50% for 1-2 weeks, prioritize sleep (8-9 hours), eat at caloric maintenance or slight surplus, reduce life stress where possible. Full OTS recovery can take 1-6 months.",
        ),
        (
            "How do I improve my VO2 max?",
            "VO2 max — the maximum rate of oxygen consumption during maximal exercise — responds most to high-intensity interval training (HIIT) and high training volume. Most effective protocols: (1) 4×4 Norwegian intervals: 4 minutes at 95% max HR, 3 minutes recovery, repeat 4x, twice per week — the gold standard in research; (2) 30-30s: 30 seconds at 100-110% VO2max effort, 30 seconds easy, 10-20 repetitions; (3) Tempo intervals: 5×5 minutes at 10K race pace. Beginners see 10-15% VO2max improvement in 6-12 weeks; trained athletes see 3-8%. After reaching an advanced level, VO2max improvement slows — the ceiling is largely genetic, but most recreational athletes are far below their genetic potential.",
        ),
    ],
    "nutrition": [
        (
            "How many calories should I eat on long training days?",
            "Caloric needs for endurance training: add 100 calories per mile run or 40-50 calories per mile cycled to your baseline TDEE (Total Daily Energy Expenditure). A 160 lb athlete running 10 miles burns approximately 1,000 extra calories — eat at maintenance or slight surplus on hard training days (100-200 calorie surplus). For weight loss goals: create deficit on rest and easy days only, not hard training days — fueling workouts properly improves performance and recovery far more than the modest caloric deficit on those days. Underfueling hard training is the most common nutrition mistake among amateur endurance athletes and leads to poor adaptation and injury risk.",
        ),
        (
            "What should I eat during a long run or bike ride?",
            "During endurance exercise over 60-75 minutes, consume 30-60g of carbohydrate per hour; trained athletes can process up to 90g/hour using multiple carbohydrate types (glucose + fructose in 2:1 ratio). Practical options: energy gels (22-25g carbs each), chews, dates, bananas, sports drinks. Start fueling at the 45-minute mark — don't wait until you feel hungry or depleted. Salt intake matters for sessions over 90 minutes or in heat: 300-700mg sodium/hour prevents hyponatremia and cramping. Practice race-day nutrition in training — your gut adapts to processing carbohydrates during exercise, but it takes 4-8 weeks to fully optimize.",
        ),
        (
            "Is protein important for endurance athletes?",
            "Yes — endurance athletes need more protein than the standard RDA suggests. Recommendations: 1.4-1.7g protein per kg of bodyweight for endurance athletes in heavy training; 1.8-2.0g/kg when trying to build strength alongside endurance. Protein supports muscle repair after training, immune function, and hemoglobin production for oxygen transport. Timing matters: consuming 20-40g of protein within 30-60 minutes post-workout accelerates muscle repair and glycogen replenishment (when combined with carbohydrates). Practical sources: Greek yogurt (17g/6oz), cottage cheese (25g/cup), chicken breast (35g per 4oz), eggs (6g each), lentils (18g/cup cooked).",
        ),
    ],
    "generic": [
        (
            "What is the best way to improve running pace?",
            "The most effective methods to improve running pace in order of impact: (1) Increase weekly mileage — more miles at easy pace builds aerobic base that lifts all paces; (2) One weekly tempo run — 20-40 minutes at comfortably hard effort (about 10K race pace or slightly slower) develops lactate threshold; (3) One weekly interval session — 400m to 1-mile repeats at 5K effort develop VO2max; (4) Strength training — 2x per week targeting glutes, hip flexors, and single-leg stability reduces injury risk and improves running economy; (5) Consistent sleep and nutrition — most runners plateau not from inadequate training but from inadequate recovery. Expect 1-3 minutes/mile improvement per year in the first 2-3 years of consistent training.",
        ),
        (
            "How do I prevent running injuries?",
            "The top evidence-based injury prevention strategies: (1) Don't increase weekly mileage by more than 10% per week — the 10% rule; (2) Run at least 80% of miles at truly easy pace — most overuse injuries come from too much moderate-intensity running; (3) Strength train 2x per week — hip weakness is the most common biomechanical contributor to knee, IT band, and hamstring issues; (4) Rotate between 2-3 shoe models — reduces repetitive stress on identical tissue; (5) Get enough sleep — injury risk increases significantly with under 7 hours; (6) Address muscle imbalances early — don't train through pain, train around it. Most running injuries are the result of increasing load too fast, not from inherent biomechanical problems.",
        ),
        (
            "What is a good running pace for beginners?",
            "Beginner runners should start at a pace where they can hold a full conversation — this is typically 11-14 minutes per mile for most adults. Running slower than you think you should is one of the best things beginners can do — it builds aerobic base, reduces injury risk, and makes running feel sustainable. The goal of your first 3-6 months is consistent habit formation, not speed. As aerobic fitness improves over 8-16 weeks of consistent easy running, pace naturally drops 30-90 seconds per mile without any extra effort. Most beginners can reach a comfortable sub-10:00/mile pace within 6 months of consistent easy running 3-4x per week.",
        ),
    ],
}


def get_faq_category(slug: str) -> str:
    s = slug.lower().replace(".html", "")
    if any(x in s for x in ["calculator", "calc", "-pace", "-timer", "converter", "finder",
                              "ftp", "vo2", "heart-rate", "power-", "gearing", "calorie",
                              "bmi", "body-comp", "sweat-test", "cadence", "watt", "zone-"]):
        return "calculator"
    if any(x in s for x in ["training-plan", "plan-generator", "training-program",
                              "8-week", "12-week", "16-week", "20-week", "schedule"]):
        return "training_plan"
    if any(x in s for x in ["best-running", "running-shoe", "running-watch", "running-short",
                              "running-sock", "running-vest", "running-headphone", "running-gear",
                              "treadmill", "trail-shoe"]):
        return "gear_running"
    if any(x in s for x in ["best-bike", "best-cycl", "best-helmet", "best-jersey",
                              "best-saddle", "best-pedal", "best-computer", "bike-computer",
                              "aero-helmet", "power-meter", "cycling-shoe", "bike-rack",
                              "bikepacking", "gravel-bike", "road-bike", "carbon-bike"]):
        return "gear_cycling"
    if any(x in s for x in ["marathon", "half-marathon", "5k-", "10k-", "triathlon",
                              "race-day", "race-pace", "race-guide", "race-strategy"]):
        return "race_guide"
    if any(x in s for x in ["training-guide", "training-complete", "base-building",
                              "interval-training", "altitude-training", "zone-2-training",
                              "overtraining", "periodization", "strength-for"]):
        return "training_guide"
    if any(x in s for x in ["nutrition", "fueling", "hydration", "electrolyte",
                              "carb-loading", "protein-", "pre-race-", "recovery-food"]):
        return "nutrition"
    return "generic"


def build_faq_schema(faqs: list) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
            for q, a in faqs
        ],
    }


def build_article_schema(title: str, description: str, slug_url: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title[:110],
        "description": description,
        "image": "https://runbikecalc.com/images/og-default.jpg",
        "datePublished": "2025-01-01",
        "dateModified": DATE_MODIFIED,
        "author": {"@type": "Organization", "name": "RunBikeCalc", "url": "https://runbikecalc.com"},
        "publisher": PUBLISHER,
        "mainEntityOfPage": {"@type": "WebPage", "@id": slug_url},
    }


def get_title(content: str) -> str:
    m = re.search(r"<title[^>]*>([^<]+)</title>", content, re.IGNORECASE)
    return m.group(1).strip() if m else "RunBikeCalc"


def get_description(content: str) -> str:
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']{10,})["\']', content, re.IGNORECASE)
    if not m:
        m = re.search(r'<meta\s+content=["\']([^"\']{10,})["\']\s+name=["\']description["\']', content, re.IGNORECASE)
    return m.group(1).strip() if m else ""


def has_schema_type(content: str, *types) -> bool:
    for t in types:
        if f'"@type": "{t}"' in content or f'"@type":"{t}"' in content:
            return True
    return False


def inject_schemas(content: str, schemas: list) -> str:
    blocks = "\n".join(
        f'<script type="application/ld+json">\n{json.dumps(s, indent=2)}\n</script>'
        for s in schemas
    )
    # Try to inject after </title>
    idx = content.find("</title>")
    if idx != -1:
        insert_at = idx + len("</title>")
        return content[:insert_at] + "\n" + blocks + content[insert_at:]
    # Fallback: before </head>
    idx = content.find("</head>")
    if idx != -1:
        return content[:idx] + blocks + "\n" + content[idx:]
    return content + "\n" + blocks


def refresh_date_modified(content: str) -> str:
    return re.sub(
        r'("dateModified"\s*:\s*")[^"]+(")',
        rf'\g<1>{DATE_MODIFIED}\2',
        content,
    )


def process_file(filepath: str, base_url: str) -> bool:
    fname = os.path.basename(filepath)
    slug = fname.replace(".html", "")

    with open(filepath, encoding="utf-8") as f:
        original = f.read()

    content = original
    schemas_to_inject = []

    # Article schema (skip utility pages with no real content)
    skip_article = fname in {"about.html", "contact.html", "privacy.html", "terms.html",
                              "404.html", "advertise.html", "sitemap.html", "index.html"}
    if not skip_article and not has_schema_type(content, "Article", "BlogPosting"):
        title = get_title(content)
        desc = get_description(content)
        slug_url = f"{base_url}/{slug}/"
        schemas_to_inject.append(build_article_schema(title, desc, slug_url))

    # FAQPage schema
    if not has_schema_type(content, "FAQPage"):
        cat = get_faq_category(slug)
        faqs = CATEGORY_FAQS[cat]
        schemas_to_inject.append(build_faq_schema(faqs))

    if schemas_to_inject:
        content = inject_schemas(content, schemas_to_inject)

    # Refresh stale dateModified
    content = refresh_date_modified(content)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


if __name__ == "__main__":
    blog_dir = os.path.join(SITE_ROOT, "blog")
    blog_files = sorted(f for f in os.listdir(blog_dir) if f.endswith(".html"))
    root_files = sorted(f for f in os.listdir(SITE_ROOT) if f.endswith(".html"))

    print("=== BLOG PAGES ===")
    changed = sum(
        1 for f in blog_files
        if process_file(os.path.join(blog_dir, f), "https://runbikecalc.com/blog")
    )
    print(f"  Changed: {changed} / {len(blog_files)}")

    print()
    print("=== ROOT PAGES ===")
    changed = sum(
        1 for f in root_files
        if process_file(os.path.join(SITE_ROOT, f), "https://runbikecalc.com")
    )
    print(f"  Changed: {changed} / {len(root_files)}")

    print()
    print("Done.")
