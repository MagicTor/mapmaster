import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home - MapMaster",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🌍</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">MapMaster</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Features</a>
            <a href="#how-it-works" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">How It Works</a>
            <a href="#leaderboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Leaderboard</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Test Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">Geography</span> Knowledge
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            MapMaster is a modern, engaging geography game where you can test your knowledge of countries, capitals, and flags from around the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home"
              className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-lg transition-all"
            >
              Play Now
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">Why Choose MapMaster?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🗺️",
                title: "Interactive Map",
                description: "Click countries on an interactive world map to answer questions"
              },
              {
                icon: "⚡",
                title: "Multiple Game Modes",
                description: "Practice, Timed, and Challenge modes for different skill levels"
              },
              {
                icon: "🏆",
                title: "Global Leaderboards",
                description: "Compete with players worldwide and climb the rankings"
              },
              {
                icon: "📊",
                title: "Detailed Statistics",
                description: "Track your progress and performance across regions and countries"
              },
              {
                icon: "🎯",
                title: "Achievements",
                description: "Unlock 60+ achievements and earn rewards for your accomplishments"
              },
              {
                icon: "📱",
                title: "Fully Responsive",
                description: "Play on desktop, tablet, or mobile devices seamlessly"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "1", title: "Select Region", desc: "Choose which part of the world to focus on" },
              { number: "2", title: "Pick Mode", desc: "Choose Practice, Timed, or Challenge mode" },
              { number: "3", title: "Answer Questions", desc: "Click countries to answer geography questions" },
              { number: "4", title: "Earn Points", desc: "Gain XP, unlock achievements, and climb leaderboards" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-500 to-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Master the Map?</h2>
          <p className="text-xl text-sky-100 mb-8">Start playing now and challenge your geography knowledge</p>
          <Link
            href="/game/setup"
            className="inline-block px-8 py-4 bg-white text-sky-600 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
          >
            Play MapMaster
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">About</h3>
              <ul className="space-y-2"><li><a href="#" className="hover:text-white">About MapMaster</a></li></ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Game</h3>
              <ul className="space-y-2"><li><a href="/game/setup" className="hover:text-white">Play Game</a></li></ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Community</h3>
              <ul className="space-y-2"><li><a href="/leaderboard" className="hover:text-white">Leaderboard</a></li></ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2"><li><a href="#" className="hover:text-white">Privacy</a></li></ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2026 MapMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
