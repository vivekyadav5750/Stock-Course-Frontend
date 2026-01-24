
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '@/hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Define page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  // Check if current route is in admin section
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="min-h-[calc(100vh-4rem)]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {!isAdminRoute && (
        <footer className="py-6 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Master Invest. All rights reserved.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
