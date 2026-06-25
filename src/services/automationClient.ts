/**
 * Automation Workflow API Client
 * Handles all API calls for workflow management and execution
 */

import {
  Workflow,
  SaveWorkflowRequest,
  SaveWorkflowResponse,
  GetWorkflowResponse,
  ListWorkflowsResponse,
  DeleteWorkflowRequest,
  DeleteWorkflowResponse,
  ExecuteWorkflowRequest,
  ExecuteWorkflowResponse,
  ExecutionLogEntry,
} from "../components/campaigns/types";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

/**
 * Automation Workflow Client
 */
class AutomationClient {
  /**
   * Save a workflow (create or update)
   */
  async saveWorkflow(workflow: Workflow): Promise<SaveWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflow }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Save workflow error:", error);
      throw error;
    }
  }

  /**
   * Get a single workflow
   */
  async getWorkflow(workflowId: string): Promise<GetWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get workflow error:", error);
      throw error;
    }
  }

  /**
   * List all workflows with optional pagination and filtering
   */
  async listWorkflows(options?: {
    limit?: number;
    offset?: number;
    enabled?: boolean;
  }): Promise<ListWorkflowsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (options?.limit) searchParams.append("limit", options.limit.toString());
      if (options?.offset) searchParams.append("offset", options.offset.toString());
      if (options?.enabled !== undefined) searchParams.append("enabled", options.enabled.toString());

      const response = await fetch(`${BASE_URL}/workflows?${searchParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list workflows: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("List workflows error:", error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<DeleteWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Delete workflow error:", error);
      throw error;
    }
  }

  /**
   * Execute a workflow for a specific contact
   */
  async executeWorkflow(
    workflowId: string,
    contactId: string
  ): Promise<ExecuteWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Execute workflow error:", error);
      throw error;
    }
  }

  /**
   * Get execution logs for a workflow
   */
  async getExecutionLogs(
    workflowId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: "pending" | "completed" | "failed";
    }
  ): Promise<{ logs: ExecutionLogEntry[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (options?.limit) searchParams.append("limit", options.limit.toString());
      if (options?.offset) searchParams.append("offset", options.offset.toString());
      if (options?.status) searchParams.append("status", options.status);

      const response = await fetch(
        `${BASE_URL}/workflows/${workflowId}/logs?${searchParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get execution logs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get execution logs error:", error);
      throw error;
    }
  }

  /**
   * Toggle workflow enabled/disabled state
   */
  async toggleWorkflow(workflowId: string, enabled: boolean): Promise<SaveWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Toggle workflow error:", error);
      throw error;
    }
  }

  /**
   * Validate workflow configuration
   */
  async validateWorkflow(workflow: Workflow): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflow }),
      });

      if (!response.ok) {
        throw new Error(`Failed to validate workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Validate workflow error:", error);
      throw error;
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflowId: string): Promise<{
    triggered: number;
    completed: number;
    failed: number;
    avgExecutionTime: number;
  }> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflow stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Get workflow stats error:", error);
      throw error;
    }
  }

  /**
   * Duplicate a workflow
   */
  async duplicateWorkflow(workflowId: string): Promise<SaveWorkflowResponse> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/${workflowId}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to duplicate workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Duplicate workflow error:", error);
      throw error;
    }
  }

  /**
   * Test a workflow with sample data
   */
  async testWorkflow(
    workflow: Workflow,
    sampleContactId: string
  ): Promise<{
    success: boolean;
    executionId: string;
    results: {
      actionId: string;
      type: string;
      success: boolean;
      error?: string;
    }[];
  }> {
    try {
      const response = await fetch(`${BASE_URL}/workflows/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workflow, sampleContactId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to test workflow: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Test workflow error:", error);
      throw error;
    }
  }
}

export default new AutomationClient();
