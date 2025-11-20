let data = Storage.load();
let currentChart = null;

// Khởi tạo trang thống kê
function initStatsPage() {
    updateStats();
    renderFeaturedProjects();
    renderFilteredProjects('all');
    attachStatsEventListeners();
    initChart();
}

// Khởi tạo biểu đồ
function initChart() {
    const ctx = document.getElementById('statsChart').getContext('2d');
    updateChart('all');
}

// Cập nhật biểu đồ
function updateChart(filter = 'all') {
    const stats = getFilteredStats(filter);
    const ctx = document.getElementById('statsChart').getContext('2d');
    
    // Hủy biểu đồ cũ nếu tồn tại
    if (currentChart) {
        currentChart.destroy();
    }
    
    const total = stats.total || 0;
    const active = stats.active || 0;
    const completed = stats.completed || 0;
    const overdue = stats.overdue || 0;
    const highPriority = stats.highPriority || 0;
    
    // Tính phần trăm
    const activePercent = total > 0 ? (active / total * 100).toFixed(1) : 0;
    const completedPercent = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    const overduePercent = total > 0 ? (overdue / total * 100).toFixed(1) : 0;
    const highPriorityPercent = total > 0 ? (highPriority / total * 100).toFixed(1) : 0;
    
    // Cập nhật tổng số
    document.getElementById('chartTotal').textContent = total;
    
    // Tạo biểu đồ - CHỈ HIỂN THỊ DỮ LIỆU CỦA BỘ LỌC ĐƯỢC CHỌN
    const chartData = getChartDataForFilter(filter, active, completed, overdue, highPriority);
    
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // Cập nhật legend
    updateChartLegend(active, completed, overdue, highPriority, activePercent, completedPercent, overduePercent, highPriorityPercent, filter);
}

// Lấy dữ liệu biểu đồ theo bộ lọc
function getChartDataForFilter(filter, active, completed, overdue, highPriority) {
    const filterColors = {
        'all': ['#17a2b8', '#28a745', '#dc3545', '#ffc107'],
        'active': ['#17a2b8'],
        'completed': ['#28a745'],
        'overdue': ['#dc3545'],
        'high-priority': ['#ffc107']
    };
    
    const filterLabels = {
        'all': ['Đang làm', 'Đã hoàn thành', 'Trễ hạn', 'Ưu tiên cao'],
        'active': ['Đang làm'],
        'completed': ['Đã hoàn thành'],
        'overdue': ['Trễ hạn'],
        'high-priority': ['Ưu tiên cao']
    };
    
    const filterData = {
        'all': [active, completed, overdue, highPriority],
        'active': [active],
        'completed': [completed],
        'overdue': [overdue],
        'high-priority': [highPriority]
    };
    
    return {
        labels: filterLabels[filter] || ['Dữ liệu'],
        datasets: [{
            data: filterData[filter] || [0],
            backgroundColor: filterColors[filter] || ['#6c757d'],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
}

// Cập nhật legend cho biểu đồ
function updateChartLegend(active, completed, overdue, highPriority, activePercent, completedPercent, overduePercent, highPriorityPercent, filter) {
    const legend = document.getElementById('chartLegend');
    
    if (filter === 'all') {
        legend.innerHTML = `
            <div class="legend-item">
                <span class="legend-color" style="background: #17a2b8"></span>
                <span class="legend-text">Đang làm: ${active} (${activePercent}%)</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #28a745"></span>
                <span class="legend-text">Đã hoàn thành: ${completed} (${completedPercent}%)</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #dc3545"></span>
                <span class="legend-text">Trễ hạn: ${overdue} (${overduePercent}%)</span>
            </div>
            <div class="legend-item">
                <span class="legend-color" style="background: #ffc107"></span>
                <span class="legend-text">Ưu tiên cao: ${highPriority} (${highPriorityPercent}%)</span>
            </div>
        `;
    } else {
        const filterInfo = {
            'active': { color: '#17a2b8', label: 'Đang làm', value: active, percent: activePercent },
            'completed': { color: '#28a745', label: 'Đã hoàn thành', value: completed, percent: completedPercent },
            'overdue': { color: '#dc3545', label: 'Trễ hạn', value: overdue, percent: overduePercent },
            'high-priority': { color: '#ffc107', label: 'Ưu tiên cao', value: highPriority, percent: highPriorityPercent }
        };
        
        const info = filterInfo[filter];
        if (info) {
            legend.innerHTML = `
                <div class="legend-item">
                    <span class="legend-color" style="background: ${info.color}"></span>
                    <span class="legend-text">${info.label}: ${info.value} (${info.percent}%)</span>
                </div>
            `;
        }
    }
}

// Cập nhật thống kê
function updateStats(filter = 'all') {
    const stats = getFilteredStats(filter);
    
    // Cập nhật số liệu - SỬA LỖI UNDEFINED
    document.getElementById('statActive').textContent = stats.active || 0;
    document.getElementById('statCompleted').textContent = stats.completed || 0;
    document.getElementById('statOverdue').textContent = stats.overdue || 0;
    document.getElementById('statHighPriority').textContent = stats.highPriority || 0;
    
    // Cập nhật biểu đồ
    updateChart(filter);
}

// Lấy thống kê theo bộ lọc - SỬA LỖI UNDEFINED
function getFilteredStats(filter) {
    const filteredProjects = ProjectManager.filterProjects(data.projects, filter);
    const total = filteredProjects ? filteredProjects.length : 0;
    
    // ĐẢM BẢO KHÔNG BỊ UNDEFINED
    const active = filteredProjects ? filteredProjects.filter(project => 
        project && project.status === 'active' && 
        ProjectManager.calculateProjectProgress(project) < 100
    ).length : 0;
    
    const completed = filteredProjects ? filteredProjects.filter(project => 
        project && (project.status === 'completed' || 
        ProjectManager.calculateProjectProgress(project) === 100)
    ).length : 0;
    
    const overdue = filteredProjects ? filteredProjects.filter(project => 
        project && project.status === 'overdue'
    ).length : 0;
    
    const highPriority = filteredProjects ? filteredProjects.filter(project => 
        project && (project.priority === 'high' || project.priority === 'urgent')
    ).length : 0;
    
    return { 
        total: total || 0, 
        active: active || 0, 
        completed: completed || 0, 
        overdue: overdue || 0, 
        highPriority: highPriority || 0 
    };
}
// Render dự án theo bộ lọc - ĐÃ SỬA
function renderFilteredProjects(filter) {
    const container = document.getElementById('filteredProjects');
    const title = document.getElementById('filteredProjectsTitle');
    const filterInfo = document.getElementById('filterInfo');
    
    // ĐẢM BẢO CONTAINER TỒN TẠI
    if (!container) {
        console.error('Container #filteredProjects not found');
        return;
    }
    
    container.innerHTML = "";
    
    const filteredProjects = ProjectManager.filterProjects(data.projects, filter);
    const stats = getFilteredStats(filter);
    
    // Cập nhật tiêu đề và thông tin bộ lọc
    const filterTitles = {
        'all': 'Tất cả dự án',
        'active': 'Dự án đang thực hiện',
        'completed': 'Dự án đã hoàn thành',
        'overdue': 'Dự án trễ hạn',
        'high-priority': 'Dự án ưu tiên cao'
    };
    
    if (title) title.textContent = filterTitles[filter] || 'Dự án';
    if (filterInfo) filterInfo.innerHTML = `Tổng: <strong>${stats.total}</strong> dự án`;
    
    // KIỂM TRA NẾU KHÔNG CÓ DỰ ÁN
    if (!filteredProjects || filteredProjects.length === 0) {
        const emptyMessages = {
            'all': 'Chưa có dự án nào. Hãy tạo dự án đầu tiên!',
            'active': 'Không có dự án nào đang thực hiện',
            'completed': 'Chưa có dự án nào hoàn thành',
            'overdue': 'Không có dự án nào trễ hạn',
            'high-priority': 'Không có dự án nào có ưu tiên cao'
        };
        
        container.innerHTML = `
            <div class="empty-state">
                <h3>${emptyMessages[filter] || 'Không có dự án'}</h3>
                ${filter !== 'all' ? `<button onclick="clearFilter()" class="btn-secondary">Xem tất cả dự án</button>` : ''}
            </div>
        `;
        return;
    }

    // NẾU LÀ "TẤT CẢ" THÌ KHÔNG HIỂN THỊ DỰ ÁN
    if (filter === 'all') {
        container.innerHTML = `
            <div class="filter-note">
                <p>📊 Chọn một bộ lọc cụ thể để xem danh sách dự án chi tiết</p>
            </div>
        `;
        return;
    }

    // RENDER DỰ ÁN CHO CÁC BỘ LỌC KHÁC (DẠNG COMPACT)
    const projectsList = document.createElement('div');
    projectsList.className = 'compact-projects-list';
    
    filteredProjects.forEach(project => {
        if (!project) return;
        
        const progress = ProjectManager.calculateProjectProgress(project);
        const isOverdue = ProjectManager.isProjectOverdue(project);
        
        const projectItem = document.createElement('div');
        projectItem.className = `compact-project-item ${isOverdue ? 'overdue' : ''}`;
        projectItem.innerHTML = `
            <div class="compact-project-main">
                <div class="compact-project-info">
                    <div class="compact-project-name">${escapeHtml(project.name)}</div>
                    <div class="compact-project-meta">
                        <span class="compact-project-creator">👤 ${escapeHtml(project.mainAssignee || 'Chưa có')}</span>
                        <span class="compact-project-date">📅 ${formatDate(project.createdAt)}</span>
                    </div>
                </div>
                <div class="compact-project-progress">
                    <div class="compact-progress-bar">
                        <div class="compact-progress-fill ${progress === 100 ? 'completed' : ''}" 
                             style="width: ${progress}%">
                            <span class="compact-progress-text">${progress}%</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="compact-project-actions">
                <button class="btn-view-compact" data-project-id="${project.id}">
                    👁️ Xem
                </button>
            </div>
        `;
        projectsList.appendChild(projectItem);
    });
    
    container.appendChild(projectsList);
    attachCompactProjectEventListeners();
}

// Event listeners cho project compact
function attachCompactProjectEventListeners() {
    document.querySelectorAll('.btn-view-compact').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.target.dataset.projectId;
            localStorage.setItem('lastVisitedPage', 'index.html');
            window.location.href = `detail.html?id=${projectId}&from=index.html`;
        });
    });
}

// Event listeners cho trang thống kê
function attachStatsEventListeners() {
    // Bộ lọc
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length === 0) {
        console.error('No filter buttons found');
        return;
    }
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Cập nhật thống kê và hiển thị dự án theo bộ lọc
            updateStats(filter);
            renderFilteredProjects(filter);
        });
    });
}

// Xóa bộ lọc
function clearFilter() {
    const allFilter = document.querySelector('[data-filter="all"]');
    if (allFilter) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        allFilter.classList.add('active');
        updateStats('all');
        renderFilteredProjects('all');
    }
}

// Render dự án nổi bật - SỬA LỖI UNDEFINED
function renderFeaturedProjects() {
    const container = document.getElementById('featuredProjects');
    if (!container) {
        console.error('Container #featuredProjects not found');
        return;
    }
    
    container.innerHTML = "";

    ProjectManager.updateOverdueStatuses();
    
    // KIỂM TRA DATA
    if (!data.projects) {
        container.innerHTML = `<div class="empty-state"><h3>Không có dữ liệu dự án</h3></div>`;
        return;
    }
    
    // Lọc dự án nổi bật
    const featuredProjects = data.projects
        .filter(project => {
            if (!project) return false;
            const hasThreeOrMoreStages = project.stages && project.stages.length >= 3;
            const isCompleted = ProjectManager.calculateProjectProgress(project) === 100;
            return hasThreeOrMoreStages && isCompleted;
        })
        .sort((a, b) => {
            const aStages = a.stages ? a.stages.length : 0;
            const bStages = b.stages ? b.stages.length : 0;
            if (bStages !== aStages) {
                return bStages - aStages;
            }
            const aCompletionDate = getProjectCompletionDate(a);
            const bCompletionDate = getProjectCompletionDate(b);
            return new Date(bCompletionDate) - new Date(aCompletionDate);
        })
        .slice(0, 5);

    if (featuredProjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Chưa có dự án nổi bật</h3>
                <p>Dự án nổi bật là những dự án có 3 giai đoạn trở lên và đã hoàn thành 100%.</p>
                <p>Hãy hoàn thành các dự án lớn để chúng xuất hiện tại đây!</p>
            </div>
        `;
        return;
    }

    featuredProjects.forEach(project => {
        if (!project) return;
        
        const progress = ProjectManager.calculateProjectProgress(project);
        const totalStages = project.stages ? project.stages.length : 0;
        const totalTasks = project.stages ? project.stages.reduce((sum, stage) => sum + (stage.tasks ? stage.tasks.length : 0), 0) : 0;
        const completedDate = getProjectCompletionDate(project);
        
        const projectDiv = document.createElement("div");
        projectDiv.className = "project-item box featured-project";
        projectDiv.innerHTML = `
            <div class="project-header">
                <div class="project-info">
                    <div class="project-title">
                        <span class="featured-badge">⭐ NỔI BẬT</span>
                        <strong>${escapeHtml(project.name)}</strong>
                    </div>
                    <div class="project-meta">
                        <span class="project-stages">📊 ${totalStages} giai đoạn</span>
                        <span class="project-tasks">✅ ${totalTasks} task</span>
                        ${completedDate ? `<span class="project-completion">🎯 Hoàn thành: ${formatDate(completedDate)}</span>` : ''}
                        ${project.mainAssignee ? `<span class="project-assignee">👤 ${escapeHtml(project.mainAssignee)}</span>` : ''}
                    </div>
                    ${project.description ? `<div class="project-description">${escapeHtml(project.description)}</div>` : ''}
                </div>
                <div class="project-actions">
                    <button class="btn-view-project" data-project-id="${project.id}">
                        Xem chi tiết
                    </button>
                </div>
            </div>
            <div class="project-progress">
                <div class="progress-info">
                    <span class="progress-text">Đã hoàn thành: ${progress}%</span>
                    <span class="progress-duration">Thời gian: ${calculateProjectDuration(project)}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill completed" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
        container.appendChild(projectDiv);
    });

    attachProjectEventListeners();
}

// Event listeners cho project
function attachProjectEventListeners() {
    document.querySelectorAll('.btn-view-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.target.dataset.projectId;
            localStorage.setItem('lastVisitedPage', 'index.html');
            window.location.href = `detail.html?id=${projectId}&from=index.html`;
        });
    });
}

// Các hàm helper với validation
function getProjectCompletionDate(project) {
    if (!project || !project.stages || project.stages.length === 0) return null;
    let lastCompletionDate = null;
    project.stages.forEach(stage => {
        if (stage && stage.tasks) {
            stage.tasks.forEach(task => {
                if (task && task.completed && task.updatedAt) {
                    const taskDate = new Date(task.updatedAt);
                    if (!lastCompletionDate || taskDate > lastCompletionDate) {
                        lastCompletionDate = taskDate;
                    }
                }
            });
        }
    });
    return lastCompletionDate || (project.createdAt || null);
}

function calculateProjectDuration(project) {
    if (!project || !project.createdAt) return "Không xác định";
    
    const startDate = new Date(project.createdAt);
    const endDate = getProjectCompletionDate(project) ? new Date(getProjectCompletionDate(project)) : new Date();
    
    if (isNaN(startDate.getTime())) return "Không xác định";
    
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "1 ngày";
    if (diffDays === 1) return "1 ngày";
    if (diffDays < 30) return `${diffDays} ngày`;
    
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (remainingDays === 0) {
        return `${diffMonths} tháng`;
    } else {
        return `${diffMonths} tháng ${remainingDays} ngày`;
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
        window.location.href = `detail.html?id=${newProject.id}&from=index.html`;
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

function formatDate(dateString) {
    if (!dateString) return 'Không xác định';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Không xác định' : date.toLocaleDateString('vi-VN');
    } catch (e) {
        return 'Không xác định';
    }
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Khởi chạy khi trang load với error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        initStatsPage();
    } catch (error) {
        console.error('Error initializing stats page:', error);
        // Hiển thị thông báo lỗi cho người dùng
        const container = document.getElementById('filteredProjects');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Đã xảy ra lỗi khi tải trang</h3>
                    <p>Vui lòng thử tải lại trang.</p>
                    <button onclick="window.location.reload()" class="btn-primary">Tải lại trang</button>
                </div>
            `;
        }
    }
});

// Thêm các hàm vào global scope
window.showCreateProjectModal = showCreateProjectModal;
window.closeModal = closeModal;
window.exportDashboardDOC = () => {
    ExportManager.exportDashboardDOC();
};
window.clearFilter = clearFilter;