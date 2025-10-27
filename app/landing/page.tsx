"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Check, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  DollarSign,
  Clock,
  Lock,
  Star,
  Award
} from "lucide-react";

export default function LandingPage() {
  const hits = [
    { icon: <Zap className="w-6 h-6" />, title: "Instant Payouts", description: "Your wallet, your money. Right after every sale." },
    { icon: <DollarSign className="w-6 h-6" />, title: "Low Fees", description: "We don’t eat off your grind. 0ja takes less than the rest." },
    { icon: <Globe className="w-6 h-6" />, title: "Global & Borderless", description: "Sell to anyone, anywhere. Crypto doesn’t need permission." },
    { icon: <Shield className="w-6 h-6" />, title: "Simple AF", description: "No forms. No banks. Just upload and earn." },
    { icon: <Users className="w-6 h-6" />, title: "Built for Hustlers", description: "Writers, designers, devs, producers — if you make it, sell it." }
  ];

  const steps = [
    { number: "01", title: "Create Your 0ja Profile", description: "Sign up with your email. Add your wallet. That’s your store." },
    { number: "02", title: "Drop Your Product", description: "Upload your eBook, beat, course, code — whatever you made. Set a price, pick a category, fix your copies, or set a time limit." },
    { number: "03", title: "Share & Sell", description: "0ja gives you a product link. Post it anywhere — Twitter, Discord, Lens, wherever your people are." },
    { number: "04", title: "Get Paid Instantly", description: "Buyer hits your link. Pays in crypto. You get your bag right away. No waiting. No limits." }
  ];

  const whatYouGet = [
    "🪙 Crypto payments — fast, direct, borderless",
    "📦 One link per product — easy to share anywhere",
    "⏳ Fixed or unlimited copies — your choice",
    "⌚ Time-based access — 24h, 7 days, lifetime",
    "📂 Secure downloads — unique per buyer",
    "💬 Streetwise dashboard — clean, no clutter"
  ];

  const categories = [
    "📘 eBooks & Guides",
    "🎨 Art & Design",
    "🎧 Beats & Audio",
    "🎓 Courses & Tutorials",
    "🧠 Templates & Tools",
    "🪙 Software & Scripts",
    "💼 Services & Consultations"
  ];

  const stats = [
    { value: "10K+", label: "Active Creators" },
    { value: "$2M+", label: "Total Sales" },
    { value: "50K+", label: "Products Sold" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      {/* Premium background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,90,118,0.12),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(201,160,255,0.12),transparent_45%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,31,31,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,31,31,0.05)_1px,transparent_1px)] bg-[size:28px_28px]"></div>
      </div>

      {/* Navigation - handled by global Navigation component */}

      {/* Hero */}
      <section className="pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                The crypto street market for digital products.
            </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl">
                You make it. They buy it. You get paid — instantly, in crypto.
                <br />No banks. No middlemen. No bullshit.
              </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Link
                href="/dashboard"
                  title="Touch the bag"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-white bg-coral hover:opacity-90 transition"
              >
                  Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Link
                  href="#categories"
                  title="See what's moving on 0ja"
                  className="inline-flex items-center justify-center rounded-xl px-6 py-4 text-base font-semibold text-gray-700 dark:text-white border border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 bg-white/70 dark:bg-white/10 backdrop-blur-sm"
              >
                  Explore Drops
              </Link>
              </motion.div>
            </div>
              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Secure</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4 text-coral" />
                  <span className="text-sm">Instant</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-4 h-4 text-coral" />
                  <span className="text-sm">Premium</span>
                </div>
            </div>
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md p-4 text-center shadow-sm">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{s.label}</div>
                </div>
              ))}
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gray-100 blur-2xl rounded-3xl opacity-50"></div>
                <div className="relative rounded-2xl border border-white/60 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl p-4 bg-green-100 border border-accent-3/30">
                      <div className="flex items-center justify-between text-sm text-gray-900/60 dark:text-gray-300">
                        <span>Total Revenue</span>
                        <DollarSign className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">$248,930</div>
                      <p className="mt-1 text-xs text-green-600">+12.4% this month</p>
                    </div>
                    <div className="rounded-xl p-4 bg-white/80 dark:bg-white/5 border border-accent-3/30 dark:border-white/10">
                      <div className="flex items-center justify-between text-sm text-gray-900/60 dark:text-gray-300">
                        <span>Active Creators</span>
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">10,284</div>
                      <p className="mt-1 text-xs text-gray-900/50 dark:text-gray-400">Real-time</p>
                    </div>
                    <div className="rounded-xl p-4 bg-white/80 dark:bg-white/5 border border-accent-3/30 dark:border-white/10 col-span-2">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <p className="text-sm text-gray-900/70 dark:text-gray-300">Protected by on-chain settlement and automated delivery.</p>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-lg bg-yellow-100 text-gray-900 dark:bg-white/10 dark:text-white py-3 text-sm font-medium">USDC</div>
                        <div className="rounded-lg bg-gray-100 text-gray-600 py-3 text-sm font-medium">ETH</div>
                        <div className="rounded-lg bg-tertiary/10 text-gray-900 py-3 text-sm font-medium">More</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The streets move fast. So does 0ja.</h2>
            <p className="text-lg md:text-xl text-gray-900/80 max-w-2xl mx-auto">💰 Why 0ja Hits Different</p>
          </div>
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {hits.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group relative rounded-2xl border border-accent-3/30 bg-white/70 backdrop-blur-sm p-6 shadow-sm transition hover:shadow-lg hover:border-accent-2/50"
              >
                <div className="absolute inset-x-0 -top-px h-px bg-accent-3/40"></div>
                <div className="w-12 h-12 rounded-xl bg-green-100 text-gray-900 flex items-center justify-center mb-4 group-hover:bg-accent-2/50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-900/80">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-accent-1/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple hustle. Serious flow.</h2>
            <p className="text-lg md:text-xl text-gray-900/80 max-w-2xl mx-auto">🛍️ How It Works</p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 top-8 -translate-x-1/2 h-px w-[70%] bg-accent-2/50"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                  <div className="mx-auto w-16 h-16 rounded-full bg-coral text-white flex items-center justify-center text-xl font-bold shadow-md mb-4 hover:bg-coral/90 transition-colors">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{step.title}</h3>
                  <p className="text-gray-900/80 text-center">{step.description}</p>
              </div>
            ))}
              </div>
          </div>
        </div>
      </section>

      {/* For creators / For buyers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">You own the drop. You touch the bag.</h2>
              <p className="text-lg md:text-xl text-gray-900/80 mb-6">0ja is where your hustle meets your wallet. Sell your ideas, your art, your code — directly to your people. Keep control, keep ownership, keep every sale onchain.</p>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white font-semibold bg-coral hover:bg-coral/90 transition">
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl p-8">
                <div className="text-center">
                  <Award className="w-16 h-16 mx-auto mb-4 text-secondary/20" />
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">Buy fast. Pay in crypto. No sign-up needed.</h3>
                  <p className="text-gray-900/80 mb-6">See a drop you like? Hit pay, sign the transaction, and it's yours. Every purchase is verified onchain. No cards. No banks. Just instant digital exchange.</p>
                  <Link href="#categories" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white font-semibold bg-tertiary hover:bg-tertiary/90">
                    Explore Drops
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features overview */}
      <section id="overview" className="py-20 bg-accent-2/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What You Get</h2>
            <p className="text-lg md:text-xl text-gray-900/80">⚙️ Features Overview</p>
          </div>
          <div className="mx-auto max-w-3xl">
            <ul className="space-y-4">
              {whatYouGet.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-900">
                  <Check className="mt-1 w-4 h-4 text-gray-600 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything digital has a price — yours.</h2>
            <p className="text-lg md:text-xl text-gray-900/80">🌍 Categories That Move</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {categories.map((cat, idx) => (
              <div key={idx} className="rounded-2xl border border-accent-3/30 bg-white/70 backdrop-blur-sm p-5 shadow-sm hover:border-accent-2/50 hover:bg-accent-2/5 transition-all">
                <span className="text-base font-medium text-gray-900">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white font-semibold bg-coral hover:bg-coral/90 transition">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Ethos */}
      <section className="py-20 bg-accent-3/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The street went onchain.</h2>
          <p className="text-lg md:text-xl text-gray-900/70 mb-6">0ja is more than a platform — it's a movement. Built for creators. Powered by crypto. No KYC. No approval. No permission. You make something valuable → you get paid. That's it.</p>
          <p className="text-sm text-gray-900/50 mb-8">0ja — no banks. no borders. no bullshit.</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-white font-semibold bg-gray-900 hover:bg-gray-800">
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-coral p-10 text-center text-white shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_50%)]"></div>
            <h2 className="relative text-3xl md:text-4xl font-bold mb-3">Ready to drop your hustle?</h2>
            <p className="relative text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">Create your first product, share your link, and touch the bag today.</p>
          <Link
            href="/dashboard"
              className="relative inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold bg-white text-gray-900 hover:bg-yellow-100 transition mr-3"
          >
              Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
            <Link
              href="#categories"
              className="relative inline-flex items-center justify-center rounded-xl px-8 py-4 text-lg font-semibold bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/15 transition"
            >
              Explore Drops
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold">0ja</span>
              </div>
              <p className="text-gray-400">The crypto street market for digital products. Sell with crypto, earn instantly.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Why 0ja</a></li>
                <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 0ja. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
