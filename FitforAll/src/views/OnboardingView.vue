<template>
  <div class="container py-5">
    <h2 class="text-center mb-4">Wähle die betroffenen Körperbereiche aus</h2>
    <p class="text-center text-muted">Klicke auf die Körperbereiche, die Schmerzen oder Probleme bereiten:</p>

    <div class="row">
      <!-- Linke Spalte: Menschendarstellung -->
      <div class="col-md-6">
        <div class="body-container">
          <!-- Körperbereiche (wie oben) -->
          <div class="body-part head" @click="toggleBodyPart('kopf')"
            :class="{ active: selectedParts.includes('kopf') }">
            Kopf
          </div>
          <div class="body-part neck" @click="toggleBodyPart('hals')"
            :class="{ active: selectedParts.includes('hals') }">
            Hals
          </div>
          <div class="body-part torso" @click="toggleBodyPart('oberkoerper')"
            :class="{ active: selectedParts.includes('oberkoerper') }">
            Oberkörper
          </div>
          <div class="body-part left-upper-arm" @click="toggleBodyPart('linker_oberarm')"
            :class="{ active: selectedParts.includes('linker_oberarm') }">
            Oberarm
          </div>
          <div class="body-part right-upper-arm" @click="toggleBodyPart('rechter_oberarm')"
            :class="{ active: selectedParts.includes('rechter_oberarm') }">
            Oberarm
          </div>
          <div class="body-part left-lower-arm" @click="toggleBodyPart('linker_unterarm')"
            :class="{ active: selectedParts.includes('linker_unterarm') }">
            Unterarm
          </div>
          <div class="body-part right-lower-arm" @click="toggleBodyPart('rechter_unterarm')"
            :class="{ active: selectedParts.includes('rechter_unterarm') }">
            Unterarm
          </div>
          <div class="body-part left-hand" @click="toggleBodyPart('linke_hand')"
            :class="{ active: selectedParts.includes('linke_hand') }">
            Hand
          </div>
          <div class="body-part right-hand" @click="toggleBodyPart('rechte_hand')"
            :class="{ active: selectedParts.includes('rechte_hand') }">
            Hand
          </div>
          <div class="body-part left-thigh" @click="toggleBodyPart('linker_oberschenkel')"
            :class="{ active: selectedParts.includes('linker_oberschenkel') }">
            Oberschenkel
          </div>
          <div class="body-part right-thigh" @click="toggleBodyPart('rechter_oberschenkel')"
            :class="{ active: selectedParts.includes('rechter_oberschenkel') }">
            Oberschenkel
          </div>
          <div class="body-part left-calf" @click="toggleBodyPart('linke_wade')"
            :class="{ active: selectedParts.includes('linke_wade') }">
            Wade
          </div>
          <div class="body-part right-calf" @click="toggleBodyPart('rechte_wade')"
            :class="{ active: selectedParts.includes('rechte_wade') }">
            Wade
          </div>
          <div class="body-part left-foot" @click="toggleBodyPart('linker_fuss')"
            :class="{ active: selectedParts.includes('linker_fuss') }">
            Fuß
          </div>
          <div class="body-part right-foot" @click="toggleBodyPart('rechter_fuss')"
            :class="{ active: selectedParts.includes('rechter_fuss') }">
            Fuß
          </div>
        </div>
      </div>

      <!-- Rechte Spalte: Zusätzliche Fragen -->
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h5>Zusätzliche Einstellungen</h5>
          </div>
          <div class="card-body">
            <!-- Farbschema -->
            <div class="mb-3">
              <label for="colorContrast" class="form-label">Farbschema</label>
              <select id="colorContrast" class="form-select" v-model="colorContrast">
                <option value="normal">Normal</option>
                <option value="high-contrast">Hoher Kontrast</option>
                <option value="dark">Dunkles Design</option>
              </select>
            </div>

            <!-- Schriftgröße -->
            <div class="mb-3">
              <label for="fontSize" class="form-label">Schriftgröße</label>
              <select id="fontSize" class="form-select" v-model="fontSize">
                <option value="normal">Normal</option>
                <option value="large">Groß</option>
                <option value="x-large">Extra Groß</option>
              </select>
            </div>

            <!-- Screenreader -->
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="screenreader" v-model="screenreader" />
              <label for="screenreader" class="form-check-label">
                Screenreader-Modus aktivieren
              </label>
            </div>
            <!-- Zusätzliche Fragen unterhalb der bisherigen Eingabefelder -->
            <div class="mb-3">
              <label for="fullName" class="form-label">Voller Name</label>
              <input id="fullName" type="text" class="form-control" v-model="fullName" />
            </div>

            <div class="mb-3">
              <label for="username" class="form-label">Benutzername</label>
              <input id="username" type="text" class="form-control" v-model="username" />
            </div>

            <div class="mb-3">
              <label for="age" class="form-label">Alter</label>
              <input id="age" type="number" class="form-control" v-model.number="age" min="0" step="1"
                @input="validateAge" />
            </div>

            <div class="mb-3">
              <label for="weight" class="form-label">Gewicht (kg)</label>
              <input id="weight" type="number" class="form-control" v-model.number="weight" min="0" step="0.1"
                @input="validateWeight" />
            </div>


          </div>
        </div>
      </div>
    </div>

    <!-- Speichern -->
    <div class="text-center mt-4">
      <button class="btn btn-primary" @click="savePreferences">
        Speichern
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../supabase";

// Reaktive Daten
const selectedParts = ref([]);
const colorContrast = ref("normal");
const fontSize = ref("normal");
const screenreader = ref(false);

// Körperbereiche-Labels
const bodyPartLabels = {
  kopf: "Kopf",
  hals: "Hals",
  oberkoerper: "Oberkörper",
  linker_oberarm: "Linker Oberarm",
  rechter_oberarm: "Rechter Oberarm",
  linker_unterarm: "Linker Unterarm",
  rechter_unterarm: "Rechter Unterarm",
  linke_hand: "Linke Hand",
  rechte_hand: "Rechte Hand",
  linker_oberschenkel: "Linker Oberschenkel",
  rechter_oberschenkel: "Rechter Oberschenkel",
  linke_wade: "Linke Wade",
  rechte_wade: "Rechte Wade",
  linker_fuss: "Linker Fuß",
  rechter_fuss: "Rechter Fuß",
};

// Körperteil hinzufügen/entfernen
function toggleBodyPart(part) {
  if (selectedParts.value.includes(part)) {
    selectedParts.value = selectedParts.value.filter((p) => p !== part);
  } else {
    selectedParts.value.push(part);
  }
}

// Körperbereiche und zusätzliche Einstellungen speichern
async function savePreferences() {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    console.error("Benutzer nicht eingeloggt");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("has_finished_onboarding")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden der Einstellungen:", error.message);
      return;
    }

    // Überprüfen, ob das Onboarding abgeschlossen ist
    if (data.has_finished_onboarding) {
      window.location.href = "/";
      return;
    }
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    const { error } = await supabase
      .from("user_settings")
      .update({
        problem_muscle_groups: selectedParts.value,
        color_contrast: colorContrast.value,
        font_size: fontSize.value,
        screenreader: screenreader.value,
      })
      .eq("user_id", authData.user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
    } else {
      console.log("Daten erfolgreich gespeichert!");
    }
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }



  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.value,
        username: username.value,
        age: age.value,
        weight: weight.value,
      })
      .eq("id", authData.user.id);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
    } else {
      console.log("Daten erfolgreich gespeichert!");
    }
  } catch (err) {
    console.error("Fehler beim Speichern:", err.message);
  }
}

// Zusätzliche Eingabefelder
const fullName = ref("");
const username = ref("");
const age = ref(null);
const weight = ref(null);

// Beim Laden des Profils: Daten aus der Datenbank laden
onMounted(async () => {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) {
    console.error("Benutzer nicht eingeloggt");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("user_settings")
      .select("has_finished_onboarding")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden der Einstellungen:", error.message);
      return;
    }

    // Überprüfen, ob das Onboarding abgeschlossen ist
    if (data.has_finished_onboarding) {
      window.location.href = "/";
      return;
    }
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    const { data: settinsData, error } = await supabase
      .from("user_settings")
      .select("problem_muscle_groups, color_contrast, font_size, screenreader")
      .eq("user_id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden der Einstellungen:", error.message);
      return;
    }

    selectedParts.value = settinsData.problem_muscle_groups || [];
    colorContrast.value = settinsData.color_contrast || "normal";
    fontSize.value = settinsData.font_size || "normal";
    screenreader.value = settinsData.screenreader || false;
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("full_name, username, age, weight")
      .eq("id", authData.user.id)
      .single();

    if (error) {
      console.error("Fehler beim Laden des Profils:", error.message);
      return;
    }

    // Initialisiere die Felder
    fullName.value = profileData.full_name || "";
    username.value = profileData.username || "";
    age.value = profileData.age || null;
    weight.value = profileData.weight || null;
  } catch (err) {
    console.error("Fehler beim Laden der Daten:", err.message);
  }

  try {
    // Updates für die Tabelle `profiles`
    console.log("Updating profiles with:", {
      full_name: fullName.value,
      username: username.value,
      age: age.value,
      weight: weight.value,
    });
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.value,
        username: username.value,
        age: age.value,
        weight: weight.value,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Fehler beim Aktualisieren des Profils:", profileError.message);
      throw profileError;
    }

    // Updates für die Tabelle `user_settings`
    console.log("Updating user_settings with:", {
      problem_muscle_groups: selectedParts.value,
      color_contrast: colorContrast.value,
      font_size: fontSize.value,
      screenreader: screenreader.value,
      has_finished_onboarding: false,
    });
    const { error: settingsError } = await supabase
      .from("user_settings")
      .update({
        problem_muscle_groups: selectedParts.value,
        color_contrast: colorContrast.value,
        font_size: fontSize.value,
        screenreader: screenreader.value,
        has_finished_onboarding: true,
      })
      .eq("user_id", authData.user.id);

    if (settingsError) {
      console.error("Fehler beim Aktualisieren der Einstellungen:", settingsError.message);
      throw settingsError;
    }

    console.log("Einstellungen erfolgreich gespeichert!");
  } catch (err) {
    console.error("Fehler beim Speichern der Daten:", err.message);
  }

});
</script>


<style scoped>
/* Style der Körperdarstellung */
.body-container {
  position: relative;
  width: 200px;
  height: 400px;
  margin: 0 auto;
  background: linear-gradient(to bottom, #f9f9f9, #eaeaea);
  border: 2px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.body-part {
  position: absolute;
  background-color: #cccccc;
  color: white;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 5px;
}

.body-part:hover {
  background-color: #007bff;
}

.body-part.active {
  background-color: #0056b3;
}

/* Kopf */
.head {
  top: 10px;
  left: 80px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Hals */
.neck {
  top: 60px;
  left: 90px;
  width: 20px;
  height: 20px;
}

/* Oberkörper */
.torso {
  top: 90px;
  left: 70px;
  width: 60px;
  height: 100px;
}

/* Arme */
.left-upper-arm {
  top: 90px;
  left: 20px;
  width: 20px;
  height: 60px;
}

.right-upper-arm {
  top: 90px;
  right: 20px;
  width: 20px;
  height: 60px;
}

.left-lower-arm {
  top: 150px;
  left: 10px;
  width: 20px;
  height: 50px;
}

.right-lower-arm {
  top: 150px;
  right: 10px;
  width: 20px;
  height: 50px;
}

.left-hand {
  top: 200px;
  left: 0px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.right-hand {
  top: 200px;
  right: 0px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

/* Beine */
.left-thigh {
  top: 200px;
  left: 60px;
  width: 30px;
  height: 80px;
}

.right-thigh {
  top: 200px;
  right: 60px;
  width: 30px;
  height: 80px;
}

.left-calf {
  top: 280px;
  left: 65px;
  width: 20px;
  height: 60px;
}

.right-calf {
  top: 280px;
  right: 65px;
  width: 20px;
  height: 60px;
}

.left-foot {
  top: 340px;
  left: 55px;
  width: 40px;
  height: 20px;
  border-radius: 5px;
}

.right-foot {
  top: 340px;
  right: 55px;
  width: 40px;
  height: 20px;
  border-radius: 5px;
}
</style>