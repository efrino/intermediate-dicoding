function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

export function getActivePathname() {
  const hash = location.hash;
  
  if (hash.startsWith('#/')) {
    return hash.slice(1); 
  }

  return null; 
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  
  if (!pathname || !pathname.startsWith('/')) {
    return '*';  // fallback route not found
  }
  const urlSegments = extractPathnameSegments(pathname);
  const route = constructRouteFromSegments(urlSegments);

  // Kamu bisa cek apakah route valid, misalnya:
  const validRoutes = ['/', '/login', '/register', '/home', '/stories', '/add-story', '/stories/:id'];
  if (!validRoutes.includes(route)) {
    return '*'; // kalau route tidak ada di daftar valid, kembalikan not found
  }

  return route;
}


export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
