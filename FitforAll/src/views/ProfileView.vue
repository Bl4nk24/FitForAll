<template>
  <!-- Haupt-Container -->
  <div :class="`theme-${editProfileData.color_contrast}`" class="container mt-5" aria-label="Profil und Übersicht">
    <div class="row">
      <!-- Linke Spalte: Benutzerinformationen -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Profil</h4>
          </div>
          <div class="card-body">
            <div v-if="profile">
              <!-- Avatar -->
              <div class="text-center mb-4">
                <img
                  :src="profile.avatar_url || defaultAvatar"
                  alt="Avatar"
                  class="rounded-circle img-thumbnail"
                  style="width: 120px; height: 120px; object-fit: cover"
                />
              </div>
              <!-- Benutzerdetails -->
              <h5 class="card-title text-center">
                {{ profile.full_name || userEmail }}
              </h5>
              <p class="card-text text-center">
                <strong>E-Mail:</strong> {{ userEmail }}
              </p>
              <div class="d-grid mt-3">
                <button class="btn btn-outline-primary" @click="editMode = true">
                  Profil bearbeiten
                </button>
              </div>
            </div>
            <div v-else>
              <p>Lade Profilinformationen...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rechte Spalte: Dashboard -->
      <div class="col-md-8">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-success text-white">
            <h4 class="mb-0">Dein Fitness-Dashboard</h4>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <h5>Nächste Trainingssession</h5>
              <p class="text-muted">
                {{ nextWorkout ? nextWorkout.name : "Kein Workout geplant" }}
              </p>
              <div v-if="nextWorkout">
                <div class="mb-2">
                  <small>Fortschritt: {{ nextWorkout.progress }}%</small>
                </div>
                <div class="progress">
                  <div
                    class="progress-bar progress-bar-striped progress-bar-animated bg-info"
                    role="progressbar"
                    :style="{ width: nextWorkout.progress + '%' }"
                    :aria-valuenow="nextWorkout.progress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            </div>
            <hr />
            <div class="mb-3">
              <h5>Aktueller Monats-Fortschritt</h5>
              <div class="row">
                <div class="col-6 text-center">
                  <h6>Trainings absolviert</h6>
                  <p class="display-6 text-primary fw-bold">
                    {{ monthlyStats.completedWorkouts }}
                  </p>
                </div>
                <div class="col-6 text-center">
                  <h6>Offene Workouts</h6>
                  <p class="display-6 text-danger fw-bold">
                    {{ monthlyStats.remainingWorkouts }}
                  </p>
                </div>
              </div>
            </div>
            <hr />
            <div>
              <h5>Empfohlene Übungen</h5>
              <ul class="list-group list-group-flush" v-if="recommendedExercises.length > 0">
                <li
                  v-for="exercise in recommendedExercises"
                  :key="exercise.id"
                  class="list-group-item"
                >
                  <strong>{{ exercise.name }}</strong> – {{ exercise.description }}
                </li>
              </ul>
              <p v-else class="text-muted">Keine Empfehlungen vorhanden.</p>
            </div>
          </div>
        </div>

        <!-- MUSKELAUSWAHL (SVG) -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-info text-white">
            <h4 class="mb-0">Muskeln mit Problemen</h4>
          </div>
          <div class="card-body">
            <div class="svg-container" v-html="svgContent" @click="handleSvgClick"></div>
            <p class="mt-3 text-muted">
              Klicke auf die Muskeln, die du aufgrund physischer Probleme <strong>nicht</strong> verwenden kannst.
              <br />
              Diese werden in der Datenbank als <em>problem_muscle_groups</em> gespeichert.
            </p>
            <div class="mt-3">
              <button class="btn btn-primary" @click="saveProfile">
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bearbeitungsformular (Modal) -->
    <div
      class="modal fade"
      tabindex="-1"
      role="dialog"
      :class="{ show: editMode }"
      style="display: block"
      v-if="editMode"
    >
      <div class="modal-dialog modal-md" role="document" @click.stop>
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Profil bearbeiten</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="cancelEdit"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveProfile">
              <!-- full_name -->
              <div class="mb-3">
                <label for="fullName" class="form-label">Voller Name</label>
                <input
                  id="fullName"
                  type="text"
                  class="form-control"
                  v-model="editProfileData.full_name"
                />
              </div>

              <!-- avatar_url -->
              <div class="mb-3">
                <label for="avatarUrl" class="form-label">Avatar URL</label>
                <input
                  id="avatarUrl"
                  type="url"
                  class="form-control"
                  v-model="editProfileData.avatar_url"
                />
                <small class="text-muted">Direkter Link zu einem Bild, z.B. https://...</small>
              </div>

              <!-- Farbschema -->
              <div class="mb-3">
                <label for="colorContrast" class="form-label">Farbschema</label>
                <select
                  id="colorContrast"
                  class="form-select"
                  v-model="editProfileData.color_contrast"
                >
                  <option value="normal">Normal</option>
                  <option value="high-contrast">Hoher Kontrast</option>
                  <option value="dark">Dunkles Design</option>
                </select>
              </div>

              <!-- Schriftgröße -->
              <div class="mb-3">
                <label for="fontSize" class="form-label">Schriftgröße</label>
                <select
                  id="fontSize"
                  class="form-select"
                  v-model="editProfileData.font_size"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Groß</option>
                  <option value="x-large">Extra Groß</option>
                </select>
              </div>

              <!-- Screenreader -->
              <div class="mb-3 form-check">
                <input
                  id="screenreader"
                  type="checkbox"
                  class="form-check-input"
                  v-model="editProfileData.screenreader"
                />
                <label for="screenreader" class="form-check-label">
                  Screenreader-Modus aktivieren
                </label>
              </div>

              <button type="submit" class="btn btn-success w-100">
                Speichern
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal-Hintergrund -->
    <div
      class="modal-backdrop fade"
      :class="{ show: editMode }"
      v-if="editMode"
      @click.self="cancelEdit"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

// Basis
const userEmail = ref("");
const profile = ref(null);
const defaultAvatar = "/assets/default-avatar.png";

// Dashboard
const nextWorkout = ref(null);
const monthlyStats = ref({ completedWorkouts: 0, remainingWorkouts: 0 });
const recommendedExercises = ref([]);

// Bearbeitungsmodus
const editMode = ref(false);
const editProfileData = ref({
  full_name: "",
  avatar_url: "",
  color_contrast: "normal",
  font_size: "normal",
  screenreader: false,
});

// Router
const router = useRouter();

/* MUSKEL-SVG & PROBLEMPARTS */
const svgContent = ref("");
const problemParts = ref([]);

/* Klick auf SVG -> Muskeln toggeln */
function handleSvgClick(event) {
  const target = event.target;
  if (target.classList.contains("s2")) {
    const partId = target.id;
    if (problemParts.value.includes(partId)) {
      // Entfernen
      problemParts.value = problemParts.value.filter((m) => m !== partId);
      target.classList.remove("active");
    } else {
      // Hinzufügen
      problemParts.value.push(partId);
      target.classList.add("active");
    }
  }
}

onMounted(async () => {
  // 1) Auth prüfen
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return router.push("/auth");
  }
  userEmail.value = authData.user.email;

  // 2) SVG laden
  try {
    const response = await fetch("/assets/Muscle_Map.svg");
    svgContent.value = await response.text();
  } catch (error) {
    console.error("Fehler beim Laden der SVG:", error);
  }

  // 3) user_settings + profiles laden
  try {
    const { data: userSettingsData } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    profile.value = {
      ...userSettingsData,
      ...profileData,
    };

    // Problem-Muskeln
    problemParts.value = userSettingsData.problem_muscle_groups || [];

    // Formularfelder befüllen
    editProfileData.value.full_name = profile.value.full_name || "";
    editProfileData.value.avatar_url = profile.value.avatar_url || "";
    editProfileData.value.color_contrast = userSettingsData.color_contrast || "normal";
    editProfileData.value.font_size = userSettingsData.font_size || "normal";
    editProfileData.value.screenreader = userSettingsData.screenreader || false;

    // SVG "active" markieren
    await nextTick();
    problemParts.value.forEach((muscleId) => {
      const el = document.getElementById(muscleId);
      if (el) el.classList.add("active");
    });

    // Themes + Schrift global setzen
    document.body.classList.remove("theme-normal", "theme-high-contrast", "theme-dark");
    document.body.classList.add(`theme-${editProfileData.value.color_contrast}`);

    document.body.classList.remove("font-normal", "font-large", "font-x-large");
    document.body.classList.add(`font-${editProfileData.value.font_size}`);

    // Screenreader in localStorage
    localStorage.setItem(
      'screenreader',
      editProfileData.value.screenreader ? 'true' : 'false'
    );
  } catch (err) {
    console.error(err);
  }

  // Demo-Dashboard
  nextWorkout.value = { name: "Oberkörper-Workout", progress: 50 };
  monthlyStats.value.completedWorkouts = 5;
  monthlyStats.value.remainingWorkouts = 3;
  recommendedExercises.value = [
    { id: 1, name: "Liegestütze", description: "Trainiert Brust und Arme" },
    { id: 2, name: "Klimmzüge", description: "Stärkt Rücken und Bizeps" },
  ];
});

/* Watcher: Farbschema */
watch(
  () => editProfileData.value.color_contrast,
  (newContrast) => {
    document.body.classList.remove("theme-normal", "theme-high-contrast", "theme-dark");
    document.body.classList.add(`theme-${newContrast}`);
  }
);

/* Watcher: Schriftgröße */
watch(
  () => editProfileData.value.font_size,
  (newFontSize) => {
    document.body.classList.remove("font-normal", "font-large", "font-x-large");
    document.body.classList.add(`font-${newFontSize}`);
  }
);

/* Watcher: Screenreader (Sofort in localStorage) */
watch(
  () => editProfileData.value.screenreader,
  (newVal) => {
    localStorage.setItem('screenreader', newVal ? 'true' : 'false');
  }
);

/* Speichern */
async function saveProfile() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return router.push("/auth");

  try {
    // 1) profiles
    const profileUpdates = {
      full_name: editProfileData.value.full_name || null,
      avatar_url: editProfileData.value.avatar_url || null,
    };
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", authData.user.id);
    if (profileError) {
      console.error("Fehler in 'profiles':", profileError.message);
      return;
    }

    // 2) user_settings
    const userSettingsUpdates = {
      color_contrast: editProfileData.value.color_contrast,
      font_size: editProfileData.value.font_size,
      screenreader: editProfileData.value.screenreader,
      problem_muscle_groups: problemParts.value,
    };
    const { error: userSettingsError } = await supabase
      .from("user_settings")
      .update(userSettingsUpdates)
      .eq("user_id", authData.user.id);
    if (userSettingsError) {
      console.error("Fehler in 'user_settings':", userSettingsError.message);
      return;
    }

    // Theme + Schrift nochmal anwenden
    document.body.classList.remove("theme-normal", "theme-high-contrast", "theme-dark");
    document.body.classList.add(`theme-${editProfileData.value.color_contrast}`);

    document.body.classList.remove("font-normal", "font-large", "font-x-large");
    document.body.classList.add(`font-${editProfileData.value.font_size}`);

    // Screenreader in localStorage
    localStorage.setItem(
      'screenreader',
      editProfileData.value.screenreader ? 'true' : 'false'
    );

    console.log("Profil & Einstellungen erfolgreich gespeichert!");
    editMode.value = false; // Modal schließen
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }
}

/* Abbrechen */
function cancelEdit() {
  editMode.value = false;
}
</script>

<style scoped>
/* SVG-Container */
.svg-container {
  width: 100%;
  height: auto;
  max-width: 100%;
  overflow: hidden;
}

/* klickbare Muskeln */
.s2 {
  fill: #cccccc;
  cursor: pointer;
  transition: fill 0.3s;
}
.s2:hover {
  fill: #007bff;
}
.s2.active {
  fill: #ff0000;
}

/* Modal-Overlay */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Modal */
.modal-content {
  background-color: #ffffff;
}
.theme-dark .modal-content {
  background-color: #333333;
  color: #ffffff;
}
</style>
