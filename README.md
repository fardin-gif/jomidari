# 🏰 জমিদার (jomidar.fun)

বাংলা অনলাইন বোর্ড গেম — স্ট্যাটিক সাইট + Firebase (Anonymous Auth + Firestore)। কোনো বিল্ড স্টেপ নেই।

## ফাইল
- `index.html` — একমাত্র পাতা; `css/style.css` — থিম; `js/*.js` — ইঞ্জিন, কম্পিউটার-বুদ্ধি, অবতার, সাউন্ড, বোর্ড, নেট, পর্দা
- `firebase-config.js` — **এখানে আপনার Firebase কনফিগ বসান**
- `firestore.rules` — Firestore নিরাপত্তা নিয়ম
- `vercel.json` / `netlify.toml` / `.htaccess` / `firebase.json` — `/r/ABCD` লিংকের রিরাইট

## Firebase সেটআপ (একবারই)
1. console.firebase.google.com → **Add project** (নাম: jomidar; Analytics বন্ধ রাখতে পারেন)।
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable**।
3. **Build → Firestore Database → Create database** → Production mode → লোকেশন (asia-south1 বা কাছের)।
4. Firestore → **Rules** ট্যাবে `firestore.rules`-এর লেখা পেস্ট করে **Publish**।
5. Project settings (⚙️) → Your apps → **</> Web** → app নিবন্ধন → দেখানো `firebaseConfig`-এর মানগুলো `firebase-config.js`-এ বসান।
6. Authentication → Settings → **Authorized domains**-এ যোগ করুন: `localhost`, আপনার `xxx.vercel.app`, পরে `jomidar.fun` ও `www.jomidar.fun`।

## Vercel-এ প্রকাশ
- GitHub-এ এই ফোল্ডার পুশ করে Vercel-এ Import (Framework: Other, Build command ফাঁকা, Output ফাঁকা) — অথবা `vercel` CLI।
- ডিপ্লয়ের পর `xxx.vercel.app` ডোমেইন Firebase Authorized domains-এ যোগ করতে ভুলবেন না।

## পরে jomidar.fun (Hostinger)
- **সহজ পথ:** Vercel-এ Settings → Domains → `jomidar.fun` যোগ করুন; Hostinger DNS-এ Vercel-এর দেওয়া A/CNAME রেকর্ড বসান।
- **Hostinger হোস্টিংয়ে ফাইল তুললে:** `index.html, css/, js/, firebase-config.js, favicon.svg, .htaccess` `public_html`-এ আপলোড করুন। ওয়েবসাইট HTTPS-এ চালান।
- যেভাবেই হোক `jomidar.fun` Firebase Authorized domains-এ থাকতে হবে।

## লোকালি চালানো
`python3 -m http.server 8000` → http://localhost:8000 (ফাইল সরাসরি double-click করলে চলবে না, কারণ পাথ `/js/...`)।

## যা যা আছে
- হোম: ৩ মোড, ৬০ সেকেন্ডে শিখুন, নিয়ম, প্রতিপক্ষ, FAQ, গোপনীয়তা/শর্ত
- প্রথম ভিজিটে স্তর প্রশ্ন (প্রথমবার ক্রেতা / উদ্যোক্তা / জমিদার); প্রথমবার ক্রেতার জন্য প্রতি ধাপে পরামর্শ + "কেন?" + বাটন জ্বলে ওঠা
- কম্পিউটার: মজুমদার সাহেব, রহিমা বেগম, ফটিক চাঁদ, কানাই বাবু, নাজমা খালা (আলাদা স্বভাব, সংলাপ); সহজ/মাঝারি/কঠিন
- অনলাইন: ঘর বানালে শেয়ার-লিংক (`?r=CODE` এবং `/r/CODE`), লিংকে ঢুকে নাম দিলেই যোগ; হোস্ট কম্পিউটার চরিত্র যোগ করতে পারে; ৯০ সেকেন্ড নিষ্ক্রিয় খেলোয়াড়ের দান হোস্টের ব্রাউজার অটোপাইলটে খেলে
- ৩ডি গড়ানো ছক্কা (ক্লিক করা যায়), শঙ্কু ঘুঁটির ধাপে ধাপে লাফ, বোর্ডের মাঝে কার্ড, ৩ডি বাড়ি/হোটেল, ব্রাউজারে-তৈরি সাউন্ড ও ঘটনার অ্যানিমেশন

## সীমাবদ্ধতা
- একজন কম্পিউটার-চালক দরকার: অনলাইন খেলায় কম্পিউটার চরিত্র ও অটোপাইলট **হোস্টের ব্রাউজার খোলা থাকলে** চলে।
- সাউন্ড ব্রাউজারে তৈরি (প্রথম ক্লিকের পর বাজে)। ভবিষ্যতে আসল অডিও ফাইল `js/sound.js`-এ বসানো যাবে।
