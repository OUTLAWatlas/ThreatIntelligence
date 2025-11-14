// Indicators JavaScript Module
class IndicatorsManager {
    constructor() {
        this.apiBase = '/api/indicators';
        this.currentPage = 0;
        this.pageSize = 10;
        this.filters = {};
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadIndicators();
    }

    setupEventListeners() {
        // Filter inputs
        document.getElementById('search-input').addEventListener('input', this.debounce(() => {
            this.filters.search = document.getElementById('search-input').value;
            this.currentPage = 0;
            this.loadIndicators();
        }, 300));

        document.getElementById('type-filter').addEventListener('change', () => {
            this.filters.type = document.getElementById('type-filter').value;
            this.currentPage = 0;
            this.loadIndicators();
        });

        document.getElementById('confidence-filter').addEventListener('change', () => {
            this.filters.confidence = document.getElementById('confidence-filter').value;
            this.currentPage = 0;
            this.loadIndicators();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filters.status = document.getElementById('status-filter').value;
            this.currentPage = 0;
            this.loadIndicators();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadIndicators();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.currentPage++;
            this.loadIndicators();
        });

        // Modal controls
        document.getElementById('add-indicator-btn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('indicator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveIndicator();
        });

        // Close modal on outside click
        document.getElementById('indicator-modal').addEventListener('click', (e) => {
            if (e.target.id === 'indicator-modal') {
                this.closeModal();
            }
        });
    }

    async loadIndicators() {
        try {
            showLoading();
            const params = new URLSearchParams({
                limit: this.pageSize,
                offset: this.currentPage * this.pageSize,
                ...this.filters
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            if (!response.ok) throw new Error('Failed to load indicators');
            
            const data = await response.json();
            this.renderIndicators(data.data || []);
            this.updatePagination(data.meta || {});
            hideLoading();
        } catch (error) {
            console.error('Error loading indicators:', error);
            showError('Failed to load indicators');
            hideLoading();
        }
    }

    renderIndicators(indicators) {
        const tbody = document.getElementById('indicators-table-body');
        if (!tbody) return;

        if (indicators.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                        No indicators found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = indicators.map(indicator => `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">${this.escapeHtml(indicator.indicatorType || indicator.type || 'Unknown')}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="font-mono text-sm text-white break-all">${this.escapeHtml(indicator.value || 'N/A')}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-full bg-gray-700 rounded-full h-2 mr-2">
                            <div class="h-2 rounded-full ${this.getConfidenceColor(indicator.confidence || 0)}" 
                                 style="width: ${indicator.confidence || 0}%"></div>
                        </div>
                        <span class="text-sm text-gray-300">${indicator.confidence || 0}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-gray-300">${this.escapeHtml(indicator.source?.sourceName || indicator.source || 'Unknown')}</td>
                <td class="px-6 py-4 text-gray-300">${this.formatDate(indicator.lastSeen || indicator.firstSeen)}</td>
                <td class="px-6 py-4">
                    <span class="status-badge ${this.getStatusClass(indicator.isActive !== false ? 'active' : 'inactive')}">
                        ${indicator.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="indicatorsManager.editIndicator('${indicator._id}')" class="text-cyber-blue hover:text-opacity-80 text-sm">
                            Edit
                        </button>
                        <button onclick="indicatorsManager.deleteIndicator('${indicator._id}')" class="text-threat-critical hover:text-opacity-80 text-sm">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getConfidenceColor(confidence) {
        if (confidence >= 90) return 'bg-threat-low';
        if (confidence >= 70) return 'bg-threat-medium';
        if (confidence >= 50) return 'bg-threat-high';
        return 'bg-threat-critical';
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'investigating': return 'severity-medium';
            case 'inactive': return 'status-inactive';
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

    openModal(indicator = null) {
        const modal = document.getElementById('indicator-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('indicator-form');
        
        if (indicator) {
            this.editingId = indicator.id;
            title.textContent = 'Edit Indicator';
            this.populateForm(indicator);
        } else {
            this.editingId = null;
            title.textContent = 'Add Indicator';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('indicator-modal');
        modal.classList.add('hidden');
        this.editingId = null;
    }

    populateForm(indicator) {
        document.getElementById('indicator-type').value = indicator.type || 'IP Address';
        document.getElementById('indicator-value').value = indicator.value || '';
        document.getElementById('indicator-confidence').value = indicator.confidence || 50;
        document.getElementById('indicator-source').value = indicator.source || '';
        document.getElementById('indicator-tlp').value = indicator.tlp || 'WHITE';
        document.getElementById('indicator-description').value = indicator.description || '';
    }

    async saveIndicator() {
        try {
            const formData = {
                type: document.getElementById('indicator-type').value,
                value: document.getElementById('indicator-value').value,
                confidence: parseInt(document.getElementById('indicator-confidence').value),
                source: document.getElementById('indicator-source').value,
                tlp: document.getElementById('indicator-tlp').value,
                description: document.getElementById('indicator-description').value
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
                throw new Error(error.message || 'Failed to save indicator');
            }

            this.closeModal();
            this.loadIndicators();
            showSuccess(this.editingId ? 'Indicator updated successfully' : 'Indicator created successfully');
        } catch (error) {
            console.error('Error saving indicator:', error);
            showError(error.message);
        }
    }

    async editIndicator(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            if (!response.ok) throw new Error('Failed to load indicator');
            
            const indicator = await response.json();
            this.openModal(indicator);
        } catch (error) {
            console.error('Error loading indicator:', error);
            showError('Failed to load indicator details');
        }
    }

    async deleteIndicator(id) {
        if (!confirm('Are you sure you want to delete this indicator?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete indicator');
            }

            this.loadIndicators();
            showSuccess('Indicator deleted successfully');
        } catch (error) {
            console.error('Error deleting indicator:', error);
            showError(error.message);
        }
    }

    clearFilters() {
        this.filters = {};
        this.currentPage = 0;
        document.getElementById('search-input').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('confidence-filter').value = '';
        document.getElementById('status-filter').value = '';
        this.loadIndicators();
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
    window.indicatorsManager = new IndicatorsManager();
});