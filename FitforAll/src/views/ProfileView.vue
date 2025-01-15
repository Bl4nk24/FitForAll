<template>
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
              <!-- Avatar / Bild -->
              <div class="text-center mb-4">
                <img :src="profile.avatar_url || defaultAvatar" alt="Avatar" class="rounded-circle img-thumbnail"
                  style="width: 120px; height: 120px; object-fit: cover" />
              </div>
              <!-- Benutzerdetails -->
              <h5 class="card-title text-center">
                {{ profile.full_name || userEmail }}
              </h5>

              <p class="card-text text-center">
                <strong>E-Mail:</strong> {{ userEmail }}
              </p>
              <!-- Button zum Anzeigen des Bearbeitungsformulars -->
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
              <!-- Beispiel für einen Fortschrittsbalken -->
              <div v-if="nextWorkout">
                <div class="mb-2">
                  <small>Fortschritt: {{ nextWorkout.progress }}%</small>
                </div>
                <div class="progress">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-info" role="progressbar"
                    :style="{ width: nextWorkout.progress + '%' }" :aria-valuenow="nextWorkout.progress"
                    aria-valuemin="0" aria-valuemax="100"></div>
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
                <li v-for="exercise in recommendedExercises" :key="exercise.id" class="list-group-item">
                  <strong>{{ exercise.name }}</strong> –
                  {{ exercise.description }}
                </li>
              </ul>
              <p v-else class="text-muted">Keine Empfehlungen vorhanden.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bearbeitungsformular (im Modal oder inline) -->
    <!-- Modal -->
    <div class="modal fade" tabindex="-1" role="dialog" :class="{ show: editMode }" style="display: block"
      v-if="editMode">
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
                <input id="fullName" type="text" class="form-control" v-model="editProfileData.full_name" />
              </div>

              <!-- avatar_url -->
              <div class="mb-3">
                <label for="avatarUrl" class="form-label">Avatar URL</label>
                <input id="avatarUrl" type="url" class="form-control" v-model="editProfileData.avatar_url" />
                <small class="text-muted">Direkter Link zu einem Bild, z.B. https://...</small>
              </div>

              <!-- Beispiel: color_contrast -->
              <div class="mb-3">
                <label for="colorContrast" class="form-label">Farbschema</label>
                <select id="colorContrast" class="form-select" v-model="editProfileData.color_contrast">
                  <option value="normal">Normal</option>
                  <option value="high-contrast">Hoher Kontrast</option>
                  <option value="dark">Dunkles Design</option>
                </select>
              </div>

              <!-- Beispiel: font_size -->
              <div class="mb-3">
                <label for="fontSize" class="form-label">Schriftgröße</label>
                <select id="fontSize" class="form-select" v-model="editProfileData.font_size">
                  <option value="normal">Normal</option>
                  <option value="large">Groß</option>
                  <option value="x-large">Extra Groß</option>
                </select>
              </div>

              <!-- screenreader (boolean) -->
              <div class="mb-3 form-check">
                <input id="screenreader" type="checkbox" class="form-check-input"
                  v-model="editProfileData.screenreader" />
                <label for="screenreader" class="form-check-label">
                  Screenreader-Modus aktivieren
                </label>
              </div>

              <!-- Körperliche Einschränkungen -->
              <div class="mb-3">
                <label class="form-label fw-bold">Körperliche Einschränkungen / besondere Bedürfnisse</label>
                <div class="form-check" v-for="option in limitationOptions" :key="option.value">
                  <input class="form-check-input" type="checkbox" :id="option.value" :value="option.value"
                    v-model="physicalLimitations" />
                  <label class="form-check-label" :for="option.value">
                    {{ option.label }}
                  </label>
                </div>
              </div>

              <!-- Abschicken -->
              <button type="submit" class="btn btn-success w-100">
                Speichern
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    <!-- Hintergrundebene -->
    <div class="modal-backdrop fade" :class="{ show: editMode }" v-if="editMode" @click.self="cancelEdit"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../supabase";

const physicalLimitations = ref([]);
const userEmail = ref("");
const profile = ref(null);
const defaultAvatar = "/assets/default-avatar.png";

const nextWorkout = ref(null);
const monthlyStats = ref({
  completedWorkouts: 0,
  remainingWorkouts: 0,
});
const recommendedExercises = ref([]);

const limitationOptions = [
  { value: "rollstuhl", label: "Rollstuhl erforderlich" },
  { value: "sehbehinderung", label: "Sehbehinderung" },
  { value: "hörbehinderung", label: "Hörbehinderung" },
  { value: "prothese", label: "Prothese / Amputation" },
  { value: "chronische_schmerzen", label: "Chronische Schmerzen" },
];

const router = useRouter();
const editMode = ref(false);
const editProfileData = ref({
  full_name: "",
  avatar_url: "",
  color_contrast: "normal",
  font_size: "normal",
  screenreader: false,
  physicalLimitations: [],
});

onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    return router.push("/auth");
  }
  userEmail.value = authData.user.email;

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

    physicalLimitations.value = userSettingsData.physical_limitations || [];

    editProfileData.value = {
      full_name: profile.value.full_name,
      avatar_url: profile.value.avatar_url,
      color_contrast: userSettingsData.color_contrast,
    };

    document.body.className = `theme-${editProfileData.value.color_contrast}`;
  } catch (err) {
    console.error(err);
  }
});

watch(
  () => editProfileData.value.color_contrast,
  (newContrast) => {
    document.body.className = `theme-${newContrast}`;
    console.log(`Theme geändert zu: theme-${newContrast}`);
  }
);

async function saveProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (!authData?.user) {
    console.error("Benutzer nicht authentifiziert.");
    return router.push("/auth");
  }

  try {
    const profileUpdates = {
      full_name: editProfileData.value.full_name || null,
      avatar_url: editProfileData.value.avatar_url || null,
    };

    const { error: profileError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Fehler beim Speichern in profiles:", profileError.message);
      return;
    }

    const userSettingsUpdates = {
      color_contrast: editProfileData.value.color_contrast,
      font_size: editProfileData.value.font_size,
      screenreader: editProfileData.value.screenreader,
      physical_limitations: physicalLimitations.value,
    };

    const { error: userSettingsError } = await supabase
      .from("user_settings")
      .update(userSettingsUpdates)
      .eq("user_id", authData.user.id);

    if (userSettingsError) {
      console.error("Fehler beim Speichern in user_settings:", userSettingsError.message);
      return;
    }

    document.body.className = `theme-${editProfileData.value.color_contrast}`;
    console.log("Profil erfolgreich gespeichert!");

    editMode.value = false;
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }
}
</script>
