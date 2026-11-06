/**
 * Warms the route chunks the mobile menu links to. These are the same modules PublicRoutes lazy-loads,
 * so Vite serves one shared chunk and the later lazy() call resolves from cache: tapping a menu link
 * swaps pages right away instead of showing the full-screen loader on a slow phone connection.
 */
let started = false;

export function prefetchPublicRoutes(): void {
  if (started) return;
  started = true;
  const loaders = [
    () => import('@/pages/PreLogin/Features/ViralPredictor'),
    () => import('@/pages/PreLogin/Pricing'),
    () => import('@/pages/PreLogin/FAQs'),
    () => import('@/pages/PreLogin/GetInTouch'),
    () => import('@/pages/PreLogin/ViralHooks'),
    () => import('@/pages/PreLogin/Login'),
  ];
  // Failures are fine here: the real lazy() import retries, and RouteErrorBoundary handles a bad deploy.
  loaders.forEach((load) => {
    load().catch(() => {
      started = false;
    });
  });
}
