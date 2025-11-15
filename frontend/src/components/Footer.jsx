import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border--200  bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Left Section - Copyright */}
          <div className="text-center md:text-left">
            <p className="text-gray-600 font-medium">
              © {new Date().getFullYear()} Kanban AI. All rights reserved.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Developed by <span className="font-semibold text-gray-700">Tanmay Kapoor</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              For educational and student use
            </p>
          </div>

          {/* Right Section - Social Links */}
          <div className="flex center gap-4">
            <a
              href="https://github.com/tanmayk03"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/tanmay--kapoor/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:tanmaykapoor003@gmail.com"
              className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all"
              title="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Section - Tech Stack */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center text-xs text-gray-400">
            Built with React • Supabase • Gemini AI • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
