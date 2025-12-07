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
          <h3 className="text-3xl md:text-4xl font-display font-bold text-accent mt-1">
            PLANO PREMIUM
          </h3>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="relative p-8 rounded-2xl bg-card/50 border border-accent/20 hover:border-accent/40 transition-all duration-500 group"
               style={{ boxShadow: '0 0 60px -15px hsl(var(--accent) / 0.3)' }}>
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-6 py-1.5 rounded-full text-xs font-display font-bold bg-primary text-primary-foreground shadow-lg">
                MAIS POPULAR
              </span>
            </div>

            <div className="text-center mt-4">
              <h4 className="text-2xl font-display font-bold text-primary mb-6">MENSAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-base">R$897,00</p>
              
              {/* Current Price */}
              <p className="text-foreground my-2">
                <span className="text-5xl font-display font-bold text-primary">R$37</span>
                <span className="text-lg text-muted-foreground">/mês</span>
              </p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button variant="hero" size="lg" className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold">
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>

          {/* Quarterly Plan */}
          <div className="relative p-8 rounded-2xl bg-card/50 border border-primary/20 hover:border-primary/40 transition-all duration-500 group"
               style={{ boxShadow: '0 0 60px -15px hsl(var(--primary) / 0.3)' }}>
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="px-6 py-1.5 rounded-full text-xs font-display font-bold bg-accent text-accent-foreground shadow-lg">
                MELHOR CUSTO
              </span>
            </div>

            <div className="text-center mt-4">
              <h4 className="text-2xl font-display font-bold text-accent mb-6">TRIMESTRAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-base">R$2.691,00</p>
              
              {/* Current Price */}
              <p className="text-foreground my-2">
                <span className="text-5xl font-display font-bold text-accent">R$97</span>
                <span className="text-lg text-muted-foreground">/3 meses</span>
              </p>
              
              {/* Per month breakdown */}
              <p className="text-primary text-sm font-semibold">Apenas R$32/mês</p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button variant="hero" size="lg" className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold">
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
