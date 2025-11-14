// Threat Actors JavaScript Module
class ActorsManager {
    constructor() {
        this.apiBase = '/api/actors';
        this.currentPage = 0;
        this.pageSize = 10;
        this.filters = {};
        this.editingId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadActors();
    }

    setupEventListeners() {
        // Filter inputs
        document.getElementById('search-input').addEventListener('input', this.debounce(() => {
            this.filters.search = document.getElementById('search-input').value;
            this.currentPage = 0;
            this.loadActors();
        }, 300));

        document.getElementById('origin-filter').addEventListener('change', () => {
            this.filters.origin = document.getElementById('origin-filter').value;
            this.currentPage = 0;
            this.loadActors();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.filters.status = document.getElementById('status-filter').value;
            this.currentPage = 0;
            this.loadActors();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Pagination
        document.getElementById('prev-page').addEventListener('click', () => {
            if (this.currentPage > 0) {
                this.currentPage--;
                this.loadActors();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            this.currentPage++;
            this.loadActors();
        });

        // Modal controls
        document.getElementById('add-actor-btn').addEventListener('click', () => {
            this.openModal();
        });

        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('actor-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveActor();
        });

        // Close modal on outside click
        document.getElementById('actor-modal').addEventListener('click', (e) => {
            if (e.target.id === 'actor-modal') {
                this.closeModal();
            }
        });
    }

    async loadActors() {
        try {
            showLoading();
            const params = new URLSearchParams({
                limit: this.pageSize,
                offset: this.currentPage * this.pageSize,
                ...this.filters
            });

            const response = await fetch(`${this.apiBase}?${params}`);
            if (!response.ok) throw new Error('Failed to load actors');
            
            const data = await response.json();
            this.renderActors(data.data || []);
            this.updatePagination(data.meta || {});
            hideLoading();
        } catch (error) {
            console.error('Error loading actors:', error);
            showError('Failed to load threat actors');
            hideLoading();
        }
    }

    renderActors(actors) {
        const tbody = document.getElementById('actors-table-body');
        if (!tbody) return;

        if (actors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                        No threat actors found
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = actors.map(actor => `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <div>
                        <div class="font-medium text-white">${this.escapeHtml(actor.actorName || actor.name || 'Unknown')}</div>
                        ${actor.knownAliases && actor.knownAliases.length > 0 ? 
                            `<div class="text-sm text-gray-400">${actor.knownAliases.slice(0, 2).map(alias => this.escapeHtml(alias)).join(', ')}</div>` 
                            : ''}
                    </div>
                </td>
                <td class="px-6 py-4 text-gray-300">${this.escapeHtml(actor.origin || actor.motivation || 'Unknown')}</td>
                <td class="px-6 py-4 text-gray-300">${this.escapeHtml(actor.sophisticationLevel || actor.sophistication || 'Unknown')}</td>
                <td class="px-6 py-4 text-gray-300">${this.formatDate(actor.lastActivity || actor.lastSeen)}</td>
                <td class="px-6 py-4">
                    <span class="status-badge ${actor.isActive !== false ? 'status-active' : 'status-inactive'}">
                        ${actor.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="actorsManager.editActor('${actor._id}')" class="text-cyber-blue hover:text-opacity-80 text-sm">
                            Edit
                        </button>
                        <button onclick="actorsManager.deleteActor('${actor._id}')" class="text-threat-critical hover:text-opacity-80 text-sm">
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
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

    openModal(actor = null) {
        const modal = document.getElementById('actor-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('actor-form');
        
        if (actor) {
            this.editingId = actor.id;
            title.textContent = 'Edit Threat Actor';
            this.populateForm(actor);
        } else {
            this.editingId = null;
            title.textContent = 'Add Threat Actor';
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    closeModal() {
        const modal = document.getElementById('actor-modal');
        modal.classList.add('hidden');
        this.editingId = null;
    }

    populateForm(actor) {
        document.getElementById('actor-name').value = actor.name || '';
        document.getElementById('actor-origin').value = actor.origin || '';
        document.getElementById('actor-sophistication').value = actor.sophistication || 'Intermediate';
        document.getElementById('actor-status').value = actor.status || 'Active';
        document.getElementById('actor-description').value = actor.description || '';
    }

    async saveActor() {
        try {
            const formData = {
                name: document.getElementById('actor-name').value,
                origin: document.getElementById('actor-origin').value,
                sophistication: document.getElementById('actor-sophistication').value,
                status: document.getElementById('actor-status').value,
                description: document.getElementById('actor-description').value
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
                throw new Error(error.message || 'Failed to save actor');
            }

            this.closeModal();
            this.loadActors();
            showSuccess(this.editingId ? 'Actor updated successfully' : 'Actor created successfully');
        } catch (error) {
            console.error('Error saving actor:', error);
            showError(error.message);
        }
    }

    async editActor(id) {
        try {
            const response = await fetch(`${this.apiBase}/${id}`);
            if (!response.ok) throw new Error('Failed to load actor');
            
            const actor = await response.json();
            this.openModal(actor);
        } catch (error) {
            console.error('Error loading actor:', error);
            showError('Failed to load actor details');
        }
    }

    async deleteActor(id) {
        if (!confirm('Are you sure you want to delete this threat actor?')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete actor');
            }

            this.loadActors();
            showSuccess('Actor deleted successfully');
        } catch (error) {
            console.error('Error deleting actor:', error);
            showError(error.message);
        }
    }

    clearFilters() {
        this.filters = {};
        this.currentPage = 0;
        document.getElementById('search-input').value = '';
        document.getElementById('origin-filter').value = '';
        document.getElementById('status-filter').value = '';
        this.loadActors();
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric'
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
    window.actorsManager = new ActorsManager();
});