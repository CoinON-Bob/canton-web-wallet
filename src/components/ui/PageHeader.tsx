import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  fallbackPath?: string;
  rightAction?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  showBack = true,
  fallbackPath = '/dashboard',
  rightAction
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  // Generate breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumb = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { path, label };
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur border-b border-white/5 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors touch-manipulation active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          
          <div>
            <h1 className="text-lg font-semibold text-white">{title}</h1>
            
            {/* Breadcrumb */}
            
            {breadcrumb.length > 1 && (
              <nav className="flex items-center gap-1 text-xs text-gray-500">
                {breadcrumb.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    {index > 0 && <ChevronRight className="w-3 h-3" />}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`hover:text-gray-300 transition-colors ${
                        index === breadcrumb.length - 1 ? 'text-gray-400' : ''
                      }`}
                    >
                      {crumb.label}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            )}
            
            {subtitle && !breadcrumb.length && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {rightAction && (
          <div className="flex items-center">
            {rightAction}
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default PageHeader;