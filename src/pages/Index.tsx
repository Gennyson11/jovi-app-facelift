import { useNavigate } from 'react-router-dom';
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ToolsSection from "@/components/ToolsSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <HeroSection onAccessClick={() => navigate('/login')} />
      <FeaturesSection />
      <ToolsSection />
      <PricingSection />
      <FAQSection />
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 JoviTools. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
