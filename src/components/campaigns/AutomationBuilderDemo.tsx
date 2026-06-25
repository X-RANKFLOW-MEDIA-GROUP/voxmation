/**
 * Automation Builder Demo/Example Component
 * Shows how to integrate and use the AutomationBuilder component
 */

import { useState, useCallback } from "react";
import AutomationBuilder from "./AutomationBuilder";
import automationClient from "../../services/automationClient";
import { Workflow } from "./types";
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function AutomationBuilderDemo() {
  const [savedWorkflows, setSavedWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Handle workflow save
   */
  const handleSaveWorkflow = useCallback(async (workflow: Workflow) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Validate workflow
      const validation = await automationClient.validateWorkflow(workflow);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(", ")}`);
      }

      // Save workflow
      const response = await automationClient.saveWorkflow(workflow);

      // Update local state
      setSavedWorkflows((prev) => {
        const index = prev.findIndex((w) => w.id === workflow.id);
        if (index >= 0) {
          return [...prev.slice(0, index), workflow, ...prev.slice(index + 1)];
        }
        return [...prev, workflow];
      });

      setSuccessMessage(
        `Workflow "${workflow.name}" saved successfully! (ID: ${response.workflowId})`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save workflow";
      setErrorMessage(message);
      console.error("Save workflow error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle errors from builder
   */
  const handleBuilderError = useCallback((error: string) => {
    setErrorMessage(error);
  }, []);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Automation Workflow Builder</h1>
        <p className="text-gray-600 mt-2">
          Create automated workflows with drag-and-drop triggers and actions
        </p>
      </div>

      {/* Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">Saving workflow...</AlertDescription>
        </Alert>
      )}

      {/* Builder */}
      <AutomationBuilder onSave={handleSaveWorkflow} onError={handleBuilderError} />

      {/* Saved Workflows Display */}
      {savedWorkflows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Workflows</CardTitle>
            <CardDescription>Workflows that have been saved and published</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedWorkflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-gray-600 text-sm mt-1">{workflow.description}</p>
                      )}
                      <div className="flex gap-6 mt-3 text-sm text-gray-500">
                        <span>ID: {workflow.id}</span>
                        <span>Status: {workflow.enabled ? "Enabled" : "Disabled"}</span>
                      </div>
                      {workflow.trigger && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Trigger: {workflow.trigger.description}
                          </p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {Object.entries(workflow.trigger.config).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {workflow.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Actions ({workflow.actions.length}):
                          </p>
                          <div className="space-y-2">
                            {workflow.actions.map((action, index) => (
                              <div key={action.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                <p className="font-medium">
                                  {index + 1}. {action.description}
                                </p>
                                <div className="mt-1 space-y-1">
                                  {Object.entries(action.config).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {workflow.stats && (
                        <div className="mt-3 pt-3 border-t flex gap-6">
                          <div className="text-xs">
                            <span className="text-gray-500">Triggered:</span>
                            <span className="font-semibold ml-1">{workflow.stats.triggered}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Completed:</span>
                            <span className="font-semibold ml-1">{workflow.stats.completed}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Failed:</span>
                            <span className="font-semibold ml-1">{workflow.stats.failed}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-3">
          <div>
            <p className="font-semibold text-blue-900 mb-2">1. Create a Workflow</p>
            <p className="text-blue-800">Click "New Workflow" to create a new automation workflow.</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">2. Add a Trigger</p>
            <p className="text-blue-800">
              Drag a trigger from the left sidebar to the canvas. Configure what event should start
              your workflow.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">3. Add Actions</p>
            <p className="text-blue-800">
              Drag actions from the sidebar or click "Add Action". These define what happens when the
              trigger fires.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900 mb-2">4. Save and Enable</p>
            <p className="text-blue-800">
              Click "Save Workflow" to publish your automation, then enable it to start using it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Example Workflows */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg">Example Workflows</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div className="bg-white p-3 rounded border border-amber-100">
            <p className="font-semibold text-amber-900 mb-2">Welcome New Leads</p>
            <p className="text-amber-800">
              Trigger: New Contact (web_form) → Send welcome email + Add to newsletter tag
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-amber-100">
            <p className="font-semibold text-amber-900 mb-2">Qualified Lead Follow-up</p>
            <p className="text-amber-800">
              Trigger: Stage Change (Prospect → Qualified) → Send email + Create opportunity
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-amber-100">
            <p className="font-semibold text-amber-900 mb-2">Priority Contact Alert</p>
            <p className="text-amber-800">
              Trigger: Tag Added (VIP) → Send SMS notification to sales team
            </p>
          </div>
          <div className="bg-white p-3 rounded border border-amber-100">
            <p className="font-semibold text-amber-900 mb-2">Follow-up Reminder</p>
            <p className="text-amber-800">
              Trigger: Time-Based (2 days after stage change) → Send follow-up email
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
