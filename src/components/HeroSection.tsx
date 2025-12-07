import { Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hacker.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-xl bg-primary/20 border border-primary/30 glow-cyan animate-float">
          <Play className="w-10 h-10 text-primary fill-primary" />
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
          <span className="text-foreground">CHEGA DE GASTAR CARO</span>
          <br />
          <span className="text-foreground">EM FERRAMENTAS DE</span>
          <br />
          <span className="text-accent">INTELIGÊNCIA ARTIFICIAL</span>
          <span className="ml-2">💸</span>
        </h1>

        {/* Hero Image */}
        <div className="relative my-10 overflow-hidden">
          <img 
            src={heroImage} 
            alt="Hacker com ferramentas de IA" 
            className="w-full max-w-3xl mx-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
        </div>

        {/* Subtitle - Updated to match image */}
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
          Tenha <span className="text-primary">+115 ferramentas premium</span> de IA e Marketing Digital
        </h2>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Tenha +115 ferramentas premium de IA e Marketing Digital em um só acesso, pagando apenas R$29,99/mês Acesso imediato após a confirmação do pagamento<span className="text-accent font-semibold">R$29,99/mês</span>
        </p>
        <p className="text-primary text-sm flex items-center justify-center gap-2 mb-8">
          <span className="animate-pulse">✨</span>
          Acesso imediato após a confirmação do pagamento
        </p>

        {/* CTA Button with arrow */}
        <Button variant="hero" size="xl" className="px-12 group">
          Acessar Plataforma
          <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
