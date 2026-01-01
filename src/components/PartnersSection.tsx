const partners = [
  { name: "Africa Digital Foundation", abbrev: "ADF" },
  { name: "Pan-African Media Network", abbrev: "PAMN" },
  { name: "Global Creator Alliance", abbrev: "GCA" },
  { name: "United Content Coalition", abbrev: "UCC" },
  { name: "Creative Economy Africa", abbrev: "CEA" },
  { name: "Digital Impact Initiative", abbrev: "DII" },
];

const PartnersSection = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Supported By
          </p>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
            Our Partners
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center justify-center p-6 bg-background rounded-lg border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-secondary/20 transition-colors">
                <span className="text-lg font-bold text-primary group-hover:text-secondary transition-colors">
                  {partner.abbrev.slice(0, 2)}
                </span>
              </div>
              <p className="text-xs text-center text-muted-foreground font-medium leading-tight">
                {partner.name}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Join our growing network of organizations supporting African creators
        </p>
      </div>
    </section>
  );
};

export default PartnersSection;
