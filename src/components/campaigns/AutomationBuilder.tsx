/**
 * Automation Workflow Builder Component
 * Drag-and-drop interface for creating automated workflows with triggers and actions
 */

import { useState, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Zap,
  Plus,
  Trash2,
  Copy,
  Play,
  Pause,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  Mail,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

/**
 * Type definitions for triggers and actions
 */
type TriggerType = "new_contact" | "stage_change" | "tag_added" | "time_based";
type ActionType = "send_email" | "send_sms" | "update_tag" | "create_opportunity";

interface Trigger {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
  description?: string;
}

interface Action {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  description?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger | null;
  actions: Action[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    triggered: number;
    completed: number;
    failed: number;
  };
}

interface DraggedItem {
  type: "trigger" | "action";
  itemType: TriggerType | ActionType;
}

/**
 * Trigger configuration templates
 */
const TRIGGER_TEMPLATES: Record<TriggerType, { icon: React.ReactNode; label: string; fields: string[] }> = {
  new_contact: {
    icon: <Zap className="w-4 h-4" />,
    label: "New Contact",
    fields: ["source"],
  },
  stage_change: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Stage Change",
    fields: ["fromStage", "toStage"],
  },
  tag_added: {
    icon: <Tag className="w-4 h-4" />,
    label: "Tag Added",
    fields: ["tagName"],
  },
  time_based: {
    icon: <Clock className="w-4 h-4" />,
    label: "Time-Based",
    fields: ["delayDays", "delayHours"],
  },
};

/**
 * Action configuration templates
 */
const ACTION_TEMPLATES: Record<ActionType, { icon: React.ReactNode; label: string; fields: string[] }> = {
  send_email: {
    icon: <Mail className="w-4 h-4" />,
    label: "Send Email",
    fields: ["templateId", "recipient"],
  },
  send_sms: {
    icon: <MessageSquare className="w-4 h-4" />,
    label: "Send SMS",
    fields: ["phoneField", "messageTemplate"],
  },
  update_tag: {
    icon: <Tag className="w-4 h-4" />,
    label: "Update Tag",
    fields: ["tagName", "action"],
  },
  create_opportunity: {
    icon: <TrendingUp className="w-4 h-4" />,
    label: "Create Opportunity",
    fields: ["opportunityName", "stage", "value"],
  },
};

/**
 * Draggable trigger/action component
 */
interface DraggableItemProps {
  type: "trigger" | "action";
  itemType: TriggerType | ActionType;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: DraggedItem) => void;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ type, itemType, onDragStart }) => {
  const template = type === "trigger" ? TRIGGER_TEMPLATES[itemType as TriggerType] : ACTION_TEMPLATES[itemType as ActionType];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, { type, itemType })}
      className="p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-2">
        {template.icon}
        <span className="text-sm font-medium">{template.label}</span>
      </div>
    </div>
  );
};

/**
 * Trigger configuration dialog
 */
interface TriggerConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (trigger: Trigger) => void;
  initialTrigger?: Trigger;
}

const TriggerConfigDialog: React.FC<TriggerConfigDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  initialTrigger,
}) => {
  const [selectedType, setSelectedType] = useState<TriggerType>(initialTrigger?.type || "new_contact");
  const [config, setConfig] = useState<Record<string, any>>(initialTrigger?.config || {});

  const handleSave = () => {
    const trigger: Trigger = {
      id: initialTrigger?.id || `trigger-${Date.now()}`,
      type: selectedType,
      config,
      description: `${TRIGGER_TEMPLATES[selectedType].label} trigger`,
    };
    onSave(trigger);
    onOpenChange(false);
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const template = TRIGGER_TEMPLATES[selectedType];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Trigger</DialogTitle>
          <DialogDescription>Set up the conditions that will trigger your automation</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="trigger-type">Trigger Type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as TriggerType)}>
              <SelectTrigger id="trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_contact">New Contact</SelectItem>
                <SelectItem value="stage_change">Stage Change</SelectItem>
                <SelectItem value="tag_added">Tag Added</SelectItem>
                <SelectItem value="time_based">Time-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {template.fields.map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </Label>
              {field.includes("Stage") || field.includes("action") ? (
                <Select value={config[field] || ""} onValueChange={(value) => handleConfigChange(field, value)}>
                  <SelectTrigger id={field}>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.includes("Stage") && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                      </>
                    )}
                    {field === "action" && (
                      <>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="remove">Remove</SelectItem>
                      </>
                    )}
                    {field === "source" && (
                      <>
                        <SelectItem value="web_form">Web Form</SelectItem>
                        <SelectItem value="import">Import</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : field.includes("Days") || field.includes("Hours") ? (
                <Input
                  id={field}
                  type="number"
                  min="0"
                  value={config[field] || ""}
                  onChange={(e) => handleConfigChange(field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              ) : (
                <Input
                  id={field}
                  value={config[field] || ""}
                  onChange={(e) => handleConfigChange(field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Trigger</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Action configuration dialog
 */
interface ActionConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (action: Action) => void;
  initialAction?: Action;
}

const ActionConfigDialog: React.FC<ActionConfigDialogProps> = ({
  isOpen,
  onOpenChange,
  onSave,
  initialAction,
}) => {
  const [selectedType, setSelectedType] = useState<ActionType>(initialAction?.type || "send_email");
  const [config, setConfig] = useState<Record<string, any>>(initialAction?.config || {});

  const handleSave = () => {
    const action: Action = {
      id: initialAction?.id || `action-${Date.now()}`,
      type: selectedType,
      config,
      description: `${ACTION_TEMPLATES[selectedType].label} action`,
    };
    onSave(action);
    onOpenChange(false);
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfig({ ...config, [field]: value });
  };

  const template = ACTION_TEMPLATES[selectedType];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Action</DialogTitle>
          <DialogDescription>Define what should happen when the trigger is activated</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="action-type">Action Type</Label>
            <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ActionType)}>
              <SelectTrigger id="action-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="send_sms">Send SMS</SelectItem>
                <SelectItem value="update_tag">Update Tag</SelectItem>
                <SelectItem value="create_opportunity">Create Opportunity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {template.fields.map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </Label>
              {field === "stage" || field === "recipient" ? (
                <Select value={config[field] || ""} onValueChange={(value) => handleConfigChange(field, value)}>
                  <SelectTrigger id={field}>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field === "stage" && (
                      <>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                      </>
                    )}
                    {field === "recipient" && (
                      <>
                        <SelectItem value="contact_email">Contact Email</SelectItem>
                        <SelectItem value="owner_email">Owner Email</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              ) : field === "value" ? (
                <Input
                  id={field}
                  type="number"
                  value={config[field] || ""}
                  onChange={(e) => handleConfigChange(field, e.target.value)}
                  placeholder="Enter amount"
                />
              ) : (
                <Input
                  id={field}
                  value={config[field] || ""}
                  onChange={(e) => handleConfigChange(field, e.target.value)}
                  placeholder={`Enter ${field}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Action</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Workflow step display component
 */
interface WorkflowStepProps {
  trigger: Trigger;
  actions: Action[];
  onEditTrigger: (trigger: Trigger) => void;
  onEditAction: (action: Action) => void;
  onDeleteTrigger: () => void;
  onDeleteAction: (id: string) => void;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  trigger,
  actions,
  onEditTrigger,
  onEditAction,
  onDeleteTrigger,
  onDeleteAction,
}) => {
  return (
    <div className="space-y-4">
      {/* Trigger Section */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {TRIGGER_TEMPLATES[trigger.type].icon}
              <CardTitle className="text-lg">{trigger.description || "Trigger"}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditTrigger(trigger)}
                className="h-8 w-8 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteTrigger}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <div className="space-y-1">
            {Object.entries(trigger.config).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium capitalize">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Arrow Down */}
      <div className="flex justify-center">
        <div className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-3">
        {actions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300 bg-gray-50 p-6">
            <p className="text-center text-gray-500 text-sm">No actions configured yet</p>
          </Card>
        ) : (
          actions.map((action, index) => (
            <div key={action.id}>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </span>
                      {ACTION_TEMPLATES[action.type].icon}
                      <CardTitle className="text-base">{action.description || "Action"}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditAction(action)}
                        className="h-8 w-8 p-0"
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAction(action.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <div className="space-y-1">
                    {Object.entries(action.config).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {index < actions.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Main AutomationBuilder Component
 */
interface AutomationBuilderProps {
  onSave?: (workflow: Workflow) => void;
  onError?: (error: string) => void;
}

export default function AutomationBuilder({ onSave, onError }: AutomationBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /**
   * Handle drag start event
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: DraggedItem) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  /**
   * Handle drag over drop zone
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  /**
   * Handle drop event
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (!selectedWorkflow) {
      onError?.("Please create or select a workflow first");
      return;
    }

    try {
      const item: DraggedItem = JSON.parse(e.dataTransfer.getData("application/json"));

      if (item.type === "trigger") {
        setShowTriggerDialog(true);
      } else {
        setShowActionDialog(true);
      }
    } catch (error) {
      onError?.("Failed to process dropped item");
    }
  };

  /**
   * Create new workflow
   */
  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      onError?.("Workflow name is required");
      return;
    }

    const newWorkflow: Workflow = {
      id: `workflow-${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      trigger: null,
      actions: [],
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        triggered: 0,
        completed: 0,
        failed: 0,
      },
    };

    setWorkflows([...workflows, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setWorkflowName("");
    setWorkflowDescription("");
    setShowWorkflowDialog(false);
  };

  /**
   * Save trigger to workflow
   */
  const handleSaveTrigger = (trigger: Trigger) => {
    if (!selectedWorkflow) return;

    const updated = {
      ...selectedWorkflow,
      trigger,
      updatedAt: new Date(),
    };

    setSelectedWorkflow(updated);
    setWorkflows(workflows.map((w) => (w.id === updated.id ? updated : w)));
  };

  /**
   * Save action to workflow
   */
  const handleSaveAction = (action: Action) => {
    if (!selectedWorkflow) return;

    let updated: Workflow;

    if (editingAction) {
      updated = {
        ...selectedWorkflow,
        actions: selectedWorkflow.actions.map((a) => (a.id === editingAction.id ? action : a)),
        updatedAt: new Date(),
      };
      setEditingAction(null);
    } else {
      updated = {
        ...selectedWorkflow,
        actions: [...selectedWorkflow.actions, action],
        updatedAt: new Date(),
      };
    }

    setSelectedWorkflow(updated);
    setWorkflows(workflows.map((w) => (w.id === updated.id ? updated : w)));
  };

  /**
   * Delete action from workflow
   */
  const handleDeleteAction = (actionId: string) => {
    if (!selectedWorkflow) return;

    const updated = {
      ...selectedWorkflow,
      actions: selectedWorkflow.actions.filter((a) => a.id !== actionId),
      updatedAt: new Date(),
    };

    setSelectedWorkflow(updated);
    setWorkflows(workflows.map((w) => (w.id === updated.id ? updated : w)));
  };

  /**
   * Delete workflow
   */
  const handleDeleteWorkflow = () => {
    if (!workflowToDelete) return;

    setWorkflows(workflows.filter((w) => w.id !== workflowToDelete));
    if (selectedWorkflow?.id === workflowToDelete) {
      setSelectedWorkflow(null);
    }
    setShowDeleteConfirm(false);
    setWorkflowToDelete(null);
  };

  /**
   * Toggle workflow enabled state
   */
  const handleToggleWorkflow = () => {
    if (!selectedWorkflow) return;

    const updated = {
      ...selectedWorkflow,
      enabled: !selectedWorkflow.enabled,
      updatedAt: new Date(),
    };

    setSelectedWorkflow(updated);
    setWorkflows(workflows.map((w) => (w.id === updated.id ? updated : w)));
  };

  /**
   * Publish/Save workflow
   */
  const handlePublishWorkflow = () => {
    if (!selectedWorkflow) {
      onError?.("No workflow selected");
      return;
    }

    if (!selectedWorkflow.trigger) {
      onError?.("Workflow must have at least one trigger");
      return;
    }

    if (selectedWorkflow.actions.length === 0) {
      onError?.("Workflow must have at least one action");
      return;
    }

    onSave?.(selectedWorkflow);
  };

  /**
   * Duplicate workflow
   */
  const handleDuplicateWorkflow = () => {
    if (!selectedWorkflow) return;

    const duplicated: Workflow = {
      ...selectedWorkflow,
      id: `workflow-${Date.now()}`,
      name: `${selectedWorkflow.name} (Copy)`,
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkflows([...workflows, duplicated]);
    setSelectedWorkflow(duplicated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left Sidebar - Library */}
      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="text-lg">Automation Library</CardTitle>
            <CardDescription>Drag items to build your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Triggers */}
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Triggers
              </h3>
              <div className="space-y-2">
                {(Object.keys(TRIGGER_TEMPLATES) as TriggerType[]).map((triggerType) => (
                  <DraggableItem
                    key={triggerType}
                    type="trigger"
                    itemType={triggerType}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Actions
              </h3>
              <div className="space-y-2">
                {(Object.keys(ACTION_TEMPLATES) as ActionType[]).map((actionType) => (
                  <DraggableItem
                    key={actionType}
                    type="action"
                    itemType={actionType}
                    onDragStart={handleDragStart}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {/* Workflows List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>Create and manage automated workflows</CardDescription>
            </div>
            <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                  <DialogDescription>Set up a new automation workflow</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input
                      id="workflow-name"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Welcome New Leads"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workflow-description">Description (optional)</Label>
                    <Input
                      id="workflow-description"
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="Describe what this workflow does"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowWorkflowDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No workflows yet. Click "New Workflow" to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedWorkflow?.id === workflow.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{workflow.name}</h4>
                          {workflow.enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        {workflow.description && (
                          <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                        )}
                        {workflow.stats && (
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Triggered: {workflow.stats.triggered}</span>
                            <span>Completed: {workflow.stats.completed}</span>
                            <span>Failed: {workflow.stats.failed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Editor */}
        {selectedWorkflow && (
          <div className="space-y-6">
            {/* Toolbar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleToggleWorkflow}
                    variant={selectedWorkflow.enabled ? "default" : "outline"}
                    className="gap-2"
                  >
                    {selectedWorkflow.enabled ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Enable
                      </>
                    )}
                  </Button>
                  <Button onClick={handleDuplicateWorkflow} variant="outline" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button onClick={handlePublishWorkflow} className="gap-2 ml-auto">
                    <CheckCircle className="w-4 h-4" />
                    Save Workflow
                  </Button>
                  <Button
                    onClick={() => {
                      setWorkflowToDelete(selectedWorkflow.id);
                      setShowDeleteConfirm(true);
                    }}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drop Zone */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedWorkflow.name} - Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="min-h-96 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 transition-colors"
                >
                  {selectedWorkflow.trigger ? (
                    <WorkflowStep
                      trigger={selectedWorkflow.trigger}
                      actions={selectedWorkflow.actions}
                      onEditTrigger={(trigger) => {
                        setSelectedWorkflow({ ...selectedWorkflow, trigger });
                      }}
                      onEditAction={(action) => {
                        setEditingAction(action);
                        setShowActionDialog(true);
                      }}
                      onDeleteTrigger={() => {
                        setSelectedWorkflow({ ...selectedWorkflow, trigger: null });
                      }}
                      onDeleteAction={handleDeleteAction}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Zap className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-gray-500 font-medium">Drag a trigger here to get started</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Then add actions to define what happens when the trigger fires
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Action Button */}
                {selectedWorkflow.trigger && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => {
                        setEditingAction(null);
                        setShowActionDialog(true);
                      }}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Action
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TriggerConfigDialog
        isOpen={showTriggerDialog}
        onOpenChange={setShowTriggerDialog}
        onSave={handleSaveTrigger}
        initialTrigger={selectedWorkflow?.trigger || undefined}
      />

      <ActionConfigDialog
        isOpen={showActionDialog}
        onOpenChange={setShowActionDialog}
        onSave={handleSaveAction}
        initialAction={editingAction || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this workflow? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkflow} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
