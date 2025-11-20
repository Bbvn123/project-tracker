const ExportManager = {
    // Export DOC cho dashboard
    exportDashboardDOC() {
        const data = Storage.load();
        const stats = ProjectManager.getProjectStats(data.projects);
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Dashboard Dự Án</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .stats-grid { 
                        display: grid; 
                        grid-template-columns: repeat(4, 1fr); 
                        gap: 15px; 
                        margin: 20px 0; 
                    }
                    .stat-card { 
                        background: #f8f9fa; 
                        padding: 15px; 
                        border: 1px solid #ddd; 
                        border-radius: 5px; 
                        text-align: center;
                    }
                    .stat-number { 
                        font-size: 24px; 
                        font-weight: bold; 
                        color: #2c3e50; 
                    }
                    .stat-label { 
                        font-size: 14px; 
                        color: #666; 
                        margin-top: 5px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 10px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #34495e; 
                        color: white; 
                        font-weight: bold;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9f9f9; 
                    }
                    .progress-bar { 
                        background: #ecf0f1; 
                        border-radius: 3px; 
                        height: 20px; 
                        margin: 5px 0;
                    }
                    .progress-fill { 
                        background: #27ae60; 
                        height: 100%; 
                        border-radius: 3px;
                        text-align: center;
                        color: white;
                        font-size: 12px;
                        line-height: 20px;
                    }
                    .badge { 
                        display: inline-block; 
                        padding: 3px 8px; 
                        border-radius: 3px; 
                        font-size: 11px; 
                        font-weight: bold; 
                        margin-right: 5px;
                    }
                    .badge.overdue { background: #e74c3c; color: white; }
                    .badge.high-priority { background: #f39c12; color: white; }
                    .section { margin: 25px 0; }
                    .section-title { 
                        background: #34495e; 
                        color: white; 
                        padding: 10px 15px; 
                        margin: 15px 0;
                        border-radius: 3px;
                    }
                    .task-completed { background: #d4edda; }
                    .task-overdue { background: #f8d7da; }
                    .priority-high { background: #fff3cd; font-weight: bold; }
                    .task-image { 
                        max-width: 100px; 
                        max-height: 75px; 
                        border-radius: 4px; 
                        border: 1px solid #ddd;
                        margin: 5px 0;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DASHBOARD DỰ ÁN</h1>
                    <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
        `;

        // Thống kê tổng quan
        htmlContent += `
            <div class="section">
                <h2 class="section-title">THỐNG KÊ TỔNG QUAN</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${stats.total}</div>
                        <div class="stat-label">Tổng dự án</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.active}</div>
                        <div class="stat-label">Đang thực hiện</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.completed}</div>
                        <div class="stat-label">Đã hoàn thành</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.overdue}</div>
                        <div class="stat-label">Trễ hạn</div>
                    </div>
                </div>
            </div>
        `;

        // Danh sách dự án
        htmlContent += `
            <div class="section">
                <h2 class="section-title">DANH SÁCH DỰ ÁN</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tên dự án</th>
                            <th>Tiến độ</th>
                            <th>Số giai đoạn</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.projects.forEach(project => {
            const progress = ProjectManager.calculateProjectProgress(project);
            const hasOverdue = ProjectManager.hasOverdueTasks(project);
            const hasHighPriority = ProjectManager.hasHighPriorityTasks(project);
            const stages = project.stages ? project.stages.length : 0;
            
            let statusBadges = '';
            if (hasOverdue) statusBadges += '<span class="badge overdue">TRỄ HẠN</span>';
            if (hasHighPriority) statusBadges += '<span class="badge high-priority">ƯU TIÊN CAO</span>';
            if (!statusBadges) statusBadges = '<span>ĐANG THỰC HIỆN</span>';

            htmlContent += `
                <tr>
                    <td><strong>${project.name}</strong></td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%">${progress}%</div>
                        </div>
                    </td>
                    <td>${stages}</td>
                    <td>${statusBadges}</td>
                    <td>${new Date(project.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
            `;
        });

        htmlContent += `
                    </tbody>
                </table>
            </div>
        `;

        htmlContent += `</body></html>`;

        this.downloadDOC(htmlContent, 'dashboard-du-an.doc');
    },

    // Export DOC chi tiết dự án với HÌNH ẢNH TASK (ĐÃ NÂNG CẤP)
    exportProjectDOC(projectId) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        
        if (!project) {
            alert('Dự án không tồn tại!');
            return;
        }

        const progress = ProjectManager.calculateProjectProgress(project);
        const totalStages = project.stages ? project.stages.length : 0;
        const totalTasks = project.stages ? project.stages.reduce((sum, stage) => sum + (stage.tasks ? stage.tasks.length : 0), 0) : 0;
        const completedTasks = project.stages ? project.stages.reduce((sum, stage) => sum + (stage.tasks ? stage.tasks.filter(task => task.completed).length : 0), 0) : 0;

        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${project.name}</title>
                <style>
                    body { 
                        font-family: 'Arial', sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                    }
                    .overview-grid { 
                        display: grid; 
                        grid-template-columns: repeat(2, 1fr); 
                        gap: 15px; 
                        margin: 20px 0; 
                    }
                    .overview-card { 
                        background: #f8f9fa; 
                        padding: 15px; 
                        border: 1px solid #ddd; 
                        border-radius: 5px; 
                    }
                    .overview-number { 
                        font-size: 24px; 
                        font-weight: bold; 
                        color: #2c3e50; 
                        text-align: center;
                    }
                    .overview-label { 
                        font-size: 14px; 
                        color: #666; 
                        text-align: center;
                        margin-top: 5px;
                    }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 15px 0; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 10px; 
                        text-align: left; 
                    }
                    th { 
                        background-color: #34495e; 
                        color: white; 
                        font-weight: bold;
                    }
                    tr:nth-child(even) { 
                        background-color: #f9f9f9; 
                    }
                    .stage-header { 
                        background: #2c3e50; 
                        color: white; 
                        padding: 12px 15px; 
                        margin: 20px 0 10px 0;
                        border-radius: 5px;
                    }
                    .task-completed { 
                        background: #d4edda; 
                    }
                    .task-overdue { 
                        background: #f8d7da; 
                    }
                    .priority-high { 
                        background: #fff3cd; 
                        font-weight: bold;
                    }
                    .progress-bar { 
                        background: #ecf0f1; 
                        border-radius: 3px; 
                        height: 15px; 
                        margin: 5px 0;
                    }
                    .progress-fill { 
                        background: #27ae60; 
                        height: 100%; 
                        border-radius: 3px;
                    }
                    .task-image-export { 
                        max-width: 120px; 
                        max-height: 90px; 
                        border-radius: 4px; 
                        border: 1px solid #ddd;
                        margin: 5px 0;
                    }
                    .image-placeholder {
                        color: #666;
                        font-style: italic;
                        font-size: 0.9em;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DỰ ÁN: ${project.name}</h1>
                    <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
                </div>
        `;

        // Thông tin tổng quan
        htmlContent += `
            <h2>THÔNG TIN TỔNG QUAN</h2>
            <div class="overview-grid">
                <div class="overview-card">
                    <div class="overview-number">${totalStages}</div>
                    <div class="overview-label">Tổng số giai đoạn</div>
                </div>
                <div class="overview-card">
                    <div class="overview-number">${totalTasks}</div>
                    <div class="overview-label">Tổng số task</div>
                </div>
                <div class="overview-card">
                    <div class="overview-number">${completedTasks}</div>
                    <div class="overview-label">Task đã hoàn thành</div>
                </div>
                <div class="overview-card">
                    <div class="overview-number">${progress}%</div>
                    <div class="overview-label">Tỷ lệ hoàn thành</div>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;

        // Chi tiết các giai đoạn với HÌNH ẢNH TASK
        if (project.stages && project.stages.length > 0) {
            htmlContent += `<h2>CHI TIẾT CÁC GIAI ĐOẠN</h2>`;
            
            project.stages.forEach((stage, index) => {
                const stageProgress = ProjectManager.calculateStageProgress(stage);
                const completedStageTasks = stage.tasks ? stage.tasks.filter(task => task.completed).length : 0;
                const totalStageTasks = stage.tasks ? stage.tasks.length : 0;

                htmlContent += `
                    <div class="stage-header">
                        <h3>GIAI ĐOẠN ${index + 1}: ${stage.name}</h3>
                        <p>Tiến độ: ${stageProgress}% | Hoàn thành: ${completedStageTasks}/${totalStageTasks} task</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${stageProgress}%"></div>
                        </div>
                    </div>
                `;

                if (stage.tasks && stage.tasks.length > 0) {
                    htmlContent += `
                        <table>
                            <thead>
                                <tr>
                                    <th>Tên task</th>
                                    <th>Người phụ trách</th>
                                    <th>Deadline</th>
                                    <th>Ưu tiên</th>
                                    <th>Trạng thái</th>
                                    <th>Hình ảnh</th>
                                    <th>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;

                    stage.tasks.forEach(task => {
                        const isOverdue = ProjectManager.isTaskOverdue(task, project);
                        
                        let status = '';
                        if (task.completed) {
                            status = '✅ HOÀN THÀNH';
                        } else if (isOverdue) {
                            status = '⚠️ TRỄ HẠN';
                        } else {
                            status = '⏳ ĐANG LÀM';
                        }
                        
                        const deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString('vi-VN') : 'Không có';
                        const priority = task.priority === 'high' ? 'CAO' : 'THƯỜNG';
                        
                        // Hiển thị ảnh hoặc placeholder
                        const imageCell = task.image 
                            ? `<img src="assets/img/${task.image}" alt="Task image" class="task-image-export">`
                            : '<span class="image-placeholder">Không có ảnh</span>';

                        const taskClass = task.completed ? 'task-completed' : 
                                         isOverdue ? 'task-overdue' : '';
                        const priorityClass = task.priority === 'high' ? 'priority-high' : '';

                        htmlContent += `
                            <tr class="${taskClass} ${priorityClass}">
                                <td>${task.name}</td>
                                <td>${task.assignee || 'Chưa có'}</td>
                                <td>${deadlineText}</td>
                                <td>${priority}</td>
                                <td>${status}</td>
                                <td>${imageCell}</td>
                                <td>${task.notes || ''}</td>
                            </tr>
                        `;
                    });

                    htmlContent += `</tbody></table>`;
                } else {
                    htmlContent += `<p><em>Chưa có task nào trong giai đoạn này.</em></p>`;
                }
            });
        } else {
            htmlContent += `<p><em>Chưa có giai đoạn nào trong dự án này.</em></p>`;
        }

        htmlContent += `</body></html>`;

        this.downloadDOC(htmlContent, `du-an-${project.name}.doc`);
    },

    // Hàm download DOC
    downloadDOC(htmlContent, filename) {
        const blob = new Blob([htmlContent], { 
            type: 'application/msword' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    getDashboardStats() {
        const projects = Storage.load().projects;
        return ProjectManager.getProjectStats(projects);
    }
};