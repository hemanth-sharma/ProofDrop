import Link from "next/link"
import { Header } from "@/components/landing/Header"
import { Footer } from "@/components/landing/Footer"
import {
  Zap,
  Send,
  Camera,
  CheckCircle,
  Smartphone,
  Bell,
  Shield,
  Clock,
  FileText,
  Star,
  Flower2,
  Sofa,
  Package,
  Cake,
  Play,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#dbeafe] px-4 py-2 text-sm font-medium text-[#1e40af]">
            <Zap className="h-4 w-4" />
            No app download required
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Delivery proof in 60{" "}
            <span className="text-[#16a34a]">seconds</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Send your driver a link via SMS. They snap a photo, get a signature,
            and your customer gets instant proof. That&apos;s it.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1d4ed8] sm:w-auto"
            >
              Start Free Trial →
            </Link>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-400 bg-slate-50">
                <Play className="ml-0.5 h-4 w-4 fill-slate-600 text-slate-600" />
              </span>
              Watch Demo
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Free for 14 days — No credit card required
          </p>
        </div>

        {/* Dashboard + Phone mockup */}
        <div className="mx-auto mt-14 max-w-4xl px-4">
          <div className="relative">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Today&apos;s Deliveries
                  </h2>
                  <p className="text-sm text-slate-500">
                    3 pending • 12 completed
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-[#1e40af] px-4 py-2 text-sm font-medium text-white"
                >
                  + New Delivery
                </button>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                      <Send className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Delivery for Sarah Mitchell:{" "}
                        <span className="text-[#1e40af]">proof.drop/d/x8k2m</span>
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    completed
                  </span>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        John Rodriguez
                      </p>
                      <p className="text-xs text-slate-500">11:15 AM</p>
                    </div>
                  </div>
                </li>
                <li className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Emma Thompson
                      </p>
                      <p className="text-xs text-slate-500">In progress</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            {/* Phone mockup overlapping */}
            <div className="absolute -right-4 top-1/2 hidden w-56 -translate-y-1/2 rounded-[2rem] border-4 border-slate-800 bg-slate-800 p-2 shadow-2xl lg:block">
              <div className="rounded-[1.5rem] bg-white p-3">
                <p className="text-center text-xs font-semibold text-slate-900">
                  Delivery for Sarah Mitchell
                </p>
                <div className="mt-3 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
                  <Camera className="h-10 w-10 text-slate-400" />
                </div>
                <div className="mt-2 h-12 rounded border border-slate-200 bg-slate-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-medium text-green-800">
              Simple as 1-2-3
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              No apps to download. No training needed. Just send a link.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dbeafe] text-[#1e40af]">
                <Send className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                Step 01
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Send the link
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Enter customer details and hit send. Your driver gets an SMS with
                a unique capture link.
              </p>
            </div>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="absolute right-0 top-0 h-16 w-1 rounded-l bg-amber-400" />
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ede9fe] text-[#6d28d9]">
                <Camera className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                Step 02
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Capture proof
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Driver opens the link, snaps a photo of the delivery, and
                collects a signature on screen.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dcfce7] text-[#16a34a]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-400">
                Step 03
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                Customer notified
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Customer instantly receives SMS & email with photo, signature,
                and timestamp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for simplicity + Features (dark blue) */}
      <section id="features" className="scroll-mt-20 bg-[#0f172a] px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-slate-600 px-4 py-1.5 text-sm font-medium text-white">
              Built for simplicity
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              We cut the bloat so you can focus on deliveries, not software.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Smartphone,
                title: "No app required",
                desc: "Works in any mobile browser. Drivers just click the link.",
              },
              {
                icon: Bell,
                title: "Instant notifications",
                desc: "Customers get SMS + email the moment delivery is confirmed.",
              },
              {
                icon: Shield,
                title: "Tamper-proof records",
                desc: "Photo, signature, GPS, and timestamp in one secure record.",
              },
              {
                icon: Clock,
                title: "60-second captures",
                desc: "Snap photo, get signature, done. Drivers love how fast it is.",
              },
              {
                icon: FileText,
                title: "Your branding",
                desc: "Add your logo to customer notifications and proof pages.",
              },
              {
                icon: Star,
                title: "Customer confidence",
                desc: "Customers trust you more when they see professional proof.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-600/80 text-slate-300">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for businesses */}
      <section className="bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-800">
              Perfect for
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Built for businesses like yours
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              From flower shops to furniture stores, if you deliver it, we prove
              it.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Flower2,
                title: "Florists",
                desc: "Prove arrangements arrived fresh and beautiful",
                color: "text-pink-500",
              },
              {
                icon: Sofa,
                title: "Furniture Stores",
                desc: "Document condition at time of delivery",
                color: "text-amber-600",
              },
              {
                icon: Package,
                title: "Local Couriers",
                desc: "Give clients peace of mind with every drop-off",
                color: "text-slate-600",
              },
              {
                icon: Cake,
                title: "Bakeries & Caterers",
                desc: "Show orders delivered on time and intact",
                color: "text-rose-500",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className={`${item.color}`}>
                  <item.icon className="h-10 w-10" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 bg-[#f8fafc] px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#dbeafe] px-4 py-1.5 text-sm font-medium text-[#1e40af]">
              Simple pricing
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One plan. Everything included.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              No per-delivery fees. No hidden costs. Just straightforward
              pricing.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-md">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <div className="bg-slate-900 px-6 py-8 text-white">
                <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
                  Business
                </p>
                <p className="mt-2 text-4xl font-bold">
                  $29
                  <span className="text-lg font-normal text-slate-400">
                    /month
                  </span>
                </p>
                <p className="mt-1 text-slate-400">Unlimited deliveries</p>
              </div>
              <div className="space-y-4 px-6 py-8">
                {[
                  "Unlimited delivery proofs",
                  "SMS to drivers & customers",
                  "Email notifications + PDF",
                  "Photo + signature capture",
                  "Dashboard & history",
                  "Your logo & branding",
                  "Priority support",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
                <Link
                  href="/signup"
                  className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#1e40af] px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  Start 14-Day Free Trial
                </Link>
                <p className="text-center text-sm text-slate-500">
                  No credit card required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className="h-6 w-6 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <blockquote className="mt-6 text-2xl font-bold leading-relaxed text-slate-900 sm:text-3xl">
            &ldquo;We used to get constant &lsquo;where&apos;s my delivery?&rsquo;
            calls. Now customers see proof before they even think to ask.{" "}
            <span className="text-[#1e40af]">Game changer.</span>&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500 text-sm font-bold text-white">
              MR
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Maria Rodriguez</p>
              <p className="text-sm text-slate-500">
                Owner, Bella Fiori Flowers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to prove every delivery?
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Join hundreds of local businesses who&apos;ve eliminated
            &ldquo;where&apos;s my package?&rdquo; calls forever.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#1d4ed8] sm:w-auto"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-500 bg-transparent px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-slate-800 sm:w-auto"
            >
              Log In
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            14-day trial — No credit card — Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
