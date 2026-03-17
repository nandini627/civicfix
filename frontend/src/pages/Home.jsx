import { Link } from 'react-router-dom';
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  ArrowRightIcon, 
  ChatBubbleBottomCenterTextIcon,
  BellAlertIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const features = [
  { 
    icon: ChatBubbleBottomCenterTextIcon, 
    title: 'Report with Context', 
    desc: 'Easily report potholes, broken streetlights, and more with photos and precise location.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  { 
    icon: ChartBarIcon, 
    title: 'Track in Real-time', 
    desc: 'Watch your reported issues move through the lifecycle from Pending to Resolved.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10'
  },
  { 
    icon: ShieldCheckIcon, 
    title: 'Direct Accountability', 
    desc: 'Official responses from city authorities directly on your report board.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  { 
    icon: BellAlertIcon, 
    title: 'Instant Notifications', 
    desc: 'Stay informed with automated email updates whenever your report changes state.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  }
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen selection:bg-civic-500/30 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 md:pt-32 md:pb-48">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-screen bg-dot-pattern text-slate-200 dark:text-slate-800/40 [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-civic-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border-slate-200 dark:border-slate-800 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-civic-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-civic-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Transforming Urban Living
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tighter sm:max-w-4xl">
            Empowering Every <span className="text-gradient">Citizen</span> To Fix Their City.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed px-4">
            CivicFix is the digital bridge between people and authorities. Together, we can make communities safer, cleaner, and better—one report at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary px-10 py-5 text-lg">
                Go to Dashboard
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary px-10 py-5 text-lg group">
                  Start Reporting
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/login" className="btn-secondary px-10 py-5 text-lg">
                  Citizen Login
                </Link>
              </>
            )}
          </div>

          {/* Floating UI Elements Demo */}
          <div className="mt-20 relative w-full max-w-5xl group">
             <div className="absolute -inset-1 bg-gradient-to-r from-civic-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
             <div className="relative glass-card p-1 overflow-hidden border-slate-200/50 dark:border-slate-800/50">
               <div className="aspect-[16/9] w-full bg-slate-100 dark:bg-slate-950 rounded-[1.75rem] flex items-center justify-center p-8 overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                   <div className="space-y-4 animate-float">
                     <div className="p-4 glass rounded-2xl border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xl translate-x-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                          <MapPinIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold dark:text-white">Pothole Alert</p>
                          <p className="text-xs text-slate-500">2 min ago • Main St.</p>
                        </div>
                     </div>
                     <div className="p-4 glass rounded-2xl border-slate-200 dark:border-slate-800 flex items-center gap-4 shadow-xl -translate-x-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold dark:text-white">Resolution Confirmed</p>
                          <p className="text-xs text-slate-500">Authority Response</p>
                        </div>
                     </div>
                   </div>
                   <div className="hidden md:flex items-center justify-center">
                      <div className="text-8xl select-none grayscale opacity-30 dark:opacity-10 font-bold">CIVIC</div>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-white/50 dark:bg-slate-900/20 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight"> Built for Accountability </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium"> Everything you need to take action and track results in your neighborhood. </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card-premium group hover:-translate-y-2">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${f.bg} flex items-center justify-center ${f.color} mb-6 md:mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <f.icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-3 md:mb-4 tracking-tight"> {f.title} </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium"> {f.desc} </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto glass-card p-12 flex flex-col md:flex-row justify-between items-center gap-12 bg-gradient-to-br from-civic-600 to-indigo-700 text-white border-none shadow-2xl">
          <div className="text-left max-w-md">
            <h2 className="text-4xl font-bold mb-4"> Ready to start? </h2>
            <p className="text-civic-100 font-medium"> Join over 10,000 citizens making their cities cleaner and safer every single day. </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {!isAuthenticated && (
              <Link to="/signup" className="btn-secondary !text-slate-900 bg-white border-white px-8 text-center ring-4 ring-white/10">
                Create Account
              </Link>
            )}
            <Link to="/dashboard" className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 px-8 text-center flex items-center justify-center gap-3">
              View Issues Feed
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Simple */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-400 font-medium"> © 2024 CivicFix Platform. Empowering cities globally. </p>
      </footer>
    </div>
  );
};

export default Home;
