import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ onSignIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🎙️</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AudioScribe
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">API</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Docs</a>
            
            <button
              onClick={onSignIn}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign In
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">Features</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">API</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2">Docs</a>
              
              <button
                onClick={onSignIn}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 mt-2"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}