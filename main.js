







// ─────────────────────────────────────────────
//  IDentix — Multi-step form handler
//  Custom JS validation with inline error display
//  Data saved in localStorage across steps
//  Redirects to success.html or error.html on submit
// ─────────────────────────────────────────────

const STORAGE_KEY = "identix_form_data";

// ── Storage helpers ────────────────────────────

function getSavedData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveData(newFields) {
  const existing = getSavedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...newFields }));
}

function prefillForm(fieldIds) {
  const saved = getSavedData();
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && saved[id] !== undefined) el.value = saved[id];
  });
}

// ── Validation UI helpers ──────────────────────

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.style.border       = "2px solid red";
  field.style.borderRadius = "6px";
  field.style.outline      = "none";

  const existing = document.getElementById("err-" + fieldId);
  if (existing) existing.remove();

  const msg = document.createElement("p");
  msg.id = "err-" + fieldId;
  msg.textContent = "⚠ " + message;
  msg.style.cssText = "color:red;font-size:13px;margin:5px 0 0 2px;font-weight:500;";
  field.insertAdjacentElement("afterend", msg);
}

function clearError(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) { field.style.border = ""; field.style.outline = ""; }
  const msg = document.getElementById("err-" + fieldId);
  if (msg) msg.remove();
}

function addLiveValidation(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.addEventListener("input",  () => clearError(fieldId));
  field.addEventListener("change", () => clearError(fieldId));
}

function countDigits(value) {
  return value.replace(/\D/g, "").length;
}

// ── Per-step validators ────────────────────────

function validateStep1() {
  ["firstname","secondname","email","contact","date","place","gender"].forEach(clearError);
  let valid = true;

  const firstname = document.getElementById("firstname").value.trim();
  if (!firstname)         { showError("firstname","First name is required."); valid = false; }
  else if (firstname.length < 2) { showError("firstname","First name must be at least 2 characters."); valid = false; }

  const secondname = document.getElementById("secondname").value.trim();
  if (!secondname)          { showError("secondname","Second name is required."); valid = false; }
  else if (secondname.length < 2) { showError("secondname","Second name must be at least 2 characters."); valid = false; }

  const email = document.getElementById("email").value.trim();
  if (!email)                              { showError("email","Email address is required."); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("email","Enter a valid email address (e.g. johndoe@gmail.com)."); valid = false; }

  const contact = document.getElementById("contact").value.trim();
  if (!contact)                      { showError("contact","Phone number is required."); valid = false; }
  else if (countDigits(contact) !== 9) { showError("contact","Phone number must be exactly 9 digits (e.g. 677123456)."); valid = false; }

  const date = document.getElementById("date").value;
  if (!date)                         { showError("date","Date of birth is required."); valid = false; }
  else if (new Date(date) >= new Date()) { showError("date","Date of birth must be in the past."); valid = false; }

  if (!document.getElementById("place").value.trim()) { showError("place","Place of birth is required."); valid = false; }
  if (!document.getElementById("gender").value)       { showError("gender","Please select your gender."); valid = false; }

  return valid;
}

function validateStep2() {
  ["school","Department","campus","specialty","level"].forEach(clearError);
  let valid = true;

  if (!document.getElementById("school").value.trim())     { showError("school","Institution name is required."); valid = false; }
  if (!document.getElementById("Department").value.trim()) { showError("Department","Department is required."); valid = false; }
  if (!document.getElementById("campus").value)            { showError("campus","Please select a campus."); valid = false; }
  if (!document.getElementById("specialty").value.trim())  { showError("specialty","Specialty is required."); valid = false; }
  if (!document.getElementById("level").value.trim())      { showError("level","Level is required (e.g. HND1)."); valid = false; }

  return valid;
}

function validateStep3() {
  ["address","nationality","city"].forEach(clearError);
  let valid = true;

  if (!document.getElementById("address").value.trim())     { showError("address","Address is required."); valid = false; }
  if (!document.getElementById("nationality").value.trim()) { showError("nationality","Nationality is required."); valid = false; }
  if (!document.getElementById("city").value.trim())        { showError("city","City is required."); valid = false; }

  return valid;
}

function validateStep4() {
  ["emergencyName","emergencyPhone","img"].forEach(clearError);
  let valid = true;

  const eName = document.getElementById("emergencyName").value.trim();
  if (!eName) { showError("emergencyName","Emergency contact name is required."); valid = false; }

  const ePhone = document.getElementById("emergencyPhone").value.trim();
  if (!ePhone)                         { showError("emergencyPhone","Emergency contact phone is required."); valid = false; }
  else if (countDigits(ePhone) !== 9)  { showError("emergencyPhone","Phone number must be exactly 9 digits (e.g. 677123456)."); valid = false; }

  const checkbox = document.getElementById("agreeCheckbox");
  const existingCheckErr = document.getElementById("err-agreeCheckbox");
  if (!checkbox.checked) {
    if (!existingCheckErr) {
      const msg = document.createElement("p");
      msg.id = "err-agreeCheckbox";
      msg.textContent = "⚠ You must agree to the Terms & Conditions to continue.";
      msg.style.cssText = "color:red;font-size:13px;margin:5px 0 0 2px;font-weight:500;";
      checkbox.parentElement.insertAdjacentElement("afterend", msg);
    }
    valid = false;
  } else {
    if (existingCheckErr) existingCheckErr.remove();
  }

  const img = document.getElementById("img");
  if (img && img.files.length === 0) { showError("img","Please upload a photo for your ID card."); valid = false; }

  return valid;
}

// ── Submit button state helpers ────────────────

function setSubmitting(btn) {
  btn.disabled = true;
  btn.dataset.original = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> &nbsp;Submitting…';
}

function resetSubmit(btn) {
  btn.disabled = false;
  btn.innerHTML = btn.dataset.original;
}

// ── Step 1 ─────────────────────────────────────

const step1Form = document.getElementById("step1Form");
if (step1Form) {
  prefillForm(["firstname","secondname","email","contact","date","place","gender"]);
  ["firstname","secondname","email","contact","date","place","gender"].forEach(addLiveValidation);

  step1Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep1()) return;
    saveData({
      firstname:  document.getElementById("firstname").value.trim(),
      secondname: document.getElementById("secondname").value.trim(),
      email:      document.getElementById("email").value.trim(),
      contact:    document.getElementById("contact").value.trim(),
      date:       document.getElementById("date").value,
      place:      document.getElementById("place").value.trim(),
      gender:     document.getElementById("gender").value,
    });
    window.location.href = "register2.html";
  });
}

// ── Step 2 ─────────────────────────────────────

const step2Form = document.getElementById("step2Form");
if (step2Form) {
  prefillForm(["school","Department","campus","specialty","level"]);
  ["school","Department","campus","specialty","level"].forEach(addLiveValidation);

  step2Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep2()) return;
    saveData({
      school:     document.getElementById("school").value.trim(),
      Department: document.getElementById("Department").value.trim(),
      campus:     document.getElementById("campus").value,
      specialty:  document.getElementById("specialty").value.trim(),
      level:      document.getElementById("level").value.trim(),
    });
    window.location.href = "register3.html";
  });
}

// ── Step 3 ─────────────────────────────────────

const step3Form = document.getElementById("step3Form");
if (step3Form) {
  prefillForm(["address","nationality","city"]);
  ["address","nationality","city"].forEach(addLiveValidation);

  step3Form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validateStep3()) return;
    saveData({
      address:     document.getElementById("address").value.trim(),
      nationality: document.getElementById("nationality").value.trim(),
      city:        document.getElementById("city").value.trim(),
    });
    window.location.href = "register4.html";
  });
}

// ── Step 4 — Final submit ──────────────────────

const step4Form = document.getElementById("step4Form");
if (step4Form) {
  prefillForm(["emergencyName","emergencyPhone"]);
  ["emergencyName","emergencyPhone"].forEach(addLiveValidation);

  const agreeBox = document.getElementById("agreeCheckbox");
  if (agreeBox) {
    agreeBox.addEventListener("change", () => {
      const err = document.getElementById("err-agreeCheckbox");
      if (err) err.remove();
    });
  }

  const imgInput = document.getElementById("img");
  if (imgInput) imgInput.addEventListener("change", () => clearError("img"));

  step4Form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!validateStep4()) return;

    const allData = {
      ...getSavedData(),
      emergencyName:  document.getElementById("emergencyName").value.trim(),
      emergencyPhone: document.getElementById("emergencyPhone").value.trim(),
    };

    const imgFile  = document.getElementById("img").files[0];
    const formData = new FormData();
    Object.entries(allData).forEach(([key, val]) => formData.append(key, val));
    if (imgFile) formData.append("img", imgFile);

    const submitBtn = step4Form.querySelector("button[type='submit']");
    setSubmitting(submitBtn);

    try {
      const response = await fetch("http://127.0.0.1:8000/students", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Pass the HTTP status code to the error page
        throw new Error(response.status + "|" + response.statusText);
      }

      const result = await response.json();

      // Save key info for the success page summary display,
      // then clear the full multi-step form data
      const saved = getSavedData();
      localStorage.setItem("identix_form_data", JSON.stringify({
        firstname:  saved.firstname  || "",
        secondname: saved.secondname || "",
        email:      saved.email      || "",
        school:     saved.school     || "",
        ref:        result.ref_number || "",
      }));

      // ✅ Redirect to success page (no alert)
      window.location.href = "success.html";

    } catch (error) {
      resetSubmit(submitBtn);

      // Separate HTTP errors (status|text) from network/fetch errors
      const raw   = error.message || "Unknown error";
      const parts = raw.split("|");

      let code = "";
      let msg  = raw;

      if (parts.length === 2 && !isNaN(parts[0])) {
        // HTTP error thrown above, e.g. "500|Internal Server Error"
        code = parts[0];
        msg  = parts[1] || "Server error";
      } else if (raw.toLowerCase().includes("failed to fetch")) {
        // Backend is not running or unreachable
        msg = "Could not connect to the server. Make sure the backend is running on port 8000 and try again.";
      } else if (raw.toLowerCase().includes("networkerror")) {
        msg = "A network error occurred. Please check your internet connection.";
      }

      // Redirect to error.html — URLSearchParams encodes values automatically.
      // Do NOT use encodeURIComponent here — it would cause double-encoding.
      const params = new URLSearchParams();
      if (code) params.set("code", code);
      params.set("msg", msg);
      window.location.href = "error.html?" + params.toString();
    }
  });
}