'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Video, Sparkles, ArrowRight, Zap, Layers, Wand2 } from 'lucide-react'
import Image from 'next/image'
import TypewriterText from '@/components/landing/TypewriterText'
import Interactive3DShowcase from '@/components/landing/Interactive3DShowcase'
import UserAccountMenu from '@/components/landing/UserAccountMenu'

import { useState } from 'react'
import LoginModal from '@/components/auth/LoginModal'

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white">

      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-zinc-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="ReadyRender Logo"
                  width={120}
                  height={120}
                  className="object-contain max-w-none"
                  priority
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">ReadyRender</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  BETA
                </span>
              </div>
            </div>

            {/* User Account Menu */}
            {user ? (
              <UserAccountMenu />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold transition-all backdrop-blur-sm border border-white/10"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen pt-24 pb-12 flex items-center">
        <div className="container mx-auto px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column - Text Content */}
            <div className="space-y-8 text-center lg:text-left">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm">
                <Sparkles size={16} className="animate-pulse" />
                <span>The Fastest 3D Video Generation Platform</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-white mb-2">
                  Create Stunning
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  3D Product Videos
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                Transform your 3D models into professional marketing videos with cinematic camera movements, dynamic text, and custom animations.
              </p>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-100 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-zinc-100 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
                  >
                    <span>Get Started - It's Free</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm">
                  <Zap size={16} className="text-yellow-400" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm">
                  <Layers size={16} className="text-blue-400" />
                  <span>No Software Needed</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm">
                  <Wand2 size={16} className="text-purple-400" />
                  <span>One-Click Export</span>
                </div>
              </div>

            </div>

            {/* Right Column - 3D Showcase */}
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl" />
              <div className="relative h-full">
                <Interactive3DShowcase />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="py-20 bg-zinc-900/50">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-zinc-400">
              Watch how easy it is to create professional 3D videos
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Video Container */}
            <div className="relative aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <video
                src="/demo-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  10x
                </div>
                <div className="text-zinc-400">Faster Creation</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  4K
                </div>
                <div className="text-zinc-400">Quality Output</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  100%
                </div>
                <div className="text-zinc-400">Cloud-Based</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/10">
        <div className="container mx-auto px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-zinc-400">
              Professional 3D video creation made simple
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Video size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload & Render</h3>
              <p className="text-zinc-400">
                Simply upload your 3D model and let our AI create stunning product videos automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Wand2 size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customize Everything</h3>
              <p className="text-zinc-400">
                Add text, adjust camera angles, choose environments, and create the perfect scene.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Export & Share</h3>
              <p className="text-zinc-400">
                Download high-quality videos in multiple formats, ready for social media or marketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-white/10">
        <div className="container mx-auto px-12 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">

            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/logo.png"
                    alt="ReadyRender Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold">ReadyRender</span>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                The fastest way to create professional 3D product videos with AI-powered automation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-500 text-sm">
              © 2024 ReadyRender. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}