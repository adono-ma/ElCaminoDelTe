// script.js


document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;
  const toggleThemeBtn = document.getElementById("toggleThemeBtn");
  const form = document.getElementById("suscripcionForm");
  const clearFormBtn = document.getElementById("clearFormBtn");

  // Toast Bootstrap reutilizable
  const toastElement = document.getElementById("formToast");
  const toastBody = document.getElementById("formToastBody");
  let toast;


  if (toastElement) {
    toast = new bootstrap.Toast(toastElement, {
      delay: 4000 // 4 segundos
    });
  }

  //con window lo podemos usar en más sitios
  window.showToast = function (message, variant = "dark") {
    if (!toastElement || !toastBody) return;
    toastBody.textContent = message;
    toastElement.className = `toast align-items-center text-bg-${variant} border-0`;
    toast.show();
  };


  // ---------- MODO OSCURO con localStorage ----------
  const THEME_KEY = "tea_theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-mode");

      if (toggleThemeBtn) {
        toggleThemeBtn.classList.remove("btn-outline-light");
        toggleThemeBtn.classList.add("btn-outline-warning");
        toggleThemeBtn.innerHTML =
          '<i class="bi bi-sun-fill" aria-hidden="true"></i>' +
          '<span class="visually-hidden" id="themeText">Tema claro</span>';
      }
    } else {
      body.classList.remove("dark-mode");

      if (toggleThemeBtn) {
        toggleThemeBtn.classList.remove("btn-outline-warning");
        toggleThemeBtn.classList.add("btn-outline-light");
        toggleThemeBtn.innerHTML =
          '<i class="bi bi-moon-fill" aria-hidden="true"></i>' +
          '<span class="visually-hidden" id="themeText">Tema oscuro</span>';
      }
    }
  }

  // Leer preferencia guardada
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener("click", function () {
      const newTheme = body.classList.contains("dark-mode") ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }


  // ---------- VALIDACIONES PERSONALIZADAS ----------


  function setError(elementId, message) {
    const small = document.getElementById(elementId);
    if (!small) return;
    small.textContent = message || "";
    small.classList.toggle("d-none", !message);
  }

  function clearAllCustomErrors() {
    setError("nombreError", "");
    setError("teTipoError", "");
  }


  // 1: Validar que nombre no tenga números ni caracteres especiales
  function validateNombre() {
    const input = document.getElementById("nombre");
    if (!input) return true;

    const value = input.value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (value === "") {
      setError("nombreError", "El nombre no puede estar vacío.");
      return false;
    }

    if (!regex.test(value)) {
      setError("nombreError", "El nombre solo puede contener letras y espacios.");
      return false;
    }

    setError("nombreError", "");
    return true;
  }

  // 2: Verificar que al menos un checkbox/radio de cafeína esté seleccionado
  function validateTeTipos() {
    const group = document.getElementById("teCheckboxGroup");
    if (!group) return true;

    const inputs = group.querySelectorAll("input[type='checkbox'], input[type='radio']");
    const checked = Array.from(inputs).some(ch => ch.checked);

    if (!checked) {
      setError("teTipoError", "Selecciona al menos un nivel de cafeína.");
      return false;
    }

    setError("teTipoError", "");
    return true;
  }

  // 3: Validar que el tipo de té (select) no esté vacío
  function validateSelectTipo() {
    const select = document.getElementById("tipo");
    if (!select) return true;

    if (select.value === "") {
      showToast("Elija un tipo de té favorito.", "danger");
      return false;
    }
    return true;
  }

  window.validateFormCustom = function () {
    return validateNombre() && validateTeTipos() && validateSelectTipo();
  };

  // Validación en tiempo real
  const nombreInput = document.getElementById("nombre");
  if (nombreInput) {
    nombreInput.addEventListener("input", validateNombre);
  }


  const teGroup = document.getElementById("teCheckboxGroup");
  if (teGroup) {
    teGroup.addEventListener("change", validateTeTipos);
  }


  // ---------- BOTÓN LIMPIAR ----------

  if (clearFormBtn && form) {
    clearFormBtn.addEventListener("click", function () {
      // El reset limpia campos, nosotros limpiamos errores y mostramos toast
      setTimeout(() => {
        clearAllCustomErrors();
        window.showToast("Los campos del formulario se han borrado.", "secondary");
      }, 0);
    });
  }

/*

Se quita para dejarlo solo en mejoras.js

  // ---------- ENVÍO DE FORMULARIO + TOAST ----------


  if (form) {
    form.addEventListener("submit", function (e) {
      console.log('Submit iniciado');  //para debug
      if (!validateFormCustom()) {
        console.log('Validation error');
        e.preventDefault();
        return;
      }
      console.log('Validación OK, mostrar toast');
      showToast("Formulario enviado correctamente.", "success");
      e.preventDefault();  //evitar que refresque
      // Opcional: reset form tras delay
      setTimeout(() => form.reset(), 2000);
    });
  }
    */
});