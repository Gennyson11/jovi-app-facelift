import { Check } from "lucide-react";

const aiTools = [
  "CHATGPT 5.0", "IDEOGRAM", "MIDJOURNEY", "GAMMA APP", "HEY GEN",
  "DREAMFACE", "RUNWAY", "LEONARDO IA", "SUBMAGIC IA", "SORA IA",
  "HAILUO IA", "VOICE CLONE", "PERPLEXITY", "COPILOT IA", "TURBOSCRIBE",
  "RENDERFOREST", "FISH AUDIO", "YOU.COM", "FIGMA", "EPIDEMIC SOUND"
];

const editingTools = [
  "VEED IO", "CAPCUT PRO", "ENVATO ELEMENTS", "FREELAHUB", "FREEPIK",
  "PACK EDITOR", "EPIDEMIC SOUND", "JBFLIX (CONTEÚDOS MAIS DE 1000 FILMES)",
  "METODOS ÚNICOS", "ZDM PRIME (ECONOMIZA MAIS DE R$ 20K EM CURSOS PAGOS)"
];

const seoTools = [
  "ADS PARO", "SEM RUSH", "DROPTOOL", "E MUITO MAIS"
];

const ToolsList = ({ tools }: { tools: string[] }) => (
  <ul className="space-y-3">
    {tools.map((tool) => (
      <li 
        key={tool} 
        className="text-sm text-muted-foreground flex items-start gap-3"
      >
        <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        {tool}
      </li>
    ))}
  </ul>
);

const ToolsSection = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="rounded-xl border border-primary/20 bg-card/30 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* AI Tools */}
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-8">
                INTELIGÊNCIAS ARTIFICIAIS
              </h3>
              <ToolsList tools={aiTools} />
            </div>

            {/* Editing Tools */}
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-8">
                EDIÇÕES / DISTRAÇÕES
              </h3>
              <ToolsList tools={editingTools} />
            </div>

            {/* SEO Tools */}
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-8">
                SEO/MINERAÇÃO
              </h3>
              <ToolsList tools={seoTools} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
