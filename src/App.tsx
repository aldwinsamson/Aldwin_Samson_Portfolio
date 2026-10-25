import { Component, Suspense, lazy, useCallback, useState, type ReactNode } from "react";
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ThemeProvider } from "@/hooks/useTheme";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { CustomCursor } from "@/components/CustomCursor";
import { ProgressBar } from "@/components/ProgressBar";
import { Preloader } from "@/components/Preloader";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { GuideProvider } from "@/features/guide/PortfolioGuide";
import { ease } from "@/styles/motion";
import HomePage from "@/pages/HomePage";
const ProjectsPage = lazy(() => import("@/pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ExperiencePage = lazy(() => import("@/pages/ExperiencePage"));
const StackPage = lazy(() => import("@/pages/StackPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(err: unknown) {
    console.error(err);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="t-eyebrow text-accent">Unexpected error</p>
        <h1 className="t-h1">Something short-circuited.</h1>
        <p className="max-w-md text-muted">Please reload the page. If it keeps happening, email aldwinsamsonn@gmail.com.</p>
        <button type="button" onClick={() => window.location.reload()} className="min-h-12 rounded-full bg-ink px-6 text-bg">
          Reload
        </button>
      </div>
    );
  }
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo({ top: 0, behavior: "auto" })}>
      <motion.main
        id="main"
        key={location.pathname}
        tabIndex={-1}
        // Opacity + a small lift only: filters on the whole page forced a full-page repaint every frame.
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.55, ease: ease.lux } }}
        exit={{ opacity: 0, transition: { duration: 0.25, ease: ease.inOut } }}
        className="outline-none"
      >
        <Suspense fallback={<div className="min-h-svh" aria-hidden="true" />}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/stack" element={<StackPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </motion.main>
    </AnimatePresence>
  );
}

function Shell() {
  useSmoothScroll(siteConfig.features.smoothScroll);

  return (
    <GuideProvider>
      <CommandPaletteProvider>
        <div className={`grain vignette theme-fade relative min-h-svh ${siteConfig.features.customCursor ? "custom-cursor-active" : ""}`}>
          {siteConfig.features.customCursor && <CustomCursor />}
          <ProgressBar />
          <Navbar />
          <AnimatedRoutes />
          <Footer />
          {siteConfig.features.backToTop && <BackToTop />}
        </div>
      </CommandPaletteProvider>
    </GuideProvider>
  );
}

export default function App() {
  const Router = siteConfig.routerMode === "browser" ? BrowserRouter : HashRouter;
  const [loaded, setLoaded] = useState(!siteConfig.features.preloader);
  const onPreloaderComplete = useCallback(() => setLoaded(true), []);

  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            {!loaded && <Preloader onComplete={onPreloaderComplete} />}
            {loaded && <Shell />}
          </Router>
        </MotionConfig>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}
