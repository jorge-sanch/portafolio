/**
 * GymTrack Pro - Motor LocalStorage y Controlador CRUD
 */

const KEYS = {
  USER: 'gymtrack_user',
  WEIGHTS: 'gymtrack_weights',
  MEALS: 'gymtrack_meals',
  WORKOUTS: 'gymtrack_workouts',
  WATER: 'gymtrack_water'
};

// ==========================================
// 1. BASE DE DATOS Y DATOS SEMILLA (INIT)
// ==========================================
const DB = {
  init() {
    if (!localStorage.getItem(KEYS.USER)) {
      localStorage.setItem(KEYS.USER, JSON.stringify({
        name: "User Fit",
        email: "user@mail.com",
        joined: "2026-07-15",
        mainGoal: "Ganar músculo",
        targetWeight: "75"
      }));
    }

      if (!localStorage.getItem(KEYS.WATER)) {
      localStorage.setItem(KEYS.WATER, JSON.stringify([
    { date: getTodayDateStr(), amount: 2 }
  ]));
}
    

    if (!localStorage.getItem(KEYS.WEIGHTS)) {
      localStorage.setItem(KEYS.WEIGHTS, JSON.stringify([
        { id: Date.now(), date: "2026-08-09", weight: 90, notes: "Me siento cansado y casi no duermo" }
      ]));
    }

    if (!localStorage.getItem(KEYS.MEALS)) {
      localStorage.setItem(KEYS.MEALS, JSON.stringify([
        { id: Date.now(), date: "2026-08-09", moment: "desayuno", name: "Huevos con frijoles y queso rayado", calories: 450, notes: "" }
      ]));
    }

    if (!localStorage.getItem(KEYS.WORKOUTS)) {
      localStorage.setItem(KEYS.WORKOUTS, JSON.stringify([
        {
          date: "2026-08-09",
          exercises: [
            {
              id: 1,
              name: "Press banca",
              group: "pecho",
              sets: [
                { reps: 12, weight: 60 },
                { reps: 12, weight: 60 },
                { reps: 12, weight: 60 }
              ]
            },
            {
              id: 2,
              name: "Dominadas con agarre supino",
              group: "espalda",
              sets: [
                { reps: 12, weight: 60 },
                { reps: 12, weight: 60 },
                { reps: 12, weight: 60 }
              ]
            }
          ]
        }
      ]));
    }
  },

  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// ==========================================
// 2. CONTROLADORES POR PÁGINA
// ==========================================

// --- PÁGINA: ENTRENAMIENTO / EJERCICIOS ---
function initEjercicios() {
  const fechaInput = document.getElementById('fecha');
  const historialSelect = document.getElementById('historial');
  const appContainer = document.querySelector('.app-container');

  if (!fechaInput || !historialSelect) {
    console.error("GymTrack: No se encontraron los inputs de fecha o historial en el DOM.");
    return;
  }

  // 1. Establecer fecha inicial
  if (!fechaInput.value) {
    fechaInput.value = getTodayDateStr();
  }

  // 2. Lógica blindada para el Historial
  const syncHistorialSelect = () => {
    let workouts = [];
    try {
      workouts = DB.get(KEYS.WORKOUTS);
      if (!Array.isArray(workouts)) workouts = [];
    } catch (e) {
      console.error("GymTrack: Error leyendo workouts", e);
    }

    // Filtrar solo los días que tienen ejercicios válidos
    const validWorkouts = workouts.filter(w => w && Array.isArray(w.exercises) && w.exercises.length > 0);
    validWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    historialSelect.innerHTML = `<option value="" disabled>Selecciona un registro...</option>`;
    let dateFound = false;

    validWorkouts.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.date;
      opt.textContent = w.date === getTodayDateStr() ? `${w.date} (Hoy)` : w.date;
      
      if (w.date === fechaInput.value) {
        opt.selected = true;
        dateFound = true;
      }
      historialSelect.appendChild(opt);
    });

    if (!dateFound && fechaInput.value) {
      const opt = document.createElement('option');
      opt.value = fechaInput.value;
      opt.textContent = `${fechaInput.value} (Sin registro)`;
      opt.selected = true;
      historialSelect.prepend(opt);
    }
  };

  // 3. Renderizar las tarjetas
  const renderExercises = () => {
    // Limpiar tarjetas anteriores de la pantalla
    document.querySelectorAll('.exercise-card').forEach(c => c.remove());

    let workouts = DB.get(KEYS.WORKOUTS) || [];
    if (!Array.isArray(workouts)) workouts = [];

    const currentDate = fechaInput.value;
    let currentWorkout = workouts.find(w => w.date === currentDate);

    console.log(`GymTrack: Cargando ejercicios para la fecha ${currentDate}`, currentWorkout);

    if (!currentWorkout || !Array.isArray(currentWorkout.exercises) || currentWorkout.exercises.length === 0) {
      // No hay ejercicios para hoy, no renderizamos tarjetas
      return; 
    }

    currentWorkout.exercises.forEach((ex, exIndex) => {
      const card = document.createElement('section');
      card.className = 'card exercise-card';
      card.innerHTML = `
        <div class="exercise-header">
          <div class="exercise-title-group">
            <span class="exercise-num">${exIndex + 1}</span>
            <h2 class="exercise-name">${ex.name} <span style="font-size:10px; color:var(--text-muted); font-weight:normal; text-transform:uppercase; margin-left:6px;">(${ex.group || 'Otros'})</span></h2>
            <span class="series-count">${(ex.sets || []).length} series</span>
          </div>
          <div class="exercise-actions">
            <button class="icon-btn btn-delete-ex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
            <button class="icon-btn btn-collapse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s"><path d="M18 15l-6-6-6 6"/></svg>
            </button>
          </div>
        </div>
        <div class="series-container">
          <div class="series-row header-row">
            <span class="col-num">#</span>
            <span class="col-label">REPS</span>
            <span class="col-label">PESO (KG)</span>
            <span class="col-action"></span>
          </div>
          ${(ex.sets || []).map((set, sIdx) => `
            <div class="series-row" data-sidx="${sIdx}">
              <span class="col-num num-active">${sIdx + 1}</span>
              <div class="col-input"><input type="number" class="input-field input-center set-reps" value="${set.reps}"></div>
              <div class="col-input"><input type="number" class="input-field input-center set-weight" value="${set.weight}"></div>
              <button class="icon-btn col-action btn-delete-set">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
        <button class="btn-text-add btn-add-set"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>Agregar serie</button>
      `;

      // Insertar de manera segura en el DOM
      const nav = document.querySelector('.bottom-nav');
      if (nav && nav.parentNode === appContainer) {
        appContainer.insertBefore(card, nav);
      } else {
        appContainer.appendChild(card);
      }

      // Guardado centralizado para esta tarjeta
      const saveState = () => {
        let allWorkouts = DB.get(KEYS.WORKOUTS) || [];
        const wIdx = allWorkouts.findIndex(w => w.date === currentDate);
        if (wIdx !== -1) allWorkouts[wIdx] = currentWorkout;
        else allWorkouts.push(currentWorkout);
        
        DB.set(KEYS.WORKOUTS, allWorkouts);
        renderExercises();
        syncHistorialSelect();
      };

      // Eventos de la tarjeta
      card.querySelectorAll('.series-row:not(.header-row)').forEach(row => {
        const sIdx = Number(row.dataset.sidx);
        row.querySelector('.set-reps').onchange = (e) => { ex.sets[sIdx].reps = Number(e.target.value); saveState(); };
        row.querySelector('.set-weight').onchange = (e) => { ex.sets[sIdx].weight = Number(e.target.value); saveState(); };
        row.querySelector('.btn-delete-set').onclick = () => { ex.sets.splice(sIdx, 1); saveState(); };
      });

      card.querySelector('.btn-add-set').onclick = () => { ex.sets.push({ reps: 10, weight: 0 }); saveState(); };
      card.querySelector('.btn-delete-ex').onclick = () => { 
        currentWorkout.exercises.splice(exIndex, 1); 
        saveState(); 
      };

      // Colapsar
      const btnCollapse = card.querySelector('.btn-collapse');
      const container = card.querySelector('.series-container');
      const addSetBtn = card.querySelector('.btn-add-set');
      btnCollapse.onclick = () => {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'flex' : 'none';
        addSetBtn.style.display = isHidden ? 'flex' : 'none';
        btnCollapse.querySelector('svg').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      };
    });
  };

  // 4. Agregar nuevo ejercicio
  const btnAddExercise = document.querySelector('.btn-square-add');
  if (btnAddExercise) {
    btnAddExercise.onclick = () => {
      const nameInput = document.querySelector('.exercise-input');
      const groupSelect = document.querySelector('.group-select select');

      if (!nameInput.value.trim()) return alert('Escribe un nombre para el ejercicio');

      let workouts = DB.get(KEYS.WORKOUTS) || [];
      const currentDate = fechaInput.value;
      let currentWorkout = workouts.find(w => w.date === currentDate);

      if (!currentWorkout) {
        currentWorkout = { date: currentDate, exercises: [] };
        workouts.push(currentWorkout);
      }

      currentWorkout.exercises.push({
        id: Date.now(),
        name: nameInput.value.trim(),
        group: groupSelect.value || 'Otros',
        sets: [{ reps: 12, weight: 0 }]
      });

      DB.set(KEYS.WORKOUTS, workouts);
      nameInput.value = ''; 
      renderExercises();
      syncHistorialSelect();
    };
  }

  // 5. Listeners de Navegación
  fechaInput.addEventListener('change', () => { renderExercises(); syncHistorialSelect(); });
  historialSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      fechaInput.value = e.target.value;
      renderExercises();
      syncHistorialSelect();
    }
  });

  // Inicializar
  renderExercises();
  syncHistorialSelect();
}

// --- PÁGINA: REGISTRO DE PESO ---
function initPeso() {
  const render = () => {
    const weights = DB.get(KEYS.WEIGHTS);
    const user = DB.get(KEYS.USER);

    // Render Stats
    const latestWeight = weights.length > 0 ? weights[0].weight : '--';
    const firstWeight = weights.length > 0 ? weights[weights.length - 1].weight : latestWeight;
    const progressTotal = (latestWeight !== '--' && firstWeight !== '--') ? (latestWeight - firstWeight).toFixed(1) : '+0.0';

    const currentWeightEl = document.querySelector('.stats-grid-3 .stat-card:nth-child(1) .stat-value');
    if (currentWeightEl) currentWeightEl.textContent = latestWeight;

    const progressEl = document.querySelector('.stats-grid-3 .stat-card:nth-child(3) .stat-value');
    if (progressEl) progressEl.textContent = (progressTotal >= 0 ? `+${progressTotal}` : progressTotal);

    // Meta de peso
    const targetInput = document.getElementById('meta-peso');
    if (targetInput) {
      targetInput.value = user.targetWeight || '';
      targetInput.onchange = (e) => {
        user.targetWeight = e.target.value;
        DB.set(KEYS.USER, user);
      };
    }

    // Render Historial
    const historyContainer = document.querySelector('.history-section');
    if (historyContainer) {
      const existingCards = historyContainer.querySelectorAll('.history-card');
      existingCards.forEach(c => c.remove());

      weights.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card history-card';
        card.innerHTML = `
          <div class="history-info">
            <span class="history-date">${item.date}</span>
            <span class="history-note">${item.notes || 'Sin notas'}</span>
          </div>
          <div class="history-right">
            <span class="history-weight">${item.weight} kg</span>
            <button class="icon-btn btn-delete-weight" data-id="${item.id}" aria-label="Eliminar registro">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        `;
        historyContainer.appendChild(card);
      });

      // Evento eliminar
      document.querySelectorAll('.btn-delete-weight').forEach(btn => {
        btn.onclick = (e) => {
          const id = Number(e.currentTarget.dataset.id);
          const updated = weights.filter(w => w.id !== id);
          DB.set(KEYS.WEIGHTS, updated);
          render();
        };
      });
    }
  };

  // Autocompletar fecha de hoy en el formulario
  const fechaInput = document.getElementById('fecha-peso');
  if (fechaInput) fechaInput.value = getTodayDateStr();

  // Guardar nuevo registro (CREATE)
  const btnGuardar = document.querySelector('.record-card .btn-add');
  if (btnGuardar) {
    btnGuardar.onclick = () => {
      const weightVal = parseFloat(document.getElementById('val-peso').value);
      const notesVal = document.getElementById('notas-peso').value;
      const dateVal = document.getElementById('fecha-peso').value || getTodayDateStr();

      if (!weightVal) {
        alert('Por favor ingresa un valor de peso válido');
        return;
      }

      const weights = DB.get(KEYS.WEIGHTS);
      weights.unshift({
        id: Date.now(),
        date: dateVal,
        weight: weightVal,
        notes: notesVal
      });

      DB.set(KEYS.WEIGHTS, weights);
      document.getElementById('notas-peso').value = '';
      render();
    };
  }

  render();
}

// --- PÁGINA: DIETA ---
// --- PÁGINA: DIETA ---
// --- PÁGINA: DIETA ---
function initDieta() {
  const fechaInput = document.getElementById('fecha-dieta') || document.getElementById('fecha');
  const appContainer = document.querySelector('.app-container');
  
  if (!fechaInput) {
    console.error("GymTrack: No se encontró el input de fecha en la página de dieta.");
    return;
  }

  // 1. Establecer fecha de hoy al entrar
  if (!fechaInput.value) {
    fechaInput.value = getTodayDateStr();
  }

  // Elementos del Agua
  const btnSumarAgua = document.getElementById('btn-sumar-agua');
  const btnRestarAgua = document.getElementById('btn-restar-agua');
  const contadorAgua = document.getElementById('contador-agua');

  // Lógica del Agua
  const renderAgua = () => {
    if (!contadorAgua) return;
    let allWater = DB.get(KEYS.WATER) || [];
    if (!Array.isArray(allWater)) allWater = [];
    
    const currentDate = fechaInput.value;
    const waterData = allWater.find(w => w.date === currentDate);
    contadorAgua.textContent = waterData ? waterData.amount : 0;
  };

  const updateAgua = (cambio) => {
    let allWater = DB.get(KEYS.WATER) || [];
    if (!Array.isArray(allWater)) allWater = [];
    
    const currentDate = fechaInput.value;
    let waterIndex = allWater.findIndex(w => w.date === currentDate);
    
    if (waterIndex === -1) {
      allWater.push({ date: currentDate, amount: 0 });
      waterIndex = allWater.length - 1;
    }
    
    let nuevaCantidad = allWater[waterIndex].amount + cambio;
    if (nuevaCantidad < 0) nuevaCantidad = 0;
    
    allWater[waterIndex].amount = nuevaCantidad;
    DB.set(KEYS.WATER, allWater);
    renderAgua();
  };

  if (btnSumarAgua) btnSumarAgua.onclick = () => updateAgua(0.25);
  if (btnRestarAgua) btnRestarAgua.onclick = () => updateAgua(-0.25);

  // 2. Renderizar Comidas respetando tu estructura HTML exacta
  const renderComidas = () => {
    const currentDate = fechaInput.value;
    let meals = DB.get(KEYS.MEALS) || [];
    if (!Array.isArray(meals)) meals = [];

    // Limpiar tarjetas de comida anteriores antes de pintar las del día
    document.querySelectorAll('.meal-card').forEach(c => c.remove());

    // Filtrar comidas del día seleccionado
    let comidasDelDia = meals.filter(m => m.date === currentDate);

    // Si no hay comidas para este día, podemos dejarlo vacío o mostrar un estado inicial opcional
    comidasDelDia.forEach((meal, mealIndex) => {
      const card = document.createElement('div');
      card.className = 'card meal-card';
      card.innerHTML = `
        <div class="meal-header">
          <div class="meal-title-group">
            <span class="badge" style="text-transform: capitalize;">${meal.moment || 'Desayuno'}</span>
            <h2 class="meal-title">${meal.name || 'Nueva Comida'}</h2>
          </div>
          <div class="meal-actions">
            <button class="icon-btn btn-delete-meal" aria-label="Eliminar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button class="icon-btn btn-collapse-meal" aria-label="Colapsar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="meal-body">
          <div class="form-row-2">
            <div class="form-group">
              <label>Momento del día</label>
              <div class="select-wrapper">
                <select class="input-field select-field meal-moment">
                  <option value="desayuno" ${meal.moment === 'desayuno' ? 'selected' : ''}>Desayuno</option>
                  <option value="almuerzo" ${meal.moment === 'almuerzo' ? 'selected' : ''}>Almuerzo</option>
                  <option value="cena" ${meal.moment === 'cena' ? 'selected' : ''}>Cena</option>
                  <option value="snack" ${meal.moment === 'snack' ? 'selected' : ''}>Snack</option>
                </select>
                <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
            <div class="form-group">
              <label>Calorías (kcal)</label>
              <input type="number" class="input-field meal-calories" value="${meal.calories || 0}">
            </div>
          </div>

          <div class="form-group">
            <label>Nombre / descripción</label>
            <input type="text" class="input-field meal-name" value="${meal.name || ''}">
          </div>

          <div class="form-group">
            <label>Notas adicionales</label>
            <textarea class="input-field textarea-field meal-notes" placeholder="Ingredientes, cantidades, cómo te sentiste...">${meal.notes || ''}</textarea>
          </div>
        </div>
      `;

      // Insertar antes de la navegación inferior o al final del contenedor
      const nav = document.querySelector('.bottom-nav');
      if (nav && nav.parentNode === appContainer) {
        appContainer.insertBefore(card, nav);
      } else {
        appContainer.appendChild(card);
      }

      // Función para guardar los cambios de esta tarjeta en LocalStorage
      const saveMealState = () => {
        let allMeals = DB.get(KEYS.MEALS) || [];
        // Encontramos el índice global real de esta comida por su ID único
        const globalIdx = allMeals.findIndex(m => m.id === meal.id);
        
        if (globalIdx !== -1) {
          allMeals[globalIdx] = meal;
          DB.set(KEYS.MEALS, allMeals);
          renderComidas(); // Refrescar vista
        }
      };

      // Escuchar cambios en tiempo real dentro de la tarjeta
      card.querySelector('.meal-moment').onchange = (e) => { meal.moment = e.target.value; saveMealState(); };
      card.querySelector('.meal-calories').onchange = (e) => { meal.calories = Number(e.target.value); saveMealState(); };
      card.querySelector('.meal-name').onchange = (e) => { meal.name = e.target.value; saveMealState(); };
      card.querySelector('.meal-notes').onchange = (e) => { meal.notes = e.target.value; saveMealState(); };

      // Botón Eliminar Comida
      card.querySelector('.btn-delete-meal').onclick = () => {
        let allMeals = DB.get(KEYS.MEALS) || [];
        allMeals = allMeals.filter(m => m.id !== meal.id);
        DB.set(KEYS.MEALS, allMeals);
        renderComidas();
      };

      // Botón Colapsar Tarjeta
      const btnCollapse = card.querySelector('.btn-collapse-meal');
      const mealBody = card.querySelector('.meal-body');
      btnCollapse.onclick = () => {
        const isHidden = mealBody.style.display === 'none';
        mealBody.style.display = isHidden ? 'block' : 'none';
        btnCollapse.querySelector('svg').style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
      };
    });
  };

  // 3. Botón flotante o general para "Agregar nueva comida" en la fecha actual
  // (Si tienes un botón de agregar en tu HTML, asegúrate de asignarle esta lógica)
  const btnAddMeal = document.getElementById('btn-add-meal'); // O la clase que uses para agregar
  if (btnAddMeal) {
    btnAddMeal.onclick = () => {
      let allMeals = DB.get(KEYS.MEALS) || [];
      if (!Array.isArray(allMeals)) allMeals = [];

      allMeals.push({
        id: Date.now(),
        date: fechaInput.value,
        moment: 'desayuno',
        name: 'Nueva comida',
        calories: 400,
        notes: ''
      });

      DB.set(KEYS.MEALS, allMeals);
      renderComidas();
    };
  }

  // 4. Evento al cambiar la fecha en el calendario
  fechaInput.addEventListener('change', () => {
    renderAgua();
    renderComidas();
  });

  // Inicializar vista al cargar
  renderAgua();
  renderComidas();
}

// --- PÁGINA: PERFIL ---
function initPerfil() {
  const user = DB.get(KEYS.USER);
  const workouts = DB.get(KEYS.WORKOUTS);
  const meals = DB.get(KEYS.MEALS);
  const weights = DB.get(KEYS.WEIGHTS);

  // 1. Datos personales
  const nameEl = document.querySelector('.user-name');
  const emailEl = document.querySelector('.user-email');
  const joinedEl = document.querySelector('.user-joined span');
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (joinedEl) joinedEl.textContent = `Miembro desde ${user.joined}`;

  // 2. Estadísticas rápidas
  const stats = document.querySelectorAll('.stats-grid-3 .stat-box .stat-number');
  if (stats.length >= 3) {
    stats[0].textContent = workouts.length;
    stats[1].textContent = meals.length;
    stats[2].textContent = weights.length > 0 ? weights[0].weight : '--';
  }

  // 3. Referencias a los nuevos controles
  const goalSelect = document.getElementById('goal-select');
  const weightInput = document.getElementById('weight-goal-input');
  const saveGoalBtn = document.getElementById('save-goal-btn');
  const saveWeightBtn = document.getElementById('save-weight-btn');
  const currentGoalDisplay = document.getElementById('current-goal-display');
  const currentWeightDisplay = document.getElementById('current-weight-display');

  // 4. Cargar valores actuales en los controles y displays
  if (goalSelect) {
    goalSelect.value = user.mainGoal || 'Ganar músculo';
  }
  if (currentGoalDisplay) {
    currentGoalDisplay.textContent = user.mainGoal || 'Ganar músculo';
  }
  if (weightInput) {
    weightInput.value = user.targetWeight || '';
  }
  if (currentWeightDisplay) {
    const w = user.targetWeight ? `${user.targetWeight} kg` : 'Sin meta';
    currentWeightDisplay.textContent = w;
  }

  // 5. Guardar objetivo (sin prompt, con select)
  if (saveGoalBtn) {
    saveGoalBtn.onclick = () => {
      const newGoal = goalSelect.value;
      user.mainGoal = newGoal;
      DB.set(KEYS.USER, user);
      if (currentGoalDisplay) currentGoalDisplay.textContent = newGoal;
      // Feedback visual
      saveGoalBtn.textContent = '✓ Guardado';
      setTimeout(() => { saveGoalBtn.textContent = 'Guardar'; }, 1500);
      console.log('Objetivo guardado:', newGoal); // Para depurar
    };
  }

  // 6. Guardar meta de peso
  if (saveWeightBtn) {
    saveWeightBtn.onclick = () => {
      const raw = weightInput.value.trim();
      if (raw === '') {
        // Borrar meta
        user.targetWeight = '';
        DB.set(KEYS.USER, user);
        if (currentWeightDisplay) currentWeightDisplay.textContent = 'Sin meta';
        saveWeightBtn.textContent = '✓ Eliminado';
        setTimeout(() => { saveWeightBtn.textContent = 'Guardar'; }, 1500);
        console.log('Meta eliminada');
        return;
      }
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) {
        user.targetWeight = parsed.toString();
        DB.set(KEYS.USER, user);
        if (currentWeightDisplay) currentWeightDisplay.textContent = `${parsed} kg`;
        saveWeightBtn.textContent = '✓ Guardado';
        setTimeout(() => { saveWeightBtn.textContent = 'Guardar'; }, 1500);
        console.log('Meta guardada:', parsed);
      } else {
        alert('Ingresa un número válido (ej. 75)');
        weightInput.focus();
      }
    };
  }

  // 7. Botón Cerrar sesión / Reset
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      if (confirm('¿Deseas reiniciar los datos de la demo a su estado inicial?')) {
        localStorage.clear();
        location.reload();
      }
    };
  }
}


// Pagina de Inicio

function initInicio() {
  const today = getTodayDateStr();

  // 1. Mostrar nombre del usuario
  const user = DB.get(KEYS.USER);
  const userNameSpan = document.getElementById('user-name');
  if (userNameSpan) userNameSpan.textContent = user.name || 'Usuario';

  // 2. Generar los días de la semana (week-card)
  const weekContainer = document.getElementById('week-container');
  if (weekContainer) {
    // Obtener el día de la semana actual (0 = domingo, 1 = lunes...)
    const todayDate = new Date();
    const currentDayIndex = todayDate.getDay(); // 0-6
    // Ajustar para que la semana empiece en lunes (1) en lugar de domingo (0)
    const startDate = new Date(todayDate);
    startDate.setDate(todayDate.getDate() - currentDayIndex + (currentDayIndex === 0 ? -6 : 1)); // ir al lunes

    let html = '';
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const dayNumber = d.getDate();
      const dayName = dayNames[i];
      html += `
        <div class="day-item ${isToday ? 'active' : ''}">
          <span class="day-name">${dayName}</span>
          <span class="day-number">${dayNumber}</span>
        </div>
      `;
    }
    weekContainer.innerHTML = html;
  }

  // 3. Cargar métricas del día
  // Calorías de hoy
  const meals = DB.get(KEYS.MEALS) || [];
  const todayMeals = meals.filter(m => m.date === today);
  const totalCal = todayMeals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const calSpan = document.getElementById('home-calories');
  if (calSpan) calSpan.textContent = totalCal;

  // Agua de hoy
  const waterRecords = DB.get(KEYS.WATER) || [];
  const todayWater = waterRecords.find(w => w.date === today);
  const waterSpan = document.getElementById('home-water');
  if (waterSpan) waterSpan.textContent = todayWater ? todayWater.amount : 0;

  // Peso actual (el más reciente)
  const weights = DB.get(KEYS.WEIGHTS) || [];
  const latestWeight = weights.length > 0 ? weights[0].weight : 0;
  const weightSpan = document.getElementById('home-weight');
  if (weightSpan) weightSpan.textContent = latestWeight;

  // 4. Actualizar la tarjeta de objetivo (progreso)
  const goalTitle = document.getElementById('goal-title-text');
const goalBadge = document.getElementById('goal-badge-status');
const labelMeta = document.getElementById('label-meta-tipo');
const totalChangeSpan = document.getElementById('total-change-value');

if (goalTitle && user.mainGoal) {
    goalTitle.textContent = `Objetivo: ${user.mainGoal}`;
}
if (goalBadge && user.mainGoal) {
    goalBadge.textContent = 'En progreso';
}

  // Calcular cambio de peso desde el primer registro hasta el último
  let totalChange = 0;
  if (weights.length >= 2) {
    const first = weights[weights.length - 1].weight;
    const last = weights[0].weight;
    totalChange = last - first;
  } else if (weights.length === 1) {
    totalChange = 0; // solo un registro, no hay cambio
  }

  // Determinar si el objetivo es ganar o perder peso
  const goal = user.mainGoal ? user.mainGoal.toLowerCase() : '';
  const isGain = goal.includes('ganar') || goal.includes('aumentar') || goal.includes('músculo');
  const isLose = goal.includes('perder') || goal.includes('bajar') || goal.includes('reducir');

  let labelText = 'Pérdida total';
  let sign = '';
  if (isGain) {
    labelText = 'Ganancia total';
    sign = totalChange >= 0 ? '+' : '';
  } else if (isLose) {
    labelText = 'Pérdida total';
    sign = totalChange <= 0 ? '' : '+'; // si está perdiendo, el cambio debe ser negativo, pero mostramos el valor absoluto?
    // Para pérdida, mostramos el valor absoluto con signo negativo si aumentó (mal)
    // Mejor: mostrar el cambio real con signo
  } else {
    // Sin objetivo específico, mostrar el cambio real
    labelText = 'Cambio total';
    sign = totalChange >= 0 ? '+' : '';
  }

  if (labelMeta) labelMeta.textContent = labelText;
  if (totalChangeSpan) {
    // Para pérdida, queremos mostrar el valor absoluto si es negativo? Depende.
    // Mostramos el cambio real con su signo.
    const value = totalChange.toFixed(1);
    totalChangeSpan.textContent = `${totalChange >= 0 ? '+' : ''}${value} kg`;
  }

  // 5. Asignar eventos a los botones de acción rápida (opcional)
  const btnEntrenamiento = document.querySelector('.action-card.cta-lime');
  if (btnEntrenamiento) {
    btnEntrenamiento.href = 'exercises.html';
  }
  const btnDieta = document.querySelector('.action-card.action-dark');
  if (btnDieta) {
    btnDieta.href = 'diet.html';
  }
}


// ==========================================
// 3. ENRUTADOR Y NAVEGACIÓN
// ==========================================
function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Configurar enlaces de la barra de navegación inferior
function setupNavigation() {
  const pageMap = {
    'Inicio': 'index.html',
    'Ejercicios': 'exercises.html',
    'Dieta': 'diet.html',
    'Peso': 'weight.html',
    'Perfil': 'profile.html'
  };

  document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
    const label = item.querySelector('span')?.textContent.trim();
    if (label && pageMap[label]) {
      item.href = pageMap[label];
    }
  });
}



// Inicialización según la página cargada
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  setupNavigation();

  const page = document.body.dataset.page;
  switch (page) {
    case 'inicio':
      initInicio();
      break;
    case 'peso':
      initPeso();
      break;
    case 'dieta':
      initDieta();
      break;
    case 'ejercicios':
      initEjercicios();
      break;
    case 'perfil':
      initPerfil();
      break;
  }
});