import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import LeadCaptureDialog from "@/components/LeadCaptureDialog";
import { VOXMATION_PHONE, VOXMATION_PHONE_TEL } from "@/lib/contact";

const FloatingCTA = () => {
  const [visible, setVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex flex-col gap-2 items-end">
              <Button variant="neon-outline" size="lg" asChild className="gap-2 shadow-2xl bg-background/90">
                <a href={VOXMATION_PHONE_TEL}>
                  <Phone className="h-4 w-4" />
                  {VOXMATION_PHONE}
                </a>
              </Button>
              <Button
                variant="neon"
                size="lg"
                onClick={() => setDialogOpen(true)}
                className="gap-2 shadow-2xl"
              >
                <Phone className="h-4 w-4" />
                Book Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <LeadCaptureDialog open={dialogOpen} onOpenChange={setDialogOpen} pageSource="floating_cta" />
    </>
  );
};

export default FloatingCTA;
