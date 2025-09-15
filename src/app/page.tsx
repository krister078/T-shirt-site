import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6">
            T4U
            <span className="block text-3xl md:text-4xl font-normal text-blue-600 mt-2">
              Tees for You
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create, customize, and sell your own T-shirt designs in our beautiful marketplace
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Design Studio</h3>
            <p className="text-slate-600 text-sm">Interactive canvas to create amazing T-shirt designs</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Marketplace</h3>
            <p className="text-slate-600 text-sm">Browse and buy unique designs from creators</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Sell & Earn</h3>
            <p className="text-slate-600 text-sm">Turn your creativity into income</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="bg-white hover:bg-gray-50 text-slate-800 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg border border-gray-200 hover:shadow-xl transform hover:-translate-y-1"
          >
            Sign In
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-slate-500 text-sm">
          <p>Join thousands of creators already using T4U</p>
        </div>
      </div>
    </div>
  );
}