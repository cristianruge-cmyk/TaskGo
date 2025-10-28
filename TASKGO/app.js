// TaskGo - app.js (vanilla JS)
// Guarda tareas en localStorage y maneja notificaciones locales (cuando la app está abierta o instalada como PWA).
import { ThemeProvider } from "./context/ThemeContext";

const STORAGE_KEY = 'taskgo_tasks_v1';
let tasks = [];
let editingId = null;

const qs = sel => document.querySelector(sel);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  }catch(e){
    console.error('Error cargando tareas', e);
    tasks = [];
  }
}

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(ts){
  if(!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString();
}

function renderTasks(){
  const ul = qs('#tasks-list');
  ul.innerHTML = '';
  if(tasks.length === 0){
    ul.innerHTML = '<li class="task-card"><div class="task-main"><span class="meta">No hay tareas. Agrega la primera arriba.</span></div></li>';
    return;
  }
  // Order: incompletas primero, luego por due date
  const sorted = tasks.slice().sort((a,b)=>{
    if(a.completed !== b.completed) return a.completed ? 1 : -1;
    if(a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
    if(a.dueDate && !b.dueDate) return -1;
    if(!a.dueDate && b.dueDate) return 1;
    return 0;
  });

  for(const t of sorted){
    const li = document.createElement('li');
    li.className = 'task-card';
    const main = document.createElement('div');
    main.className = 'task-main';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = !!t.completed;
    chk.addEventListener('change', ()=> toggleComplete(t.id));

    const info = document.createElement('div');
    info.style.minWidth = '0';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = t.title;
    if(t.completed) title.classList.add('completed');
    const meta = document.createElement('div');
    meta.className = 'meta';
    const parts = [];
    if(t.category) parts.push(t.category);
    if(t.priority) parts.push('Prioridad: '+t.priority);
    if(t.dueDate) parts.push('Vence: '+formatDate(t.dueDate));
    meta.textContent = parts.join(' · ');

    info.appendChild(title);
    info.appendChild(meta);

    main.appendChild(chk);
    main.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'btns';

    const editBtn = document.createElement('button');
    editBtn.className = 'small-btn';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', ()=> startEditTask(t.id));

    const delBtn = document.createElement('button');
    delBtn.className = 'small-btn';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', ()=> deleteTask(t.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(main);
    li.appendChild(actions);
    ul.appendChild(li);
  }
}

function addTaskFromForm(e){
  e.preventDefault();
  const title = qs('#title').value.trim();
  const dueRaw = qs('#due').value;
  const priority = qs('#priority').value;
  const category = qs('#category').value.trim();
  const notify = qs('#notify').checked;

  if(!title){
    alert('La tarea necesita un título.');
    return;
  }

  if(editingId){
    // actualizar
    const idx = tasks.findIndex(x=>x.id === editingId);
    if(idx === -1) return;
    tasks[idx].title = title;
    tasks[idx].priority = priority;
    tasks[idx].category = category;
    tasks[idx].notify = notify;
    tasks[idx].notified = false; // permitir nueva notificación
    tasks[idx].dueDate = dueRaw ? new Date(dueRaw).getTime() : null;
    editingId = null;
    qs('#save-btn').textContent = 'Agregar tarea';
    qs('#cancel-edit').classList.add('hidden');
  }else{
    const task = {
      id: uid(),
      title,
      createdAt: Date.now(),
      dueDate: dueRaw ? new Date(dueRaw).getTime() : null,
      priority,
      category,
      completed: false,
      notify: notify,
      notified: false
    };
    tasks.push(task);
  }

  saveTasks();
  renderTasks();
  scheduleImmediateChecks();
  qs('#task-form').reset();
}

function startEditTask(id){
  const t = tasks.find(x=>x.id===id);
  if(!t) return;
  editingId = id;
  qs('#title').value = t.title;
  qs('#due').value = t.dueDate ? new Date(t.dueDate).toISOString().slice(0,16) : '';
  qs('#priority').value = t.priority || 'media';
  qs('#category').value = t.category || '';
  qs('#notify').checked = !!t.notify;
  qs('#save-btn').textContent = 'Guardar cambios';
  qs('#cancel-edit').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
}

function cancelEdit(){
  editingId = null;
  qs('#task-form').reset();
  qs('#save-btn').textContent = 'Agregar tarea';
  qs('#cancel-edit').classList.add('hidden');
}

function toggleComplete(id){
  const t = tasks.find(x=>x.id===id);
  if(!t) return;
  t.completed = !t.completed;
  saveTasks();
  renderTasks();
}

function deleteTask(id){
  if(!confirm('¿Eliminar tarea?')) return;
  tasks = tasks.filter(x=>x.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted(){
  tasks = tasks.filter(x=>!x.completed);
  saveTasks();
  renderTasks();
}

// -- Notifications --
async function requestNotificationPermission(){
  if(!('Notification' in window)) return;
  if(Notification.permission === 'default'){
    try{
      await Notification.requestPermission();
    }catch(e){
      console.warn('No se pudo solicitar permiso de notificaciones', e);
    }
  }
}

function showLocalNotification(task){
  // Cuando la página está abierta o la PWA instalada, se puede crear Notification()
  const body = task.category ? `${task.category} · Prioridad: ${task.priority}` : `Prioridad: ${task.priority}`;
  if('Notification' in window && Notification.permission === 'granted'){
    try{
      new Notification(task.title, {
        body: body,
        tag: task.id
      });
    }catch(e){
      console.warn('Fallo mostrando notificación', e);
    }
  }else{
    // Fallback visual si no hay permiso
    console.log('Recordatorio:', task.title);
  }
}

// Revisar cada minuto si hay tareas que deben notificar
function checkNotifications(){
  const now = Date.now();
  let changed = false;
  for(const t of tasks){
    if(t.notify && !t.notified && t.dueDate && t.dueDate <= now){
      showLocalNotification(t);
      t.notified = true;
      changed = true;
    }
  }
  if(changed) saveTasks();
}

// Después de guardar/editar, hacer una comprobación inmediata
function scheduleImmediateChecks(){
  checkNotifications();
}

// Inicialización
function initApp(){
  // Elementos
  qs('#task-form').addEventListener('submit', addTaskFromForm);
  qs('#cancel-edit').addEventListener('click', cancelEdit);
  qs('#clear-completed').addEventListener('click', clearCompleted);
  qs('#export-json').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(tasks, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskgo_export.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  qs('#import-json').addEventListener('click', ()=> qs('#import-file').click());
  qs('#import-file').addEventListener('change', (ev)=>{
    const f = ev.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const imported = JSON.parse(reader.result);
        if(Array.isArray(imported)){
          // Simple replace (puedes mejorar esta lógica para merge)
          tasks = imported;
          saveTasks();
          renderTasks();
          alert('Importación completada.');
        }else{
          alert('Archivo no válido.');
        }
      }catch(e){
        alert('Error leyendo JSON: '+e.message);
      }
    };
    reader.readAsText(f);
  });

  // Cargar tareas
  loadTasks();
  renderTasks();

  // Solicitar permiso para notificaciones (opcional)
  requestNotificationPermission();

  // Registrar service worker (para PWA/offline)
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').then(()=>{
      console.log('Service Worker registrado');
    }).catch(err=> console.warn('SW no registrado', err));
  }

  // Intervalo que revisa notificaciones cada 30s
  setInterval(checkNotifications, 30 * 1000);
  // Comprobación al iniciar
  checkNotifications();
}

document.addEventListener('DOMContentLoaded', initApp);
