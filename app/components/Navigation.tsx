'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  Search, 
  Package, 
  Plus, 
  BarChart3, 
  User,
  Wallet,
  Menu,
  X
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

interface NavigationProps {
  isConnected?: boolean;
  address?: string;
}

export default function Navigation({ isConnected = false, address = '' }: NavigationProps) {
  const pathname = usePathname();
  // Dark mode removed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if we're on landing page
  const isLandingPage = pathname === '/landing';

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/explore', icon: Search },
    { name: 'Create', href: '/create', icon: Plus },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white z-50 border-b border-darkblue supports-[padding:max(0px,env(safe-area-inset-top))]:pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-8 h-8 bg-coral rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">S</span>
              </motion.div>
              <span className="text-xl font-bold text-darkblue">0ja</span>
            </Link>

            {/* Navigation Links - hidden on landing page */}
            {!isLandingPage && (
              <div className="flex items-center space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-darkblue'
                          : 'text-darkblue opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

              {/* Auth Section */}
              <div className="flex items-center space-x-4">
                <SignedOut>
                  <Link 
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-darkblue hover:text-darkblue/80 transition"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/sign-up"
                    className="px-4 py-2 bg-coral text-white rounded-lg text-sm font-medium hover:bg-coral/90 transition"
                  >
                    Sign Up
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm z-50 border-b border-gray-200 supports-[padding:max(0px,env(safe-area-inset-top))]:pt-[env(safe-area-inset-top)]">
          <div className="px-4 py-3 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-6 h-6 bg-coral rounded flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">S</span>
              </motion.div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">0ja</span>
            </Link>
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-900/60 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="px-4 py-4 space-y-2">
                {/* Hide nav items on landing page */}
                {!isLandingPage && navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-yellow-100 text-gray-900'
                          : 'text-gray-900/60 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {/* Auth Section */}
                  <SignedOut>
                    <Link 
                      href="/sign-in" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center space-x-3 px-3 py-3 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      <span>Sign In</span>
                    </Link>
                    <Link 
                      href="/sign-up" 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center space-x-3 px-3 py-3 bg-coral text-white rounded-lg text-sm font-medium hover:bg-coral/90 transition"
                    >
                      <span>Sign Up</span>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center justify-center px-3 py-3">
                      <UserButton />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation removed as redundant */}
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:h-16"></div>
    </>
  );
}
