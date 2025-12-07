import { Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hacker.jpg";
interface HeroSectionProps {
  onAccessClick?: () => void;
}
const HeroSection = ({
  onAccessClick
}: HeroSectionProps) => {
  return <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
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

        {/* Hero Image with Effects */}
        <div className="relative my-10 max-w-3xl mx-auto group">
          {/* Animated glow background */}
          <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 via-primary/50 to-accent/50 rounded-3xl blur-md opacity-60" />
          
          {/* Image container */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl shadow-primary/20">
            <img src={heroImage} alt="Hacker com ferramentas de IA" className="w-full transition-transform duration-700 group-hover:scale-105" />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/60 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-accent/60 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-accent/60 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/60 rounded-br-2xl" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-foreground mb-2">
          Tenha <span className="text-accent font-semibold">+115 ferramentas premium</span> de IA e Marketing Digital
        </p>
        <p className="text-lg md:text-xl text-foreground mb-4">
          em um só acesso, pagando apenas <span className="text-primary font-semibold">R$29,99/mês</span>
        </p>
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 mb-8">
          <span className="text-primary animate-pulse">✨</span>
          Acesso imediato após a confirmação do pagamento
        </p>

        {/* CTA Button with arrow */}
        <Button variant="hero" size="xl" className="px-12 group" onClick={onAccessClick}>
          Acessar Plataforma
          <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>;
};
export default HeroSection;