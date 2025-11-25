import React from 'react';
import { BarChart2, DollarSign, CreditCard, FileText, LineChart, Users, Cloud, LifeBuoy } from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { icon: <BarChart2 size={20} />, text: 'Dashboard', href: '#dashboard' },
    { icon: <DollarSign size={20} />, text: 'Transactions', href: '#transactions' },
    { icon: <CreditCard size={20} />, text: 'Loans', href: '#loans' },
    { icon: <Users size={20} />, text: 'Gov. Schemes', href: '#schemes' },
    { icon: <LineChart size={20} />, text: 'Reports', href: '#reports' },
    { icon: <FileText size={20} />, text: 'Season Planning', href: '#planning' },
    { icon: <Cloud size={20} />, text: 'Weather', href: '#weather' },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center px-3 mb-5">
          <BarChart2 size={24} className="text-green-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">FarmFinance</span>
        </div>
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-green-50 group"
              >
                <span className="text-green-600">{item.icon}</span>
                <span className="ml-3">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="pt-5 mt-5 border-t border-gray-200">
          <a
            href="#help"
            className="flex items-center p-2 text-gray-600 rounded-lg hover:bg-green-50 group"
          >
            <LifeBuoy size={20} className="text-green-600" />
            <span className="ml-3">Help & Support</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;