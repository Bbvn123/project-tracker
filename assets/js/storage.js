const STORAGE_KEY = "projectTrackerData";

const Storage = {
    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // ĐẢM BẢO CẤU TRÚC DATA ĐÚNG VÀ CÓ FIELD IMAGE
            if (!parsed.projects) parsed.projects = [];
            parsed.projects.forEach(project => {
                if (!project.stages) project.stages = [];
                project.stages.forEach(stage => {
                    if (!stage.tasks) stage.tasks = [];
                    stage.tasks.forEach(task => {
                        // ĐẢM BẢO TASK CÓ FIELD IMAGE
                        if (task.image === undefined) {
                            task.image = null;
                        }
                        // ĐẢM BẢO CÁC FIELD KHÁC
                        if (!task.status) task.status = 'active';
                        if (!task.updatedAt) task.updatedAt = task.createdAt || new Date().toISOString();
                    });
                });
                
                // ĐẢM BẢO PROJECT CÓ ĐẦY ĐỦ FIELD
                if (!project.status) project.status = 'active';
                if (!project.mainAssignee) project.mainAssignee = '';
                if (!project.description) project.description = '';
                if (!project.priority) project.priority = 'medium';
            });
            return parsed;
        }
        return { projects: [] };
    },
    
    save(data) {
        try {
            // VALIDATION: Đảm bảo data có cấu trúc đúng trước khi lưu
            if (!data.projects) data.projects = [];
            
            const dataToSave = {
                projects: data.projects.map(project => ({
                    id: project.id,
                    name: project.name,
                    description: project.description || '',
                    stages: (project.stages || []).map(stage => ({
                        id: stage.id,
                        name: stage.name,
                        tasks: (stage.tasks || []).map(task => ({
                            id: task.id,
                            name: task.name,
                            assignee: task.assignee || '',
                            deadline: task.deadline || '',
                            notes: task.notes || '',
                            completed: task.completed || false,
                            priority: task.priority || 'medium',
                            status: task.status || 'active',
                            image: task.image || null, // THÊM FIELD IMAGE
                            createdAt: task.createdAt || new Date().toISOString(),
                            updatedAt: task.updatedAt || new Date().toISOString()
                        }))
                    })),
                    priority: project.priority || 'medium',
                    deadline: project.deadline || '',
                    mainAssignee: project.mainAssignee || '',
                    status: project.status || 'active',
                    createdAt: project.createdAt || new Date().toISOString()
                }))
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu:', error);
            throw new Error('Không thể lưu dữ liệu');
        }
    },
    
    // Hàm mới: Backup dữ liệu
    backup() {
        const data = this.load();
        const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(data));
        return backupKey;
    },
    
    // Hàm mới: Khôi phục dữ liệu từ backup
    restore(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (backupData) {
            localStorage.setItem(STORAGE_KEY, backupData);
            return true;
        }
        return false;
    },
    
    // Hàm mới: Xóa tất cả dữ liệu
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    },
    
    // Hàm mới: Kiểm tra dung lượng
    getSize() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? new Blob([data]).size : 0;
    }
};