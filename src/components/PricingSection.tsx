import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Acesso a +70 ferramentas premium",
  "Inteligências Artificiais de última geração",
  "Ferramentas de espionagem e mineração",
  "Design e edição profissional ilimitados",
  "SEO e análise de mercado",
  "Suporte prioritário",
  "Atualizações constantes",
  "Acesso imediato",
];

const PricingSection = () => {
  return (
    <section className="py-20 px-4" id="pricing">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            ESCOLHA SEU
          </h2>
          <h3 className="text-3xl md:text-4xl font-display font-bold text-primary mt-1">
            PLANO PREMIUM
          </h3>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <div 
            className="relative p-6 rounded-2xl bg-card/30 border border-accent/30 transition-all duration-500 group"
            style={{ 
              boxShadow: '0 0 80px -20px hsl(var(--accent) / 0.5), inset 0 1px 0 0 hsl(var(--accent) / 0.1)'
            }}
          >
            {/* Popular Badge */}
            <div className="flex justify-center mb-5">
              <span className="px-5 py-1.5 rounded-full text-xs font-display font-bold bg-primary text-primary-foreground">
                MAIS POPULAR
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-display font-bold text-accent mb-3">MENSAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-sm">R$897,00</p>
              
              {/* Current Price */}
              <p className="my-2">
                <span className="text-4xl font-display font-bold text-primary">R$37</span>
                <span className="text-base text-foreground">/mês</span>
              </p>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              variant="default" 
              size="lg" 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base py-5"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>

          {/* Quarterly Plan */}
          <div 
            className="relative p-6 rounded-2xl bg-card/30 border border-primary/30 transition-all duration-500 group"
            style={{ 
              boxShadow: '0 0 80px -20px hsl(var(--primary) / 0.5), inset 0 1px 0 0 hsl(var(--primary) / 0.1)'
            }}
          >
            {/* Best Value Badge */}
            <div className="flex justify-center mb-5">
              <span className="px-5 py-1.5 rounded-full text-xs font-display font-bold bg-accent text-accent-foreground">
                MELHOR CUSTO
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-display font-bold text-accent mb-3">TRIMESTRAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-sm">R$2.691,00</p>
              
              {/* Current Price */}
              <p className="my-2">
                <span className="text-4xl font-display font-bold text-primary">R$97</span>
                <span className="text-base text-foreground">/3 meses</span>
              </p>
              
              {/* Per month breakdown */}
              <p className="text-primary text-xs font-semibold">Apenas R$32/mês</p>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              variant="default" 
              size="lg" 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base py-5"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>

          {/* Annual Plan */}
          <div 
            className="relative p-6 rounded-2xl bg-card/30 border border-cyan-500/30 transition-all duration-500 group"
            style={{ 
              boxShadow: '0 0 80px -20px hsl(180 100% 50% / 0.5), inset 0 1px 0 0 hsl(180 100% 50% / 0.1)'
            }}
          >
            {/* Savings Badge */}
            <div className="flex justify-center mb-5">
              <span className="px-5 py-1.5 rounded-full text-xs font-display font-bold bg-cyan-500 text-white">
                ECONOMIA MÁXIMA
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-xl font-display font-bold text-accent mb-3">ANUAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-sm">R$10.764,00</p>
              
              {/* Current Price */}
              <p className="my-2">
                <span className="text-4xl font-display font-bold text-primary">R$297</span>
                <span className="text-base text-foreground">/ano</span>
              </p>
              
              {/* Per month breakdown */}
              <p className="text-primary text-xs font-semibold">Apenas R$24,75/mês</p>
            </div>

            {/* Benefits */}
            <ul className="mt-6 space-y-2.5">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button 
              variant="default" 
              size="lg" 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-base py-5"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
