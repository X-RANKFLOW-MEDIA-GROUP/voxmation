/**
 * Type definitions for Automation Workflow Builder
 */

/**
 * Supported trigger types
 */
export type TriggerType = "new_contact" | "stage_change" | "tag_added" | "time_based";

/**
 * Supported action types
 */
export type ActionType = "send_email" | "send_sms" | "update_tag" | "create_opportunity";

/**
 * Trigger configuration interface
 */
export interface Trigger {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
  description?: string;
}

/**
 * Action configuration interface
 */
export interface Action {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  description?: string;
}

/**
 * Workflow statistics
 */
export interface WorkflowStats {
  triggered: number;
  completed: number;
  failed: number;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: Trigger | null;
  actions: Action[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats?: WorkflowStats;
}

/**
 * Draggable item type
 */
export interface DraggedItem {
  type: "trigger" | "action";
  itemType: TriggerType | ActionType;
}

/**
 * Trigger configuration by type
 */
export interface TriggerConfig {
  new_contact?: {
    source?: "web_form" | "import" | "api";
  };
  stage_change?: {
    fromStage?: string;
    toStage?: string;
  };
  tag_added?: {
    tagName?: string;
  };
  time_based?: {
    delayDays?: number;
    delayHours?: number;
  };
}

/**
 * Action configuration by type
 */
export interface ActionConfig {
  send_email?: {
    templateId?: string;
    recipient?: "contact_email" | "owner_email";
  };
  send_sms?: {
    phoneField?: string;
    messageTemplate?: string;
  };
  update_tag?: {
    tagName?: string;
    action?: "add" | "remove";
  };
  create_opportunity?: {
    opportunityName?: string;
    stage?: string;
    value?: number;
  };
}

/**
 * Trigger template definition
 */
export interface TriggerTemplate {
  icon: React.ReactNode;
  label: string;
  fields: string[];
}

/**
 * Action template definition
 */
export interface ActionTemplate {
  icon: React.ReactNode;
  label: string;
  fields: string[];
}

/**
 * Execution log entry
 */
export interface ExecutionLogEntry {
  id: string;
  workflowId: string;
  contactId: string;
  triggeredAt: Date;
  completedAt?: Date;
  status: "pending" | "completed" | "failed";
  actionResults: {
    actionId: string;
    type: ActionType;
    success: boolean;
    error?: string;
  }[];
}

/**
 * API request/response types
 */

export interface SaveWorkflowRequest {
  workflow: Workflow;
}

export interface SaveWorkflowResponse {
  success: boolean;
  workflowId: string;
  message?: string;
}

export interface GetWorkflowResponse {
  workflow: Workflow;
}

export interface ListWorkflowsResponse {
  workflows: Workflow[];
  total: number;
}

export interface DeleteWorkflowRequest {
  workflowId: string;
}

export interface DeleteWorkflowResponse {
  success: boolean;
}

export interface ExecuteWorkflowRequest {
  workflowId: string;
  contactId: string;
}

export interface ExecuteWorkflowResponse {
  success: boolean;
  executionId: string;
  message?: string;
}

/**
 * Component props types
 */

export interface AutomationBuilderProps {
  onSave?: (workflow: Workflow) => void;
  onError?: (error: string) => void;
}

export interface TriggerConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (trigger: Trigger) => void;
  initialTrigger?: Trigger;
}

export interface ActionConfigDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (action: Action) => void;
  initialAction?: Action;
}

export interface WorkflowStepProps {
  trigger: Trigger;
  actions: Action[];
  onEditTrigger: (trigger: Trigger) => void;
  onEditAction: (action: Action) => void;
  onDeleteTrigger: () => void;
  onDeleteAction: (id: string) => void;
}

export interface DraggableItemProps {
  type: "trigger" | "action";
  itemType: TriggerType | ActionType;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, item: DraggedItem) => void;
}
