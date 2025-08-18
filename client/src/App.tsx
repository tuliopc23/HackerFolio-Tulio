import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { CRTShader } from '@/components/effects/CRTShader';
import Home from '@/pages/home';
import Projects from '@/pages/projects';
import About from '@/pages/about';
import Contact from '@/pages/contact';
import Resume from '@/pages/resume';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route component={Home} path="/" />
      <Route component={Projects} path="/projects" />
      <Route component={About} path="/about" />
      <Route component={Contact} path="/contact" />
      <Route component={Resume} path="/resume" />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <CRTShader className="w-screen h-screen">
            <div className="crt-screen h-full w-full">
              <Toaster />
              <Router />
            </div>
          </CRTShader>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
