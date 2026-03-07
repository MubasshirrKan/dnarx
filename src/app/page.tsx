'use client';

import { ArrowRight, CheckCircle2, Shield, Activity, Stethoscope, Brain, Users, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">DNA Rx</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#philosophy" className="hover:text-emerald-600 transition-colors">Philosophy</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">Our Story</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogin}
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={handleLogin}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[0.9]">
                The Science <br />
                <span className="text-emerald-600">of Care.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                We bridge the gap between clinical excellence and patient care. 
                From voice intake to precise prescriptions, we craft the tools that shape modern healthcare.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleLogin}
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full text-lg font-medium transition-all group"
                >
                  Start Prescribing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-full text-lg font-medium transition-all">
                  View Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Expertise</h2>
            <p className="text-slate-500 text-lg">Redefining the standard of medical documentation.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            {/* Feature 1 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Clinical Precision & Trust</h3>
              </div>
              
              <div className="pl-9 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">So-Called Strategy</h4>
                  <p className="text-slate-600">
                    Focuses on "Speed" alone. Using templates and shortcuts that risk accuracy for the sake of volume.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full -mr-10 -mt-10" />
                  <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">The DNA Strategy</h4>
                  <p className="text-slate-800 font-medium">
                    Focuses on Trust. In healthcare, accuracy requires deep psychological safety. We architect a workflow that ensures every prescription is precise, building patient trust.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Patient Journey</h3>
              </div>
              
              <div className="pl-9 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">So-Called Strategy</h4>
                  <p className="text-slate-600">
                    Focuses on "Throughput". Treating patients like transactions to be processed as quickly as possible.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full -mr-10 -mt-10" />
                  <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">The DNA Strategy</h4>
                  <p className="text-slate-800 font-medium">
                    Focuses on the Journey. We engineer a "Digital Front Door" that reduces friction, guiding patients from symptom to recovery with clear, legible instructions.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Voice-to-Prescription Translation</h3>
              </div>
              
              <div className="pl-9 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">So-Called Strategy</h4>
                  <p className="text-slate-600">
                    Oversimplification. Making the tech sound like "magic" but failing to capture clinical nuance.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full -mr-10 -mt-10" />
                  <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">The DNA Strategy</h4>
                  <p className="text-slate-800 font-medium">
                    Translation. Engineers speak code; Doctors speak medicine. We translate complex voice inputs into "Clinical Prescriptions" without losing scientific accuracy.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
                <h3 className="text-xl font-bold text-slate-900">Clinical Authority</h3>
              </div>
              
              <div className="pl-9 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">So-Called Strategy</h4>
                  <p className="text-slate-600">
                    "Trust the System." Forcing doctors to adapt to rigid software that slows them down.
                  </p>
                </div>

                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-bl-full -mr-10 -mt-10" />
                  <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">The DNA Strategy</h4>
                  <p className="text-slate-800 font-medium">
                    Trust the Doctor. We fight burnout by automating documentation. We build authority based on data and experience, letting you focus on the patient.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to transform your practice?</h2>
          <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto">
            Join the movement towards smarter, safer, and more efficient healthcare delivery.
          </p>
          <button 
            onClick={handleLogin}
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-xl shadow-emerald-900/20"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-slate-900 p-1.5 rounded text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-slate-900">DNA Rx</span>
              </div>
              <p className="text-slate-500 max-w-sm">
                Strategizing the future of healthcare communication. We build brands that build trust.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Services</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-emerald-600">Clinical Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-600">Patient Analytics</a></li>
                <li><a href="#" className="hover:text-emerald-600">Telemedicine Integration</a></li>
                <li><a href="#" className="hover:text-emerald-600">Pharmacy Network</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Connect</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-emerald-600">Our Story</a></li>
                <li><a href="#" className="hover:text-emerald-600">Careers</a></li>
                <li><a href="#" className="hover:text-emerald-600">LinkedIn</a></li>
                <li><a href="#" className="hover:text-emerald-600">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 text-sm text-slate-400">
            <p>© 2026 DNA Rx. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-slate-600">Privacy Policy</a>
              <a href="#" className="hover:text-slate-600">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
