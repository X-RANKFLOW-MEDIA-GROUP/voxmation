const FooterSection = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div>
            <span className="font-mono text-xl font-bold tracking-widest text-foreground">
              VOXMATION
            </span>
            <p className="text-sm text-muted-foreground mt-2">
              Revenue Infrastructure Partner
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6 justify-center">
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
              Book Audit
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
              Service Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-mono">
              Privacy Policy
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground text-right font-mono">
            © 2026 Voxmation LLC.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
