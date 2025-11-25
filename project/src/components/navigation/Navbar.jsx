import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../LanguageSelector';

const Navbar = () => {
  const { t } = useLanguage();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BarChart2 className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">{t('nav.brand')}</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/finance"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              {t('nav.finance')}
            </Link>
            <Link
              to="/schemes"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              {t('nav.schemes')}
            </Link>
            <Link
              to="/agribot"
              className="text-green-600 hover:text-green-700 px-3 py-2 text-sm font-bold flex items-center gap-1"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('nav.agribot')}
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium"
            >
              {t('nav.contact')}
            </Link>

            <div className="pl-4 border-l border-gray-200">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;