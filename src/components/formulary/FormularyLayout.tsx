import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pill, Search, GitCompare, Home, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FormularyLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const navItems = [
  { label: 'Browse', href: '/formulary', icon: Search },
  { label: 'Compare', href: '/formulary/compare', icon: GitCompare },
];

export function FormularyLayout({ children, title, showBackButton }: FormularyLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Button variant="ghost" size="icon" asChild>
                  <Link to="/formulary">
                    <ChevronLeft className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3">
                <Pill className="h-7 w-7 text-primary" />
                <div>
                  <h1 className="text-lg font-bold">{title || 'Formulary'}</h1>
                  <p className="text-xs text-muted-foreground">Anti-Obesity Pharmacotherapy</p>
                </div>
              </div>
            </div>
            
            <nav className="flex items-center gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={location.pathname === item.href ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                </Button>
              ))}
              <Button variant="outline" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-4 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Not medical advice. Clinical judgment required. Data should be verified against current FDA labeling and guidelines.
          </p>
        </div>
      </footer>
    </div>
  );
}
