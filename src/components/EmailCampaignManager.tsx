/**
 * Email Campaign Manager Component
 * React component for managing email campaigns
 */

import { useState, useCallback, useEffect } from "react";
import campaignClient, { EmailCampaign, CampaignStatsResponse } from "../services/campaignClient";

interface EmailCampaignManagerProps {
  onCampaignCreated?: (campaign: EmailCampaign) => void;
  onError?: (error: string) => void;
}

export default function EmailCampaignManager({ onCampaignCreated, onError }: EmailCampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<CampaignStatsResponse | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    htmlBody: "",
    textBody: "",
    fromEmail: "",
    fromName: "Voxmation",
    recipients: "[{\"email\": \"\", \"name\": \"\", \"variables\": {}}]",
  });

  // Load campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Monitor selected campaign
  useEffect(() => {
    if (!selectedCampaign || !monitoring) return;

    const stopMonitoring = campaignClient.monitorCampaign(selectedCampaign.id, (newStats) => {
      setStats(newStats);
    });

    return () => stopMonitoring();
  }, [selectedCampaign?.id, monitoring]);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await campaignClient.getCampaigns({ limit: 50 });
      setCampaigns(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load campaigns";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const handleCreateCampaign = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        setLoading(true);

        let recipients = [];
        try {
          recipients = JSON.parse(formData.recipients);
        } catch {
          throw new Error("Invalid recipients JSON format");
        }

        const { campaign } = await campaignClient.createCampaign({
          name: formData.name,
          subject: formData.subject,
          htmlBody: formData.htmlBody,
          textBody: formData.textBody,
          fromEmail: formData.fromEmail,
          fromName: formData.fromName,
          recipients,
        });

        setCampaigns([campaign, ...campaigns]);
        setShowForm(false);
        setFormData({
          name: "",
          subject: "",
          htmlBody: "",
          textBody: "",
          fromEmail: "",
          fromName: "Voxmation",
          recipients: "[{\"email\": \"\", \"name\": \"\", \"variables\": {}}]",
        });

        onCampaignCreated?.(campaign);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create campaign";
        onError?.(message);
      } finally {
        setLoading(false);
      }
    },
    [formData, campaigns, onCampaignCreated, onError]
  );

  const handleSendCampaign = useCallback(async () => {
    if (!selectedCampaign) return;

    try {
      setLoading(true);
      await campaignClient.sendCampaign(selectedCampaign.id, { immediate: true });

      // Refresh campaign data
      const { campaign } = await campaignClient.getCampaign(selectedCampaign.id);
      setSelectedCampaign(campaign);

      // Start monitoring
      setMonitoring(true);

      // Reload campaigns list
      loadCampaigns();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send campaign";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign, loadCampaigns, onError]);

  const handlePauseCampaign = useCallback(async () => {
    if (!selectedCampaign) return;

    try {
      setLoading(true);
      await campaignClient.pauseCampaign(selectedCampaign.id);

      // Refresh campaign data
      const { campaign } = await campaignClient.getCampaign(selectedCampaign.id);
      setSelectedCampaign(campaign);
      setMonitoring(false);

      // Reload campaigns list
      loadCampaigns();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to pause campaign";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign, loadCampaigns, onError]);

  const handleDeleteCampaign = useCallback(async () => {
    if (!selectedCampaign) return;

    try {
      setLoading(true);
      await campaignClient.deleteCampaign(selectedCampaign.id);

      setSelectedCampaign(null);
      setStats(null);
      setMonitoring(false);

      // Reload campaigns list
      loadCampaigns();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete campaign";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCampaign, loadCampaigns, onError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "sending":
        return "bg-yellow-100 text-yellow-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Rascunho",
      scheduled: "Agendado",
      sending: "Enviando",
      sent: "Enviado",
      paused: "Pausado",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campanhas de Email</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {showForm ? "Cancelar" : "Nova Campanha"}
        </button>
      </div>

      {/* Create Campaign Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Criar Nova Campanha</h3>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Campanha</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Q1 Product Launch"
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email do Remetente</label>
              <input
                type="email"
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                placeholder="campaigns@voxmation.com"
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nome do Remetente</label>
              <input
                type="text"
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                placeholder="Voxmation"
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assunto (com {{variáveis}})</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Hello {{name}}, check out {{productName}}"
                required
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Corpo HTML</label>
              <textarea
                value={formData.htmlBody}
                onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                placeholder="<p>Olá {{name}}</p>"
                required
                rows={6}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Corpo de Texto (opcional)</label>
              <textarea
                value={formData.textBody}
                onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                placeholder="Versão em texto simples"
                rows={4}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Destinatários (JSON)</label>
              <textarea
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                required
                rows={4}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: [{"{"}"email": "user@example.com", "name": "User", "variables": {"{"}"name": "John"{"}"}"]
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Criando..." : "Criar Campanha"}
            </button>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Destinatários</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Enviados</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Data</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {loading ? "Carregando..." : "Nenhuma campanha encontrada"}
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{campaign.name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {getStatusLabel(campaign.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{campaign.stats.total}</td>
                    <td className="px-6 py-4 text-sm">{campaign.stats.sent}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setMonitoring(false);
                          setStats(null);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Details */}
      {selectedCampaign && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold">{selectedCampaign.name}</h3>
              <p className="text-gray-600">{selectedCampaign.subject}</p>
            </div>
            <button
              onClick={() => {
                setSelectedCampaign(null);
                setStats(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-2xl font-bold text-green-600">{stats.stats.sent}</div>
                <div className="text-sm text-gray-600">Enviados</div>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <div className="text-2xl font-bold text-red-600">{stats.stats.failed}</div>
                <div className="text-sm text-gray-600">Falhados</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded">
                <div className="text-2xl font-bold text-yellow-600">{stats.stats.pending}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {selectedCampaign.status === "draft" && (
              <button
                onClick={handleSendCampaign}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Enviar Campanha"}
              </button>
            )}

            {selectedCampaign.status === "sending" && (
              <button
                onClick={handlePauseCampaign}
                disabled={loading}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition disabled:opacity-50"
              >
                {loading ? "Pausando..." : "Pausar"}
              </button>
            )}

            {(selectedCampaign.status === "draft" || selectedCampaign.status === "paused") && (
              <button
                onClick={handleDeleteCampaign}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? "Deletando..." : "Deletar"}
              </button>
            )}

            {selectedCampaign.status === "sending" && (
              <button
                onClick={() => setMonitoring(!monitoring)}
                className={`px-4 py-2 rounded transition ${
                  monitoring ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {monitoring ? "Monitorando..." : "Monitorar"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
