const FooterSection = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-sm font-medium tracking-wider text-silver">
          VOXMATION
        </span>
        <p className="text-xs text-muted-foreground">
          © 2026 Voxmation LLC. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-xs text-silver hover:text-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="text-xs text-silver hover:text-foreground transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
