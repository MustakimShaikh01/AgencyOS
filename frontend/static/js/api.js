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
            if (typeof showToast === 'function') showToast(`Access Denied: ${error.message}`, 'error');
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
            if (typeof showToast === 'function') showToast(`Execution Failed: ${error.message}`, 'error');
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

    // Brain (New)
    async getBrainStats() {
        return this.getJSON('/brain/stats');
    }

    async getBrainEntries(type = null) {
        let url = '/brain/entries';
        if (type) url += `?type=${type}`;
        return this.getJSON(url);
    }

    async deleteBrainEntry(entryId) {
        try {
            const res = await fetch(`${this.baseUrl}/brain/entries/${entryId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`DELETE /brain/entries/${entryId} failed:`, error);
            if (typeof showToast === 'function') showToast(`Delete Failed: ${error.message}`, 'error');
            return null;
        }
    }

    // Portal (New)
    async publishPost(postData) {
        return this.postJSON('/portal/publish', postData);
    }

    async getPortalFeed() {
        return this.getJSON('/portal/feed');
    }

    // Human Review & Social (New)
    async getCompletedTasks() {
        return this.getJSON('/tasks/completed');
    }

    async rateTask(taskId, rating, feedback) {
        return this.postJSON(`/tasks/${taskId}/rate`, { rating, feedback });
    }

    async publishTask(taskId) {
        return this.postJSON(`/tasks/${taskId}/publish`, {});
    }

    async deleteTask(taskId) {
        try {
            const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error(`DELETE /tasks/${taskId} failed:`, error);
            if (typeof showToast === 'function') showToast(`Delete Failed: ${error.message}`, 'error');
            return null;
        }
    }

    async getSocialAccounts() {
        return this.getJSON('/social/accounts');
    }

    async verifySocial2FA(platform) {
        return this.postJSON(`/social/verify/${platform}`, {});
    }
}

const api = new ApiService();
