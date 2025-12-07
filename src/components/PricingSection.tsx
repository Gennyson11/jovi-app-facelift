import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  "Acesso a +115 ferramentas premium",
  "Inteligências Artificiais de última geração",
  "Ferramentas de espionagem e mineração",
  "Design e edição profissional ilimitados",
  "SEO e análise de mercado",
  "Suporte prioritário",
  "Atualizações constantes",
  "Acesso imediato"
];

const PricingSection = () => {
  return (
    <section className="py-24 px-4" id="pricing">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground">
            ESCOLHA SEU
          </h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary mt-2">
            PLANO PREMIUM
          </h3>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Monthly Plan */}
          <div
            className="relative p-8 rounded-3xl bg-card/40 border-2 border-accent/40 transition-all duration-500 group hover:scale-105 hover:border-accent/70"
            style={{
              boxShadow: '0 0 100px -20px hsl(var(--accent) / 0.6), inset 0 1px 0 0 hsl(var(--accent) / 0.2)'
            }}
          >
            {/* Popular Badge */}
            <div className="flex justify-center mb-6">
              <span className="px-6 py-2 rounded-full text-sm font-display font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                MAIS POPULAR
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-accent mb-4">MENSAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-lg">R$897,00</p>
              
              {/* Current Price */}
              <p className="my-4">
                <span className="text-5xl md:text-6xl font-display font-bold text-primary">R$37</span>
                <span className="text-xl text-foreground">/mês</span>
              </p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant="default"
              size="lg"
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg py-6"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>

          {/* Quarterly Plan */}
          <div
            className="relative p-8 rounded-3xl bg-card/40 border-2 border-primary/40 transition-all duration-500 group hover:scale-105 hover:border-primary/70"
            style={{
              boxShadow: '0 0 100px -20px hsl(var(--primary) / 0.6), inset 0 1px 0 0 hsl(var(--primary) / 0.2)'
            }}
          >
            {/* Best Value Badge */}
            <div className="flex justify-center mb-6">
              <span className="px-6 py-2 rounded-full text-sm font-display font-bold bg-accent text-accent-foreground shadow-lg shadow-accent/30">
                MELHOR CUSTO
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-accent mb-4">TRIMESTRAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-lg">R$2.691,00</p>
              
              {/* Current Price */}
              <p className="my-4">
                <span className="text-5xl md:text-6xl font-display font-bold text-primary">R$85</span>
                <span className="text-xl text-foreground">/3 meses</span>
              </p>
              
              {/* Per month breakdown */}
              <p className="text-primary text-base font-semibold">Apenas R$32/mês</p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant="default"
              size="lg"
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg py-6"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Pagamento seguro via Plataforma
            </p>
          </div>

          {/* Annual Plan */}
          <div
            className="relative p-8 rounded-3xl bg-card/40 border-2 border-cyan-500/40 transition-all duration-500 group hover:scale-105 hover:border-cyan-500/70"
            style={{
              boxShadow: '0 0 100px -20px hsl(180 100% 50% / 0.6), inset 0 1px 0 0 hsl(180 100% 50% / 0.2)'
            }}
          >
            {/* Savings Badge */}
            <div className="flex justify-center mb-6">
              <span className="px-6 py-2 rounded-full text-sm font-display font-bold bg-cyan-500 text-white shadow-lg shadow-cyan-500/30">
                ECONOMIA MÁXIMA
              </span>
            </div>

            <div className="text-center">
              <h4 className="text-2xl md:text-3xl font-display font-bold text-accent mb-4">ANUAL</h4>
              
              {/* Original Price */}
              <p className="text-muted-foreground line-through text-lg">R$10.764,00</p>
              
              {/* Current Price */}
              <p className="my-4">
                <span className="text-5xl md:text-6xl font-display font-bold text-primary">R$297</span>
                <span className="text-xl text-foreground">/ano</span>
              </p>
              
              {/* Per month breakdown */}
              <p className="text-primary text-base font-semibold">Apenas R$24,75/mês</p>
            </div>

            {/* Benefits */}
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm md:text-base text-muted-foreground">
                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant="default"
              size="lg"
              className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg py-6"
            >
              ASSINAR AGORA
            </Button>

            {/* Security Note */}
            <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-2">
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
