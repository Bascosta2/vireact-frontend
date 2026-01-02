import { Link, useLocation } from 'react-router-dom';
import { navItems } from './nav-items';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800/50 h-20 z-[200] sm:hidden">
      <div className="max-w-md mx-auto px-4 py-2 h-full">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center gap-1 flex-1"
              >
                <div className={`rounded-full p-2.5 transition-colors ${
                  isActive 
                    ? 'bg-gradient-primary shadow-lg' 
                    : 'hover:bg-gray-800/50'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  )
}

export default BottomNav