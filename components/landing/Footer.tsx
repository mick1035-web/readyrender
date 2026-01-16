import Link from 'next/link'
import Image from 'next/image'
import { Video, Github, Twitter, Linkedin, Youtube } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-400">
            <div className="container mx-auto px-6 py-12">

                {/* Top Section */}
                <div className="grid md:grid-cols-4 gap-8 mb-8">

                    {/* Brand */}
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 relative">
                                <Image
                                    src="/logo.png"
                                    alt="ReadyRender Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold text-white">ReadyRender</span>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Transform 3D models into professional marketing videos
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#features" className="hover:text-white transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="#use-cases" className="hover:text-white transition-colors">
                                    Use Cases
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                {/* PLACEHOLDER: Add actual documentation link */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual blog link */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Blog
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual support link */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Support
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual tutorials link */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Tutorials
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                {/* PLACEHOLDER: Add actual about page */}
                                <a href="#" className="hover:text-white transition-colors">
                                    About
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual contact page */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Contact
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual privacy policy */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                {/* PLACEHOLDER: Add actual terms of service */}
                                <a href="#" className="hover:text-white transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Copyright */}
                    <p className="text-sm text-zinc-500">
                        © 2025 ReadyRender. All rights reserved.
                    </p>

                    {/* Social Media */}
                    <div className="flex items-center gap-4">
                        {/* PLACEHOLDER: Replace with your actual social media links */}
                        <a
                            href="https://twitter.com/readyrender"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter size={20} />
                        </a>
                        <a
                            href="https://linkedin.com/company/readyrender"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                        <a
                            href="https://youtube.com/@readyrender"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="YouTube"
                        >
                            <Youtube size={20} />
                        </a>
                        <a
                            href="https://github.com/readyrender"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white transition-colors"
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>
                    </div>

                </div>

            </div>
        </footer>
    )
}
