import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const leadSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  business_name: z.string().trim().min(1, "Business name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  industry: z.string().optional(),
  monthly_call_volume: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSource?: string;
}

const industries = ["HVAC", "Plumbing", "Electrical", "Roofing", "Landscaping", "Cleaning", "Pest Control", "Painting", "Carpentry", "Appliance Repair", "Locksmith", "Tree Service", "Snow Removal", "Garage Doors", "Handyman", "Other"];
const callVolumes = ["Under 100", "100–300", "300–500", "500+"];

const LeadCaptureDialog = ({ open, onOpenChange, pageSource = "website" }: LeadCaptureDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<LeadFormData>({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    industry: "",
    monthly_call_volume: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = leadSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof LeadFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("website_leads").insert({
        ...result.data,
        source: "website",
        page_source: pageSource,
      });
      if (error) throw error;

      toast({
        title: "Demo request received",
        description: "Choose a meeting time next. If you accept the trial, we will send a secure onboarding link. The seven days start only after go-live.",
      });
      onOpenChange(false);
      setForm({ full_name: "", business_name: "", email: "", phone: "", industry: "", monthly_call_volume: "" });

      // Open Cal.com for scheduling
      window.open("https://cal.com/voxmation/meeting", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Trial creation error:", error);
      toast({
        title: "Could not submit request",
        description: "Please try again or contact us for support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-bg-surface border-border-subtle">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-primary">Book Your Free Demo</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Tell us about your business and we'll show you how AI can handle your calls.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-text-primary">Full Name *</Label>
              <Input id="full_name" value={form.full_name} onChange={e => handleChange("full_name", e.target.value)} placeholder="John Smith" className="bg-bg-body border-border-subtle" />
              {errors.full_name && <p className="text-xs text-feedback-error">{errors.full_name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business_name" className="text-text-primary">Business Name *</Label>
              <Input id="business_name" value={form.business_name} onChange={e => handleChange("business_name", e.target.value)} placeholder="Smith HVAC" className="bg-bg-body border-border-subtle" />
              {errors.business_name && <p className="text-xs text-feedback-error">{errors.business_name}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-text-primary">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} placeholder="john@smithhvac.com" className="bg-bg-body border-border-subtle" />
            {errors.email && <p className="text-xs text-feedback-error">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-text-primary">Phone *</Label>
            <Input id="phone" type="tel" value={form.phone} onChange={e => handleChange("phone", e.target.value)} placeholder="+1 (555) 123-4567" className="bg-bg-body border-border-subtle" />
            {errors.phone && <p className="text-xs text-feedback-error">{errors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-text-primary">Industry</Label>
              <Select value={form.industry} onValueChange={v => handleChange("industry", v)}>
                <SelectTrigger className="bg-bg-body border-border-subtle">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-text-primary">Monthly Calls</Label>
              <Select value={form.monthly_call_volume} onValueChange={v => handleChange("monthly_call_volume", v)}>
                <SelectTrigger className="bg-bg-body border-border-subtle">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {callVolumes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-action-primary text-text-inverse hover:bg-action-primary-hover h-12 text-base font-semibold shadow-lg shadow-brand-accent/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Book My Free Demo
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-xs text-text-secondary/60 text-center">No spam. No obligation. We'll reach out within 24 hours.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureDialog;
