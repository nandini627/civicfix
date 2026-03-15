import { Link } from 'react-router-dom';
import { ShieldCheckIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🏙️', title: 'Report Issues', desc: 'Easily report potholes, broken streetlights, and more.' },
  { icon: '📍', title: 'Track Progress', desc: 'Watch your reported issues move from Pending to Resolved.' },
  { icon: '⚖️', title: 'Civic Transparency', desc: 'Authorities and citizens on the same page.' },
  { icon: '🔔', title: 'Stay Updated', desc: 'Know when your issues get addressed.' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        {/* Background gradient blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-civic-400 opacity-10 dark:opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400 opacity-10 dark:opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-civic-50 dark:bg-civic-950 text-civic-700 dark:text-civic-300 text-sm font-medium px-4 py-2 rounded-full border border-civic-200 dark:border-civic-800 mb-6">
            <span className="w-2 h-2 bg-civic-500 rounded-full animate-pulse" />
            Civic Issue Reporting Platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
            Your City. <br />
            <span className="bg-gradient-to-r from-civic-600 to-indigo-500 bg-clip-text text-transparent">
              Your Voice.
            </span>
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            CivicFix bridges the gap between citizens and authorities. Report problems, track resolutions, and make your community better — one issue at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 bg-civic-600 hover:bg-civic-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              >
                Go to Dashboard <ArrowRightIcon className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-civic-600 hover:bg-civic-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
                >
                  Get Started <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all text-base"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">
            Why CivicFix?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            {features.map((f, i) => (
              <div key={i} className="card p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-default">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center card p-12 bg-gradient-to-br from-civic-600 to-indigo-600 border-0">
            <ShieldCheckIcon className="w-12 h-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to make a difference?</h2>
            <p className="text-civic-100 mb-8">Join thousands of civic-minded citizens already using CivicFix.</p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-civic-700 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg text-base"
            >
              Create Free Account <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
