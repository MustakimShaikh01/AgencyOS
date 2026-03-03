/**
 * API Service class to handle all REST requests to FastAPI backend
 */
class ApiService {
    constructor(baseUrl = '/api/v1') {
        this.baseUrl = baseUrl;
    }

    async getJSON(endpoint) {
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            return null;
        }
    }

    async postJSON(endpoint, data) {
        try {
            const res = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            return null;
        }
    }

    // Campaigns
    async getCampaigns(limit = 20) {
        return this.getJSON(`/campaigns?limit=${limit}`);
    }

    async createCampaign(campaignData) {
        return this.postJSON('/campaigns', campaignData);
    }

    async runCampaign(id) {
        return this.postJSON(`/campaigns/${id}/run`, {});
    }

    async getCampaignTasks(id) {
        return this.getJSON(`/campaigns/${id}/tasks`);
    }

    // Agents
    async getAgents() {
        return this.getJSON('/agents');
    }

    // Tasks
    async getTasks(limit = 20) {
        return this.getJSON(`/tasks?limit=${limit}`);
    }

    // Analytics
    async getModelUsage() {
        return this.getJSON('/analytics/model-usage');
    }

    async getAgentPerformance() {
        return this.getJSON('/analytics/agent-performance');
    }
}

const api = new ApiService();
