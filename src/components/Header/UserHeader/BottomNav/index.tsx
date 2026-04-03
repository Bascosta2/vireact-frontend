import { Link, useLocation } from 'react-router-dom';
import { navItems } from './nav-items';

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800/50 h-[4.5rem] z-[200] sm:hidden">
      <div className="max-w-lg mx-auto px-1 py-1.5 h-full">
        <div className="flex items-stretch justify-between gap-0.5">
          {navItems.map((item) => {
            const isActive =
              item.path === '/videos'
                ? location.pathname === '/videos' || location.pathname.startsWith('/videos/')
                : location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center gap-0.5 flex-1 min-w-0"
              >
                <div className={`rounded-full p-2 transition-colors ${
                  isActive 
                    ? 'bg-gradient-primary shadow-lg' 
                    : 'hover:bg-gray-800/50'
                }`}>
                  <Icon className={`w-[15px] h-[15px] ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                </div>
                <span className={`text-[10px] font-medium leading-tight text-center truncate w-full ${
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