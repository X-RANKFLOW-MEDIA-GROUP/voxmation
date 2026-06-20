import { useState } from "react";
import { Textarea } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface NotesEditorProps {
  initialNotes: string;
  onSave: (notes: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function NotesEditor({
  initialNotes,
  onSave,
  isEditing,
  onToggleEdit,
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
      onToggleEdit();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div>
        <div className="mb-3 flex justify-between items-center">
          <h4 className="text-sm font-mono uppercase text-primary/70">
            Admin Notes
          </h4>
          <Button
            variant="neon-outline"
            size="sm"
            onClick={onToggleEdit}
          >
            Edit
          </Button>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded p-3 min-h-20 text-silver">
          {notes || <span className="text-silver/50">No notes yet</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h4 className="text-sm font-mono uppercase text-primary/70">
          Admin Notes
        </h4>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add internal notes about this candidate..."
        className="w-full px-3 py-2 bg-primary/5 border border-primary/20 rounded text-silver-bright placeholder-silver/50 text-sm min-h-24"
      />
      <div className="flex gap-2 mt-3">
        <Button
          variant="neon"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button
          variant="neon-outline"
          size="sm"
          onClick={() => {
            setNotes(initialNotes || "");
            onToggleEdit();
          }}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
