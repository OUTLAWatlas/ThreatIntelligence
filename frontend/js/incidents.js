// Incidents JavaScript Module
class IncidentsManager {
    constructor() {
        this.apiBase = '/api/incidents';
        this.currentPage = 0;
        this.pageSize = 10;
        this.filters = {};
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadIncidents();
    }

    setupEventListeners() {
        // Filter inputs
        document.getElementById('search-input').addEventListener('input', this.debounce(() => {
            this.filters.search = document.getElementById('search-input').value;
            this.currentPage = 0;
            this.loadIncidents();
        }, 300));

        document.getElementById('severity-filter').addEventListener('change', () => {
            this.filters.severity = document.getElementById('severity-filter').value;
            this.currentPage = 0;
            this.loadIncidents();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filters.status = document.getElementById('status-filter').value;
            this.currentPage = 0;
            this.loadIncidents();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadIncidents();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.currentPage++;
            this.loadIncidents();
        });

        // Modal controls
        document.getElementById('add-incident-btn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('incident-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIncident();
        });

        // Close modal on outside click
        document.getElementById('incident-modal').addEventListener('click', (e) => {
            if (e.target.id === 'incident-modal') {
                this.closeModal();
            }
        });
    }

    async loadIncidents() {
        try {
            showLoading();
            const params = new URLSearchParams({
                limit: this.pageSize,
                offset: this.currentPage * this.pageSize,
                ...this.filters
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            if (!response.ok) throw new Error('Failed to load incidents');
            
            const data = await response.json();
            this.renderIncidents(data.data || []);
            this.updatePagination(data.meta || {});
            hideLoading();
        } catch (error) {
            console.error('Error loading incidents:', error);
            showError('Failed to load incidents');
            hideLoading();
        }
    }

    renderIncidents(incidents) {
        const tbody = document.getElementById('incidents-table-body');
        if (!tbody) return;

        if (incidents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                        No incidents found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = incidents.map(incident => `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <div>
                        <div class="font-medium text-white">${this.escapeHtml(incident.incidentTitle || incident.title || 'Untitled')}</div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge severity-${incident.severity?.toLowerCase() || 'medium'}">
                        ${incident.severity || 'Unknown'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${this.getStatusClass(incident.status)}">
                        ${incident.status || 'Unknown'}
                    </span>
                </td>
                <td class="px-6 py-4 text-gray-300">${this.escapeHtml(incident.linkedActors && incident.linkedActors.length > 0 ? incident.linkedActors.map(a => a.actorName || a).join(', ') : 'Unknown')}</td>
                <td class="px-6 py-4 text-gray-300">${this.formatDate(incident.reportedDate || incident.date_discovered)}</td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="incidentsManager.editIncident('${incident._id}')" class="text-cyber-blue hover:text-opacity-80 text-sm">
                            Edit
                        </button>
                        <button onclick="incidentsManager.deleteIncident('${incident._id}')" class="text-threat-critical hover:text-opacity-80 text-sm">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'severity-critical';
            case 'investigating': return 'severity-medium';
            case 'contained': return 'severity-low';
            case 'resolved': return 'status-active';
            default: return 'status-inactive';
        }
    }

    updatePagination(meta) {
        const showingStart = document.getElementById('showing-start');
        const showingEnd = document.getElementById('showing-end');
        const totalCount = document.getElementById('total-count');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        const start = meta.offset + 1;
        const end = Math.min(meta.offset + meta.limit, meta.total);

        if (showingStart) showingStart.textContent = meta.total > 0 ? start : 0;
        if (showingEnd) showingEnd.textContent = end;
        if (totalCount) totalCount.textContent = meta.total || 0;

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 0;
            prevBtn.classList.toggle('opacity-50', this.currentPage === 0);
        }

        if (nextBtn) {
            nextBtn.disabled = !meta.hasMore;
            nextBtn.classList.toggle('opacity-50', !meta.hasMore);
        }
    }

    openModal(incident = null) {
        const modal = document.getElementById('incident-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('incident-form');
        
        if (incident) {
            this.editingId = incident.id;
            title.textContent = 'Edit Incident';
            this.populateForm(incident);
        } else {
            this.editingId = null;
            title.textContent = 'Add Incident';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('incident-modal');
        modal.classList.add('hidden');
        this.editingId = null;
    }

    populateForm(incident) {
        document.getElementById('incident-title').value = incident.title || '';
        document.getElementById('incident-severity').value = incident.severity || 'Medium';
        document.getElementById('incident-actor').value = incident.threat_actor || '';
        document.getElementById('incident-vector').value = incident.attack_vector || '';
        document.getElementById('incident-analyst').value = incident.analyst || '';
        document.getElementById('incident-organization').value = incident.organization || '';
        document.getElementById('incident-description').value = incident.description || '';
    }

    async saveIncident() {
        try {
            const formData = {
                title: document.getElementById('incident-title').value,
                severity: document.getElementById('incident-severity').value,
                threat_actor: document.getElementById('incident-actor').value,
                attack_vector: document.getElementById('incident-vector').value,
                analyst: document.getElementById('incident-analyst').value,
                organization: document.getElementById('incident-organization').value,
                description: document.getElementById('incident-description').value
            };

            const url = this.editingId ? `${this.apiBase}/${this.editingId}` : this.apiBase;
            const method = this.editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save incident');
            }

            this.closeModal();
            this.loadIncidents();
            showSuccess(this.editingId ? 'Incident updated successfully' : 'Incident created successfully');
        } catch (error) {
            console.error('Error saving incident:', error);
            showError(error.message);
        }
    }

    async editIncident(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            if (!response.ok) throw new Error('Failed to load incident');
            
            const incident = await response.json();
            this.openModal(incident);
        } catch (error) {
            console.error('Error loading incident:', error);
            showError('Failed to load incident details');
        }
    }

    async deleteIncident(id) {
        if (!confirm('Are you sure you want to delete this incident?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete incident');
            }

            this.loadIncidents();
            showSuccess('Incident deleted successfully');
        } catch (error) {
            console.error('Error deleting incident:', error);
            showError(error.message);
        }
    }

    clearFilters() {
        this.filters = {};
        this.currentPage = 0;
        document.getElementById('search-input').value = '';
        document.getElementById('severity-filter').value = '';
        document.getElementById('status-filter').value = '';
        this.loadIncidents();
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Utility functions
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.remove('hidden');
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
}

function showError(message) {
    console.error(message);
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    console.log(message);
    // Could implement a toast notification here
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.incidentsManager = new IncidentsManager();
});