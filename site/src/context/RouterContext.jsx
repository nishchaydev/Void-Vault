import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  currentRoute: 'overview',
  navigate: () => {}
});

export const VALID_ROUTES = [
  'overview',
  'demo',
  'screens',
  'evidence',
  'ps-matrix',
  'docs',
  'standards',
  'team',
  'faq',
  'pack'
];

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
  if (!hash || hash === '') return 'overview';
  
  // Normalize known synonyms
  if (hash === 'home') return 'overview';
  if (hash === 'loop' || hash === 'validation' || hash === 'benchmarks') return 'evidence';
  if (hash === 'matrix' || hash === 'traceability') return 'ps-matrix';
  if (hash === 'limits' || hash === 'limitations') return 'faq';
  
  return VALID_ROUTES.includes(hash) ? hash : 'overview';
}

export function RouterProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = getRouteFromHash();
      setCurrentRoute(nextRoute);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (routeName) => {
    const target = routeName === 'overview' ? '' : `#/${routeName}`;
    if (window.location.hash !== target) {
      window.location.hash = target;
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  return useContext(RouterContext);
}
