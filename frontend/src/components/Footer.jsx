import { Twitter, Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold mb-4">
              🎙️ <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">AudioScribe</span>
            </div>
            <p className="text-gray-600 mb-6">
              Convert audio to perfect text using cutting-edge AI technology.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-700 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">API</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">About</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-300 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © 2026 AudioScribe. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm mt-2 md:mt-0">
            Built with ❤️ 
          </p>
        </div>
      </div>
    </footer>
  );
}