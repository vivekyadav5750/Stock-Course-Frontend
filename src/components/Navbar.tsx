
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Track page scroll for navbar background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);
  
  // Dynamic classes for navbar based on scroll position
  const navbarClasses = `fixed w-full top-0 z-50 transition-all duration-300 ${
    isScrolled
      ? 'bg-background/80 backdrop-blur-md shadow-sm'
      : 'bg-transparent'
  }`;
  
  // Check if the current path is admin
  const isAdmin = location.pathname.startsWith('/admin');
  
  return (
    <header className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight">
                {APP_NAME}
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {isAdmin ? (
              <>
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/admin'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/courses"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/admin/courses'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Courses
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/courses"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/courses'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  Courses
                </Link>
              </>
            )}
          </nav>
          
          {/* Authentication Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="bg-background/95 backdrop-blur-md border-b pt-2 pb-4 px-4">
            <nav className="flex flex-col space-y-4">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/courses"
                    className="text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Courses
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Home
                  </Link>
                  <Link
                    to="/courses"
                    className="text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Courses
                  </Link>
                </>
              )}
              
              {/* Mobile Auth Buttons */}
              {user ? (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center px-4 py-2">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    className="block text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="block text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left text-base font-medium py-2 px-4 rounded-md hover:bg-muted"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 border-t">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
