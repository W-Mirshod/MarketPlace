import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updatePageMetaTags, setDefaultMetaTags, updateMetaTags } from '../lib/metaTags';

// Define the valid page types
type ValidPage = 'dashboard' | 'services' | 'orders' | 'profile' | 'admin';

/**
 * React hook for managing meta tags and Telegram previews
 * Automatically updates meta tags based on current route
 */
export function useMetaTags() {
  const location = useLocation();

  useEffect(() => {
    // Extract page name from pathname
    const pathname = location.pathname;
    let page: ValidPage | null = null;

    if (pathname === '/' || pathname === '/dashboard') {
      page = 'dashboard';
    } else if (pathname === '/services') {
      page = 'services';
    } else if (pathname === '/orders') {
      page = 'orders';
    } else if (pathname === '/profile') {
      page = 'profile';
    } else if (pathname === '/admin') {
      page = 'admin';
    }

    if (page) {
      // Update meta tags for the current page
      updatePageMetaTags(page);
    } else {
      // Default meta tags for unknown pages
      setDefaultMetaTags();
    }
  }, [location.pathname]);

  return {
    updatePageMetaTags,
    setDefaultMetaTags
  };
}

/**
 * Hook for updating meta tags with custom data
 * Useful for dynamic content like service details or order information
 */
export function useCustomMetaTags() {
  const updateCustomMetaTags = (data: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    keywords?: string;
  }) => {
    // Use the general updateMetaTags function for custom data
    updateMetaTags({
      ...data,
      type: 'website'
    });
  };

  return { updateCustomMetaTags };
}
