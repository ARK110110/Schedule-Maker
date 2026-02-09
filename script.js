const form = document.getElementById('scheduleForm');
const taskList = document.getElementById('taskList');
const categoryFilter = document.getElementById('categoryFilter');
const modal = document.getElementById('taskModal');
const closeModal = document.querySelector('.close');
const modalTime = document.getElementById('modalTime');
const modalActivity = document.getElementById('modalActivity');
const modalNote = document.getElementById('modalNote');
const modalCategory = document.getElementById('modalCategory');
const modalDeadline = document.getElementById('modalDeadline');
const modalCompleted = document.getElementById('modalCompleted');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const priorityStars = document.querySelectorAll('#priorityStars .star');
const deadlineToggle = document.getElementById('deadlineToggle');
let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
let currentIndex = -1;
let selectedColor = '#e0e0e0';
let selectedPriority = 1;

function setColor(color) {
    selectedColor = color;
    document.getElementById('customColor').value = color;
}

priorityStars.forEach(star => {
    star.addEventListener('click', () => {
        selectedPriority = parseInt(star.dataset.value);
        priorityStars.forEach(s => s.classList.remove('selected'));
        for (let i = 0; i < selectedPriority; i++) {
            priorityStars[i].classList.add('selected');
        }
    });
});

deadlineToggle.addEventListener('click', () => {
    const checkbox = document.getElementById('isDeadline');
    checkbox.checked = !checkbox.checked;
});

function updateCategories() {
    const categories = [...new Set(schedules.map(s => s.category))];
    categoryFilter.innerHTML = '<option value="">Semua Kategori</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function renderTasks() {
    const filter = categoryFilter.value;
    const filteredSchedules = schedules.filter(s => !filter || s.category === filter);
    filteredSchedules.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return a.startTime.localeCompare(b.startTime);
    });
    taskList.innerHTML = '';
    filteredSchedules.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        const rgb = hexToRgb(task.color);
        li.style.backgroundColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        li.style.borderLeftColor = task.color;
        const starsHtml = Array.from({length: 5}, (_, i) => `<span class="star ${i < task.priority ? '' : 'empty'}">${i < task.priority ? '★' : '☆'}</span>`).join('');
        const now = new Date();
        const scheduleDate = new Date(task.date);
        const daysLeft = Math.ceil((scheduleDate - now) / (1000 * 60 * 60 * 24));
        const deadlineHtml = task.isDeadline ? `<div class="deadline-info">Deadline: ${task.date} - ${daysLeft} hari lagi</div>` : '';
        li.innerHTML = `
            <div class="task-details">
                <strong>${task.startTime} - ${task.endTime}</strong> | ${task.activity} | ${task.category}
                ${deadlineHtml}
            </div>
            <div class="task-stars">${starsHtml}</div>
        `;
        li.onclick = () => openModal(schedules.indexOf(task));
        taskList.appendChild(li);
    });
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
}

function openModal(index) {
    currentIndex = index;
    const task = schedules[index];
    const now = new Date();
    const scheduleDate = new Date(task.date);
    const daysLeft = Math.ceil((scheduleDate - now) / (1000 * 60 * 60 * 24));
    modalTime.textContent = `Waktu: ${task.startTime} - ${task.endTime}`;
    modalActivity.textContent = `Aktivitas: ${task.activity}`;
    modalNote.textContent = `Catatan: ${task.note || 'Tidak ada'}`;
    modalCategory.textContent = `Kategori: ${task.category}`;
    modalDeadline.textContent = task.isDeadline ? `Deadline: ${task.date} - ${daysLeft} hari lagi` : '';
    modalCompleted.checked = task.completed;
    modal.style.display = 'block';
}

closeModal.onclick = () => modal.style.display = 'none';
window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
};

modalCompleted.onchange = () => {
    schedules[currentIndex].completed = modalCompleted.checked;
    localStorage.setItem('schedules', JSON.stringify(schedules));
    renderTasks();
};

editBtn.onclick = () => {
    const task = schedules[currentIndex];
    document.getElementById('date').value = task.date;
    document.getElementById('startTime').value = task.startTime;
    document.getElementById('endTime').value = task.endTime;
    document.getElementById('activity').value = task.activity;
    document.getElementById('note').value = task.note;
    document.getElementById('category').value = task.category;
    document.getElementById('isDeadline').checked = task.isDeadline;
    setColor(task.color);
    selectedPriority = task.priority;
    priorityStars.forEach((s, i) => s.classList.toggle('selected', i < selectedPriority));
    deleteSchedule(currentIndex);
    modal.style.display = 'none';
};

deleteBtn.onclick = () => {
    deleteSchedule(currentIndex);
    modal.style.display = 'none';
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSchedule = {
        date: document.getElementById('date').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        activity: document.getElementById('activity').value,
        note: document.getElementById('note').value,
        category: document.getElementById('category').value,
        isDeadline: document.getElementById('isDeadline').checked,
        color: selectedColor,
        priority: selectedPriority,
        completed: false
    };
    schedules.push(newSchedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    updateCategories();
    renderTasks();
    form.reset();
    selectedColor = '#e0e0e0';
    selectedPriority = 1;
    priorityStars.forEach(s => s.classList.remove('selected'));
});

function deleteSchedule(index) {
    schedules.splice(index, 1);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    updateCategories();
    renderTasks();
}

function clearAllSchedules() {
    if (confirm('Apakah Anda yakin ingin menghapus semua jadwal?')) {
        schedules = [];
        localStorage.setItem('schedules', JSON.stringify(schedules));
        updateCategories();
        renderTasks();
    }
}

categoryFilter.onchange = renderTasks;

updateCategories();
renderTasks();