import { Shield, Twitter, Github, MessageSquare } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    Product: ['Features', 'How it Works', 'Privacy', 'Security'],
    Resources: ['Documentation', 'Tutorial', 'FAQ', 'Support'],
    Community: ['Discord', 'Twitter', 'GitHub', 'Blog'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
  };

  return (
    <footer className="bg-white/40 backdrop-blur-sm border-t border-gray-200/50 py-10">
      <div className="container">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center">
              <img src='/logo.svg' alt="Cipherdolls" className="w-48 h-auto" />
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md text-sm">
              Anonymous avatar chat platform with complete privacy. No personal data collection, 
              pay-per-message model using LOV tokens with spending limits.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>100% Anonymous & Private</span>
            </div>
            {/* <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors">
                <Twitter className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg flex items-center justify-center hover:bg-white/80 transition-colors">
                <MessageSquare className="w-4 h-4 text-gray-600" />
              </a>
            </div> */}
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              © 2025 Cipherdolls. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Powered by LOV tokens</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;