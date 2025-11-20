const ProjectManager = {
    create(name) {
        return {
            id: "pj_" + Date.now(),
            name,
            description: '',
            stages: [],
            createdAt: new Date().toISOString(),
            priority: 'medium',
            deadline: '',
            mainAssignee: '',
            status: 'active'
        };
    },

    addStage(projectId, stageName) {
        const stage = {
            id: "st_" + Date.now(),
            name: stageName,
            tasks: [] // ĐẢM BẢO LUÔN CÓ MẢNG TASKS RỖNG
        };
        return stage;
    },

    addTask(projectId, stageId, taskData) {
        return {
            id: "tk_" + Date.now(),
            name: taskData.name,
            assignee: taskData.assignee || '',
            deadline: taskData.deadline || '',
            notes: taskData.notes || '',
            completed: false,
            priority: taskData.priority || 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active',
            image: taskData.image || null // THÊM FIELD ẢNH
        };
    },

    // Tính % hoàn thành của dự án
    calculateProjectProgress(project) {
        if (!project.stages || project.stages.length === 0) return 0;
        
        const stageProgresses = project.stages.map(stage => this.calculateStageProgress(stage));
        const totalProgress = stageProgresses.reduce((sum, progress) => sum + progress, 0);
        return Math.round(totalProgress / stageProgresses.length);
    },

    // Tính % hoàn thành của giai đoạn
    calculateStageProgress(stage) {
        if (!stage.tasks || stage.tasks.length === 0) return 0;
        
        const completedTasks = stage.tasks.filter(task => task.completed).length;
        return Math.round((completedTasks / stage.tasks.length) * 100);
    },

    // Kiểm tra task có trễ hạn không (ĐÃ SỬA)
    isTaskOverdue(task, project) {
        // Task đã hoàn thành thì không trễ hạn
        if (task.completed) return false;
        
        // Dự án đã hoàn thành 100% thì task không trễ hạn
        if (this.calculateProjectProgress(project) === 100) {
            return false;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 1. Kiểm tra deadline của chính task
        if (task.deadline) {
            const taskDeadline = new Date(task.deadline);
            taskDeadline.setHours(0, 0, 0, 0);
            if (taskDeadline < today) {
                return true;
            }
        }
        
        // 2. Kiểm tra deadline của dự án (chỉ khi dự án chưa hoàn thành)
        if (project.deadline && this.calculateProjectProgress(project) < 100) {
            const projectDeadline = new Date(project.deadline);
            projectDeadline.setHours(0, 0, 0, 0);
            if (projectDeadline < today) {
                return true;
            }
        }
        
        return false;
    },

    // Kiểm tra dự án có trễ hạn không (ĐÃ SỬA)
    isProjectOverdue(project) {
        // Dự án đã hoàn thành 100% thì không trễ hạn
        if (this.calculateProjectProgress(project) === 100) {
            return false;
        }
        
        // Không có deadline thì không trễ hạn
        if (!project.deadline) {
            return false;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const projectDeadline = new Date(project.deadline);
        projectDeadline.setHours(0, 0, 0, 0);
        
        // Chỉ trễ hạn khi QUÁ NGÀY và CHƯA HOÀN THÀNH 100%
        return projectDeadline < today;
    },

    // Cập nhật trạng thái overdue cho tất cả (ĐÃ SỬA)
    updateOverdueStatuses() {
        const data = Storage.load();
        data.projects.forEach(project => {
            const progress = this.calculateProjectProgress(project);
            
            // Cập nhật trạng thái dự án
            if (progress === 100) {
                project.status = 'completed';
            } else if (this.isProjectOverdue(project)) {
                project.status = 'overdue';
            } else {
                project.status = 'active';
            }
            
            // Cập nhật trạng thái task
            if (project.stages) {
                project.stages.forEach(stage => {
                    if (stage.tasks) {
                        stage.tasks.forEach(task => {
                            if (task.completed) {
                                task.status = 'completed';
                            } else if (this.isTaskOverdue(task, project)) {
                                task.status = 'overdue';
                            } else {
                                task.status = 'active';
                            }
                        });
                    }
                });
            }
        });
        Storage.save(data);
    },

    // Lọc dự án theo trạng thái
    filterProjects(projects, filter) {
        this.updateOverdueStatuses();
        
        switch (filter) {
            case 'active':
                return projects.filter(project => 
                    project.status === 'active' && 
                    this.calculateProjectProgress(project) < 100
                );
                
            case 'completed':
                return projects.filter(project => 
                    project.status === 'completed' || 
                    this.calculateProjectProgress(project) === 100
                );
                
            case 'overdue':
                return projects.filter(project => 
                    project.status === 'overdue'
                );
                
            case 'high-priority':
                return projects.filter(project => 
                    project.priority === 'high' || project.priority === 'urgent'
                );
                
            default:
                return projects;
        }
    },

    // Thống kê tổng quan
    getProjectStats(projects) {
        this.updateOverdueStatuses();
        
        const total = projects.length;
        const active = projects.filter(project => 
            project.status === 'active' && 
            this.calculateProjectProgress(project) < 100
        ).length;
        const completed = projects.filter(project => 
            project.status === 'completed' || 
            this.calculateProjectProgress(project) === 100
        ).length;
        const overdue = projects.filter(project => 
            project.status === 'overdue'
        ).length;
        
        return { total, active, completed, overdue };
    },

    // Lấy màu cho priority
    getPriorityColor(priority) {
        const colors = {
            'low': '#28a745',
            'medium': '#17a2b8', 
            'high': '#ffc107',
            'urgent': '#dc3545'
        };
        return colors[priority] || '#6c757d';
    },

    // Lấy icon cho priority
    getPriorityIcon(priority) {
        const icons = {
            'low': '🔵',
            'medium': '🔵', 
            'high': '🟡',
            'urgent': '🔴'
        };
        return icons[priority] || '⚪';
    },

    deleteProject(projectId) {
        const data = Storage.load();
        data.projects = data.projects.filter(p => p.id !== projectId);
        Storage.save(data);
    },

    deleteStage(projectId, stageId) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            project.stages = project.stages.filter(s => s.id !== stageId);
            Storage.save(data);
        }
    },

    toggleTask(projectId, stageId, taskId) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            const stage = project.stages.find(s => s.id === stageId);
            if (stage) {
                const task = stage.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    task.status = task.completed ? 'completed' : 'active';
                    task.updatedAt = new Date().toISOString();
                    Storage.save(data);
                }
            }
        }
    },

    // Hàm mới: Cập nhật ảnh cho task
    updateTaskImage(projectId, stageId, taskId, imageFileName) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            const stage = project.stages.find(s => s.id === stageId);
            if (stage) {
                const task = stage.tasks.find(t => t.id === taskId);
                if (task) {
                    task.image = imageFileName;
                    task.updatedAt = new Date().toISOString();
                    Storage.save(data);
                    return true;
                }
            }
        }
        return false;
    },

    // Hàm mới: Xóa ảnh của task
    removeTaskImage(projectId, stageId, taskId) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            const stage = project.stages.find(s => s.id === stageId);
            if (stage) {
                const task = stage.tasks.find(t => t.id === taskId);
                if (task && task.image) {
                    task.image = null;
                    task.updatedAt = new Date().toISOString();
                    Storage.save(data);
                    return true;
                }
            }
        }
        return false;
    },

    // Hàm mới: Kiểm tra task có ảnh không
    hasTaskImage(projectId, stageId, taskId) {
        const data = Storage.load();
        const project = data.projects.find(p => p.id === projectId);
        if (project) {
            const stage = project.stages.find(s => s.id === stageId);
            if (stage) {
                const task = stage.tasks.find(t => t.id === taskId);
                return task && task.image;
            }
        }
        return false;
    }
};