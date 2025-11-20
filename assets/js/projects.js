let data = Storage.load();
let currentSearchTerm = '';
let currentSortOption = 'newest';

// Khởi tạo trang dự án
function initProjectsPage() {
    renderProjectList();
    attachProjectsEventListeners();
    setupSearchAndSort();
}

// Thiết lập tìm kiếm và sắp xếp
function setupSearchAndSort() {
    // Tìm kiếm
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim().toLowerCase();
        renderProjectList();
        updateSearchResultsInfo();
    });

    // Sắp xếp
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        currentSortOption = e.target.value;
        renderProjectList();
    });

    // Clear search
    window.clearSearch = () => {
        searchInput.value = '';
        currentSearchTerm = '';
        renderProjectList();
        updateSearchResultsInfo();
    };
}

// Lọc và sắp xếp dự án
function getFilteredAndSortedProjects() {
    let filteredProjects = [...data.projects];

    // Lọc theo từ khóa tìm kiếm
    if (currentSearchTerm) {
        filteredProjects = filteredProjects.filter(project => 
            project.name.toLowerCase().includes(currentSearchTerm) ||
            (project.description && project.description.toLowerCase().includes(currentSearchTerm)) ||
            (project.mainAssignee && project.mainAssignee.toLowerCase().includes(currentSearchTerm))
        );
    }

    // Sắp xếp
    filteredProjects.sort((a, b) => {
        switch (currentSortOption) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
                
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
                
            case 'priority-high':
                const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
                
            case 'priority-low':
                const priorityOrderLow = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
                return priorityOrderLow[a.priority] - priorityOrderLow[b.priority];
                
            case 'name-asc':
                return a.name.localeCompare(b.name);
                
            case 'name-desc':
                return b.name.localeCompare(a.name);
                
            case 'progress-high':
                return ProjectManager.calculateProjectProgress(b) - ProjectManager.calculateProjectProgress(a);
                
            case 'progress-low':
                return ProjectManager.calculateProjectProgress(a) - ProjectManager.calculateProjectProgress(b);
                
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    return filteredProjects;
}

// Render danh sách dự án (ĐÃ SỬA)
function renderProjectList() {
    const container = document.getElementById('projectsContainer');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    container.innerHTML = "";

    ProjectManager.updateOverdueStatuses();

    const filteredProjects = getFilteredAndSortedProjects();

    // Hiển thị nút clear search
    if (currentSearchTerm) {
        clearSearchBtn.style.display = 'block';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    if (filteredProjects.length === 0) {
        if (currentSearchTerm) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Không tìm thấy dự án phù hợp</h3>
                    <p>Không có dự án nào khớp với từ khóa "<strong>${currentSearchTerm}</strong>"</p>
                    <button onclick="clearSearch()" class="btn-secondary">Xóa tìm kiếm</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Chưa có dự án nào</h3>
                    <p>Hãy tạo dự án đầu tiên để bắt đầu quản lý công việc!</p>
                    <button onclick="showCreateProjectModal()" class="btn-primary">Tạo dự án đầu tiên</button>
                </div>
            `;
        }
        return;
    }

    filteredProjects.forEach(project => {
        const progress = ProjectManager.calculateProjectProgress(project);
        const isOverdue = ProjectManager.isProjectOverdue(project);
        const priorityIcon = ProjectManager.getPriorityIcon(project.priority);
        const priorityColor = ProjectManager.getPriorityColor(project.priority);
        
        const div = document.createElement("div");
        div.className = `project-item box ${isOverdue ? 'overdue' : ''}`;
        div.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <div class="project-title">
                        <span class="priority-icon" style="color: ${priorityColor}">${priorityIcon}</span>
                        <strong>${escapeHtml(project.name)}</strong>
                    </div>
                    <div class="project-meta">
                        ${project.mainAssignee ? `<span class="project-assignee">👤 ${escapeHtml(project.mainAssignee)}</span>` : ''}
                        ${project.deadline ? `<span class="project-deadline ${isOverdue ? 'overdue' : ''}">📅 ${formatDate(project.deadline)} ${isOverdue ? '(TRỄ HẠN)' : ''}</span>` : ''}
                        <span class="priority-badge" style="background: ${priorityColor}">${project.priority.toUpperCase()}</span>
                        <span class="project-date">📋 ${formatDate(project.createdAt)}</span>
                        ${isOverdue ? '<span class="badge overdue">TRỄ HẠN</span>' : ''}
                    </div>
                    ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
                </div>
                <div class="project-actions">
                    <button class="btn-view-project" data-project-id="${project.id}">
                        Xem chi tiết
                    </button>
                    <button class="btn-delete-project" 
                            data-project-id="${project.id}"
                            data-project-name="${escapeHtml(project.name)}">
                        Xóa
                    </button>
                </div>
            </div>
            <div class="project-progress">
                <div class="progress-info">
                    <span class="progress-text">Tiến độ: ${progress}%</span>
                    <span class="progress-stages">${project.stages ? project.stages.length : 0} giai đoạn</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${progress === 100 ? 'completed' : ''}" 
                         style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });

    // Gắn event listeners sau khi render
    attachProjectEventListeners();
}

// Cập nhật thông tin kết quả tìm kiếm
function updateSearchResultsInfo() {
    const infoElement = document.getElementById('searchResultsInfo');
    const filteredProjects = getFilteredAndSortedProjects();
    
    if (currentSearchTerm && data.projects.length > 0) {
        infoElement.style.display = 'block';
        infoElement.innerHTML = `
            Tìm thấy <strong>${filteredProjects.length}</strong> dự án phù hợp với "<strong>${currentSearchTerm}</strong>"
            ${filteredProjects.length < data.projects.length ? ` (trên tổng số ${data.projects.length} dự án)` : ''}
        `;
    } else {
        infoElement.style.display = 'none';
    }
}

// Event listeners cho các project item
function attachProjectEventListeners() {
    // Xem chi tiết dự án
    document.querySelectorAll('.btn-view-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.target.dataset.projectId;
            // LƯU TRANG HIỆN TẠI VÀO LOCALSTORAGE
            localStorage.setItem('lastVisitedPage', 'projects.html');
            window.location.href = `detail.html?id=${projectId}&from=projects.html`;
        });
    });

    // Xóa dự án
    document.querySelectorAll('.btn-delete-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.target.dataset.projectId;
            const projectName = e.target.dataset.projectName;
            deleteProject(projectId, projectName);
        });
    });
}

// Event listeners cho trang dự án (các phần khác)
function attachProjectsEventListeners() {
    // Có thể thêm các event listeners khác ở đây nếu cần
}

// Xóa dự án
function deleteProject(projectId, projectName) {
    if (confirm(`Bạn có chắc muốn xóa dự án "${projectName}"?`)) {
        data.projects = data.projects.filter(p => p.id !== projectId);
        Storage.save(data);
        renderProjectList();
        showNotification(`Đã xóa dự án "${projectName}"`, 'success');
    }
}

// Hiển thị modal tạo dự án
function showCreateProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Tạo dự án mới</h3>
            <form id="createProjectForm">
                <div class="form-group">
                    <label>Tên dự án *</label>
                    <input type="text" id="projectName" placeholder="Nhập tên dự án..." required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Người phụ trách</label>
                        <input type="text" id="projectAssignee" placeholder="Tên người phụ trách...">
                    </div>
                    <div class="form-group">
                        <label>Độ ưu tiên</label>
                        <select id="projectPriority">
                            <option value="low">Thấp</option>
                            <option value="medium" selected>Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Deadline dự án</label>
                    <input type="date" id="projectDeadline">
                </div>
                
                <div class="form-group">
                    <label>Mô tả dự án</label>
                    <textarea id="projectDescription" placeholder="Mô tả ngắn về dự án..." rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Hủy</button>
                    <button type="submit">Tạo dự án</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('createProjectForm').addEventListener('submit', (e) => {
        e.preventDefault();
        createProjectFromModal();
    });
}

// Tạo dự án từ modal
function createProjectFromModal() {
    const projectData = {
        name: document.getElementById('projectName').value.trim(),
        mainAssignee: document.getElementById('projectAssignee').value.trim(),
        priority: document.getElementById('projectPriority').value,
        deadline: document.getElementById('projectDeadline').value,
        description: document.getElementById('projectDescription').value.trim()
    };
    
    if (!projectData.name) {
        alert("Bạn chưa nhập tên dự án.");
        return;
    }
    
    // Tạo dự án mới
    const newProject = ProjectManager.create(projectData.name);
    newProject.mainAssignee = projectData.mainAssignee;
    newProject.priority = projectData.priority;
    newProject.deadline = projectData.deadline;
    newProject.description = projectData.description;
    
    data.projects.push(newProject);
    Storage.save(data);
    
    closeModal();
    showNotification(`Đã tạo dự án "${projectData.name}" thành công!`, 'success');
    
    // Chuyển hướng đến trang chi tiết dự án sau 2 giây
    setTimeout(() => {
        window.location.href = `detail.html?id=${newProject.id}&from=projects.html`;
    }, 2000);
}

// Đóng modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Hàm hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Hàm format ngày tháng
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Hàm escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Khởi chạy khi trang load
document.addEventListener('DOMContentLoaded', initProjectsPage);

// Thêm các hàm vào global scope
window.showCreateProjectModal = showCreateProjectModal;
window.closeModal = closeModal;
window.deleteProject = deleteProject;
window.clearSearch = clearSearch;