let data = Storage.load();
let currentProject = null;

// Lấy referrer từ URL hoặc localStorage
function getReferrer() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = urlParams.get('from') || localStorage.getItem('lastVisitedPage') || 'index.html';
    return referrer;
}

// Lưu trang hiện tại vào localStorage khi vào trang chi tiết
function saveCurrentPage() {
    const currentPage = window.location.pathname.includes('projects.html') ? 'projects.html' : 'index.html';
    localStorage.setItem('lastVisitedPage', currentPage);
}

// Lấy project ID từ URL
function getProjectIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Tải dự án hiện tại
function loadCurrentProject() {
    const projectId = getProjectIdFromURL();
    currentProject = data.projects.find(p => p.id === projectId);
    
    if (!currentProject) {
        alert('Dự án không tồn tại!');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('projectTitle').textContent = currentProject.name;
    
    // Thiết lập nút quay lại
    setupBackButton();
    
    renderStages();
    updateProjectProgress();
}

// Thiết lập nút quay lại
function setupBackButton() {
    const backButton = document.getElementById('btnBack');
    const referrer = getReferrer();
    
    backButton.addEventListener('click', () => {
        window.location.href = referrer;
    });
    
    // Cũng có thể thêm text cho rõ ràng
    if (referrer === 'projects.html') {
        backButton.textContent = '← Quay lại danh sách';
    } else {
        backButton.textContent = '← Quay lại thống kê';
    }
}

// Tính % hoàn thành của một giai đoạn
function calculateStageProgress(stage) {
    if (!stage.tasks || stage.tasks.length === 0) return 0;
    
    const completedTasks = stage.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / stage.tasks.length) * 100);
}

// Tính % hoàn thành của toàn bộ dự án
function calculateProjectProgress() {
    if (!currentProject.stages || currentProject.stages.length === 0) return 0;
    
    const stageProgresses = currentProject.stages.map(stage => calculateStageProgress(stage));
    const totalProgress = stageProgresses.reduce((sum, progress) => sum + progress, 0);
    return Math.round(totalProgress / stageProgresses.length);
}

// Cập nhật hiển thị tiến độ tổng thể
function updateProjectProgress() {
    const progress = calculateProjectProgress();
    const isOverdue = ProjectManager.isProjectOverdue(currentProject);
    const priorityIcon = ProjectManager.getPriorityIcon(currentProject.priority);
    const priorityColor = ProjectManager.getPriorityColor(currentProject.priority);
    
    const progressElement = document.getElementById('projectProgress');
    
    if (!progressElement) {
        // Tạo element nếu chưa có
        const mainElement = document.querySelector('main');
        const progressDiv = document.createElement('div');
        progressDiv.id = 'projectProgress';
        progressDiv.className = 'box project-overview';
        progressDiv.innerHTML = `
            <h2>Thông tin dự án</h2>
            <div class="project-details">
                <div class="detail-row">
                    <div class="detail-item">
                        <strong>Độ ưu tiên:</strong>
                        <span class="priority-display" style="color: ${priorityColor}">
                            ${priorityIcon} ${currentProject.priority.toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Người phụ trách:</strong>
                        <span>${currentProject.mainAssignee || 'Chưa có'}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-item">
                        <strong>Deadline:</strong>
                        <span class="${isOverdue ? 'overdue' : ''}">
                            ${currentProject.deadline ? formatDate(currentProject.deadline) : 'Chưa có'} 
                            ${isOverdue ? '(TRỄ HẠN)' : ''}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Ngày tạo:</strong>
                        <span>${formatDate(currentProject.createdAt)}</span>
                    </div>
                </div>
                ${currentProject.description ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <strong>Mô tả:</strong>
                            <p>${escapeHtml(currentProject.description)}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="progress-section">
                    <div class="progress-info">
                        <strong>Tiến độ tổng thể:</strong>
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
        mainElement.insertBefore(progressDiv, mainElement.firstChild);
    } else {
        // Cập nhật element đã có
        progressElement.innerHTML = `
            <h2>Thông tin dự án</h2>
            <div class="project-details">
                <div class="detail-row">
                    <div class="detail-item">
                        <strong>Độ ưu tiên:</strong>
                        <span class="priority-display" style="color: ${priorityColor}">
                            ${priorityIcon} ${currentProject.priority.toUpperCase()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Người phụ trách:</strong>
                        <span>${currentProject.mainAssignee || 'Chưa có'}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-item">
                        <strong>Deadline:</strong>
                        <span class="${isOverdue ? 'overdue' : ''}">
                            ${currentProject.deadline ? formatDate(currentProject.deadline) : 'Chưa có'} 
                            ${isOverdue ? '(TRỄ HẠN)' : ''}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Ngày tạo:</strong>
                        <span>${formatDate(currentProject.createdAt)}</span>
                    </div>
                </div>
                ${currentProject.description ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <strong>Mô tả:</strong>
                            <p>${escapeHtml(currentProject.description)}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="progress-section">
                    <div class="progress-info">
                        <strong>Tiến độ tổng thể:</strong>
                        <span class="progress-text">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Render danh sách giai đoạn với DROPDOWN (ĐÃ NÂNG CẤP)
function renderStages() {
    const container = document.getElementById('stagesContainer');
    container.innerHTML = "";

    if (!currentProject.stages || currentProject.stages.length === 0) {
        container.innerHTML = "<p>Chưa có giai đoạn nào.</p>";
        return;
    }

    currentProject.stages.forEach(stage => {
        const stageProgress = calculateStageProgress(stage);
        const completedTasks = stage.tasks ? stage.tasks.filter(task => task.completed).length : 0;
        const totalTasks = stage.tasks ? stage.tasks.length : 0;
        
        const stageDiv = document.createElement("div");
        stageDiv.className = "stage-item box";
        stageDiv.innerHTML = `
            <div class="stage-header">
                <div class="stage-info">
                    <div class="stage-title-wrapper" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <strong>${escapeHtml(stage.name)}</strong>
                        <button class="btn-toggle-stage" data-stage-id="${stage.id}" style="background: none; border: none; font-size: 1.2em; cursor: pointer;">
                            ▼
                        </button>
                    </div>
                    <div class="stage-progress">
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${stageProgress}%"></div>
                        </div>
                        <span class="progress-text">${completedTasks}/${totalTasks} task (${stageProgress}%)</span>
                    </div>
                </div>
                <button class="btn-delete-stage"
                        data-stage-id="${stage.id}"
                        data-stage-name="${escapeHtml(stage.name)}">
                    Xóa giai đoạn
                </button>
            </div>
            <div class="tasks-section" id="tasks-section-${stage.id}" style="display: none; margin-top: 15px;">
                <button class="btn-add-task" data-stage-id="${stage.id}" style="margin-bottom: 15px;">
                    + Thêm task
                </button>
                <div class="tasks-list" id="tasks-${stage.id}"></div>
            </div>
        `;
        container.appendChild(stageDiv);
        renderTasks(stage.id);
    });

    // Gắn event listeners sau khi render
    setTimeout(() => {
        attachDetailEventListeners();
    }, 0);
    
    updateProjectProgress();
}

// Render danh sách task với UPLOAD ẢNH (ĐÃ NÂNG CẤP)
function renderTasks(stageId) {
    const stage = currentProject.stages.find(s => s.id === stageId);
    const container = document.getElementById(`tasks-${stageId}`);
    
    if (!container) return;
    
    container.innerHTML = "";

    if (!stage.tasks || stage.tasks.length === 0) {
        container.innerHTML = "<p>Chưa có task nào.</p>";
        return;
    }

    stage.tasks.forEach(task => {
        const isOverdue = ProjectManager.isTaskOverdue(task, currentProject);
        const priorityColor = ProjectManager.getPriorityColor(task.priority);
        const priorityIcon = ProjectManager.getPriorityIcon(task.priority);
        
        // Format thông tin deadline
        let deadlineInfo = '';
        if (task.deadline) {
            if (!task.completed) {
                const today = new Date();
                const deadline = new Date(task.deadline);
                const timeDiff = deadline.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                
                let deadlineClass = '';
                let statusText = '';
                
                if (daysDiff < 0) {
                    deadlineClass = 'overdue';
                    statusText = '(QUÁ HẠN)';
                } else if (daysDiff <= 3) {
                    deadlineClass = 'urgent';
                    statusText = `(CÒN ${daysDiff} NGÀY)`;
                }
                
                deadlineInfo = `<span class="task-deadline ${deadlineClass}">📅 ${formatDate(task.deadline)} ${statusText}</span>`;
            } else {
                deadlineInfo = `<span class="task-deadline completed">📅 ${formatDate(task.deadline)} (ĐÃ HOÀN THÀNH)</span>`;
            }
        }
        
        // Hiển thị ảnh nếu có
        let imageHtml = '';
        if (task.image) {
            imageHtml = `
                <div class="task-image" style="margin-top: 10px;">
                    <img src="assets/img/${task.image}" alt="Task image" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #ddd;">
                    <button class="btn-remove-image" data-task-id="${task.id}" data-stage-id="${stageId}" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 4px; margin-left: 5px; font-size: 0.8em;">
                        Xóa ảnh
                    </button>
                </div>
            `;
        }
        
        const taskDiv = document.createElement("div");
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue && !task.completed ? 'task-overdue' : ''}`;
        taskDiv.innerHTML = `
            <div class="task-main">
                <label class="task-checkbox-label">
                    <input type="checkbox" class="task-checkbox"
                           data-task-id="${task.id}"
                           data-stage-id="${stageId}"
                           ${task.completed ? 'checked' : ''}>
                    <span class="task-name ${task.completed ? 'completed' : ''}">${escapeHtml(task.name)}</span>
                </label>
                <div class="task-meta">
                    <span class="task-priority" style="background: ${priorityColor}">
                        ${priorityIcon} ${task.priority.toUpperCase()}
                    </span>
                    ${task.assignee ? `<span class="task-assignee">👤 ${escapeHtml(task.assignee)}</span>` : ''}
                    ${deadlineInfo}
                </div>
                ${task.notes ? `<div class="task-notes">📝 ${escapeHtml(task.notes)}</div>` : ''}
                ${imageHtml}
            </div>
            <div class="task-actions">
                <button class="btn-upload-image" 
                        data-task-id="${task.id}"
                        data-stage-id="${stageId}"
                        style="background: #17a2b8; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px; font-size: 0.8em;">
                    📷 Upload ảnh
                </button>
                <button class="btn-delete-task" 
                        data-task-id="${task.id}"
                        data-stage-id="${stageId}"
                        data-task-name="${escapeHtml(task.name)}">
                    Xóa
                </button>
            </div>
        `;
        container.appendChild(taskDiv);
    });
}

// Hiển thị modal chỉnh sửa dự án
function showEditProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Chỉnh sửa dự án</h3>
            <form id="editProjectForm">
                <div class="form-group">
                    <label>Tên dự án *:</label>
                    <input type="text" id="editProjectName" value="${currentProject.name}" required>
                </div>
                <div class="form-group">
                    <label>Người phụ trách chính:</label>
                    <input type="text" id="editMainAssignee" value="${currentProject.mainAssignee || ''}" placeholder="Tùy chọn">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Deadline dự án:</label>
                        <input type="date" id="editProjectDeadline" value="${currentProject.deadline || ''}">
                    </div>
                    <div class="form-group">
                        <label>Độ ưu tiên:</label>
                        <select id="editProjectPriority">
                            <option value="low" ${currentProject.priority === 'low' ? 'selected' : ''}>Thấp</option>
                            <option value="medium" ${currentProject.priority === 'medium' ? 'selected' : ''}>Trung bình</option>
                            <option value="high" ${currentProject.priority === 'high' ? 'selected' : ''}>Cao</option>
                            <option value="urgent" ${currentProject.priority === 'urgent' ? 'selected' : ''}>Khẩn cấp</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Mô tả dự án:</label>
                    <textarea id="editProjectDescription" placeholder="Mô tả ngắn về dự án..." rows="3">${currentProject.description || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Hủy</button>
                    <button type="submit">Lưu thay đổi</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('editProjectForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateProject();
    });
}

// Hiển thị modal thêm task với UPLOAD ẢNH (ĐÃ NÂNG CẤP)
function showAddTaskModal(stageId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Thêm Task Mới</h3>
            <form id="taskForm">
                <div class="form-group">
                    <label>Tên task *:</label>
                    <input type="text" id="taskName" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Người phụ trách:</label>
                        <input type="text" id="taskAssignee" placeholder="Tùy chọn">
                    </div>
                    <div class="form-group">
                        <label>Độ ưu tiên:</label>
                        <select id="taskPriority">
                            <option value="low">Thấp</option>
                            <option value="medium" selected>Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Deadline:</label>
                    <input type="date" id="taskDeadline">
                </div>
                <div class="form-group">
                    <label>Ghi chú:</label>
                    <textarea id="taskNotes" placeholder="Ghi chú..."></textarea>
                </div>
                <div class="form-group">
                    <label>Ảnh đính kèm:</label>
                    <input type="file" id="taskImage" accept="image/*" style="padding: 5px;">
                    <small style="color: #666;">Chỉ chấp nhận ảnh (tối đa 1 ảnh)</small>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Hủy</button>
                    <button type="submit">Thêm Task</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addTask(stageId);
    });
}

// Hiển thị modal upload ảnh cho task (MỚI)
function showUploadImageModal(stageId, taskId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Upload Ảnh cho Task</h3>
            <form id="uploadImageForm">
                <div class="form-group">
                    <label>Chọn ảnh:</label>
                    <input type="file" id="taskImageUpload" accept="image/*" required style="padding: 5px;">
                    <small style="color: #666;">Chỉ chấp nhận ảnh (tối đa 1 ảnh)</small>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()">Hủy</button>
                    <button type="submit">Upload Ảnh</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('uploadImageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await uploadTaskImage(stageId, taskId);
    });
}

// Upload ảnh cho task (MỚI)
async function uploadTaskImage(stageId, taskId) {
    const fileInput = document.getElementById('taskImageUpload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Vui lòng chọn ảnh!');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
    }
    
    try {
        // Tạo tên file unique
        const fileExtension = file.name.split('.').pop();
        const fileName = `task_${taskId}_${Date.now()}.${fileExtension}`;
        
        // Trong thực tế, bạn sẽ upload file lên server
        // Ở đây ta giả lập bằng cách lưu thông tin file
        const stage = currentProject.stages.find(s => s.id === stageId);
        const task = stage.tasks.find(t => t.id === taskId);
        
        if (task) {
            task.image = fileName;
            Storage.save(data);
            
            closeModal();
            renderStages(); // Render lại để hiển thị ảnh
            showNotification('Đã upload ảnh thành công!', 'success');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showNotification('Upload ảnh thất bại!', 'error');
    }
}

// Xóa ảnh của task (MỚI)
function removeTaskImage(stageId, taskId) {
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
        const stage = currentProject.stages.find(s => s.id === stageId);
        const task = stage.tasks.find(t => t.id === taskId);
        
        if (task && task.image) {
            task.image = null;
            Storage.save(data);
            renderStages(); // Render lại
            showNotification('Đã xóa ảnh thành công!', 'success');
        }
    }
}

// Đóng modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Cập nhật thông tin dự án
function updateProject() {
    const updatedData = {
        name: document.getElementById('editProjectName').value.trim(),
        mainAssignee: document.getElementById('editMainAssignee').value.trim(),
        deadline: document.getElementById('editProjectDeadline').value,
        priority: document.getElementById('editProjectPriority').value,
        description: document.getElementById('editProjectDescription').value.trim()
    };
    
    if (!updatedData.name) {
        alert('Vui lòng nhập tên dự án');
        return;
    }
    
    // Cập nhật thông tin
    currentProject.name = updatedData.name;
    currentProject.mainAssignee = updatedData.mainAssignee;
    currentProject.deadline = updatedData.deadline;
    currentProject.priority = updatedData.priority;
    currentProject.description = updatedData.description;
    
    Storage.save(data);
    closeModal();
    loadCurrentProject();
    showNotification('Đã cập nhật thông tin dự án thành công!', 'success');
}

// Thêm task mới với ẢNH (ĐÃ NÂNG CẤP)
function addTask(stageId) {
    const taskData = {
        name: document.getElementById('taskName').value.trim(),
        assignee: document.getElementById('taskAssignee').value.trim(),
        deadline: document.getElementById('taskDeadline').value,
        notes: document.getElementById('taskNotes').value.trim(),
        priority: document.getElementById('taskPriority').value
    };
    
    if (!taskData.name) {
        alert('Vui lòng nhập tên task');
        return;
    }
    
    const newTask = ProjectManager.addTask(currentProject.id, stageId, taskData);
    const stage = currentProject.stages.find(s => s.id === stageId);
    
    // Xử lý ảnh nếu có
    const fileInput = document.getElementById('taskImage');
    const file = fileInput.files[0];
    
    if (file && file.type.startsWith('image/')) {
        const fileExtension = file.name.split('.').pop();
        newTask.image = `task_${newTask.id}_${Date.now()}.${fileExtension}`;
    }
    
    if (!stage.tasks) {
        stage.tasks = [];
    }
    
    stage.tasks.push(newTask);
    Storage.save(data);
    
    closeModal();
    renderStages(); // Render lại toàn bộ stages
    showNotification(`Đã thêm task "${taskData.name}"`, 'success');
}

// Xóa task
function deleteTask(stageId, taskId, taskName) {
    if (confirm(`Bạn có chắc muốn xóa task "${taskName}"?`)) {
        const stage = currentProject.stages.find(s => s.id === stageId);
        if (stage && stage.tasks) {
            stage.tasks = stage.tasks.filter(t => t.id !== taskId);
            Storage.save(data);
            renderStages(); // Render lại toàn bộ
            showNotification(`Đã xóa task "${taskName}"`, 'success');
        }
    }
}

// Toggle trạng thái task
function toggleTask(stageId, taskId) {
    const stage = currentProject.stages.find(s => s.id === stageId);
    if (stage) {
        const task = stage.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.status = task.completed ? 'completed' : 'active';
            task.updatedAt = new Date().toISOString();
            Storage.save(data);
            renderStages(); // Render lại để cập nhật UI
        }
    }
}

// Xóa giai đoạn
function deleteStage(stageId, stageName) {
    if (confirm(`Bạn có chắc muốn xóa giai đoạn "${stageName}"?`)) {
        currentProject.stages = currentProject.stages.filter(s => s.id !== stageId);
        Storage.save(data);
        renderStages(); // Render lại
        showNotification(`Đã xóa giai đoạn "${stageName}"`, 'success');
    }
}

// Toggle hiển thị tasks trong giai đoạn (MỚI)
function toggleStageTasks(stageId) {
    const tasksSection = document.getElementById(`tasks-section-${stageId}`);
    const toggleBtn = document.querySelector(`.btn-toggle-stage[data-stage-id="${stageId}"]`);
    
    if (tasksSection.style.display === 'none') {
        tasksSection.style.display = 'block';
        toggleBtn.textContent = '▲';
    } else {
        tasksSection.style.display = 'none';
        toggleBtn.textContent = '▼';
    }
}

// Event listeners cho trang chi tiết (ĐÃ NÂNG CẤP)
function attachDetailEventListeners() {
    // Toggle stage dropdown
    document.querySelectorAll('.btn-toggle-stage').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stageId = e.target.dataset.stageId;
            toggleStageTasks(stageId);
        });
    });

    // Thêm task (mở modal)
    document.querySelectorAll('.btn-add-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stageId = e.target.dataset.stageId;
            showAddTaskModal(stageId);
        });
    });

    // Upload ảnh cho task
    document.querySelectorAll('.btn-upload-image').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            const stageId = e.target.dataset.stageId;
            showUploadImageModal(stageId, taskId);
        });
    });

    // Xóa ảnh của task
    document.querySelectorAll('.btn-remove-image').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            const stageId = e.target.dataset.stageId;
            removeTaskImage(stageId, taskId);
        });
    });

    // Xóa task
    document.querySelectorAll('.btn-delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.dataset.taskId;
            const stageId = e.target.dataset.stageId;
            const taskName = e.target.dataset.taskName;
            deleteTask(stageId, taskId, taskName);
        });
    });

    // Toggle task
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const taskId = e.target.dataset.taskId;
            const stageId = e.target.dataset.stageId;
            toggleTask(stageId, taskId);
        });
    });

    // Xóa giai đoạn
    document.querySelectorAll('.btn-delete-stage').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stageId = e.target.dataset.stageId;
            const stageName = e.target.dataset.stageName;
            deleteStage(stageId, stageName);
        });
    });
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

// Thêm giai đoạn
document.getElementById('btnAddStage').addEventListener('click', () => {
    const stageName = document.getElementById('stageName').value.trim();
    if (!stageName) return alert('Vui lòng nhập tên giai đoạn');

    const newStage = ProjectManager.addStage(currentProject.id, stageName);
    
    if (!currentProject.stages) {
        currentProject.stages = [];
    }
    
    currentProject.stages.push(newStage);
    Storage.save(data);
    
    document.getElementById('stageName').value = "";
    renderStages(); // Render lại toàn bộ
    showNotification(`Đã thêm giai đoạn "${stageName}"`, 'success');
});

// Khởi chạy khi trang load
document.addEventListener('DOMContentLoaded', () => {
    // Lưu trang hiện tại khi vào trang chi tiết
    saveCurrentPage();
    loadCurrentProject();
});

// Thêm các hàm vào global scope để có thể gọi từ HTML
window.closeModal = closeModal;
window.showAddTaskModal = showAddTaskModal;
window.showEditProjectModal = showEditProjectModal;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
window.deleteStage = deleteStage;
window.exportProjectDOC = () => {
    const projectId = getProjectIdFromURL();
    ExportManager.exportProjectDOC(projectId);
};