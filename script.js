// ── CURSOR BLUR ──
var blur = document.querySelector("#cursor-blur");
if (blur) {
  document.addEventListener("mousemove", function (move) {
    blur.style.left = move.clientX - 50 + "px";
    blur.style.top  = move.clientY - 50 + "px";
  });
}

// ── NAV SCROLL ──
window.addEventListener("scroll", function () {
  var nav = document.getElementById("nav");
  if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
});

// ── GSAP ANIMATIONS (only if gsap loaded) ──
if (typeof gsap !== "undefined") {
  gsap.from("#cards-container", {
    y: 50, opacity: 0, duration: 0.5, stagger: 0.4,
    scrollTrigger: { trigger: "#cards-container", scroller: "body", start: "top 60%", end: "top 55%", scrub: 2 }
  });
}

// ── AUTH ──
function getUsers()      { return JSON.parse(localStorage.getItem("ftd_users") || "[]"); }
function saveUsers(u)    { localStorage.setItem("ftd_users", JSON.stringify(u)); }
function getCurrentUser(){ return localStorage.getItem("ftd_current_user"); }
function setCurrentUser(n){ localStorage.setItem("ftd_current_user", n); }

function doRegister() {
  var name  = document.getElementById("regName").value.trim();
  var email = document.getElementById("regEmail").value.trim();
  var pass  = document.getElementById("regPass").value;
  var pass2 = document.getElementById("regPass2").value;
  var msg   = document.getElementById("reg-msg");
  if (!name || !email || !pass) { showMsg(msg, "Please fill all required fields.", "error"); return; }
  if (pass !== pass2)           { showMsg(msg, "Passwords do not match.", "error"); return; }
  var users = getUsers();
  if (users.find(function(u){ return u.email === email; })) { showMsg(msg, "Email already registered. Please login.", "error"); return; }
  users.push({ name: name, email: email, pass: pass });
  saveUsers(users);
  showMsg(msg, "Registration successful! You can now login.", "ok");
}

function doLogin() {
  var email = document.getElementById("loginEmail").value.trim();
  var pass  = document.getElementById("loginPass").value;
  var msg   = document.getElementById("login-msg");
  var users = getUsers();
  var user  = users.find(function(u){ return u.email === email && u.pass === pass; });
  if (!user) { showMsg(msg, "Invalid email or password.", "error"); return; }
  setCurrentUser(user.name);
  showMsg(msg, "Login successful! Welcome, " + user.name, "ok");
  setTimeout(function() {
    var modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
    if (modal) modal.hide();
    updateNavAuth();
  }, 800);
}

function logout() {
  localStorage.removeItem("ftd_current_user");
  updateNavAuth();
}

function updateNavAuth() {
  var user = getCurrentUser();
  var pill = document.getElementById("userPill");
  if (!pill) return;
  if (user) {
    pill.style.display = "flex";
    document.getElementById("userNameDisplay").textContent = user;
  } else {
    pill.style.display = "none";
  }
}

function requireLogin(feature) {
  if (!getCurrentUser()) {
    alert("Please login to access " + feature + ".");
    var modal = new bootstrap.Modal(document.getElementById("authModal"));
    modal.show();
  } else {
    alert("Welcome! " + feature + " feature coming soon.");
  }
  return false;
}

function showMsg(el, text, type) {
  if (!el) return;
  el.style.color = (type === "ok") ? "#22cac7" : "#f66";
  el.textContent = text;
}

// ── SEARCH ──
function doSearch() {
  var q = document.getElementById("siteSearch").value.trim().toLowerCase();
  if (!q) return;
  var cards = document.querySelectorAll(".cards");
  var found = null;
  cards.forEach(function(c) {
    c.style.outline = "";
    var name = (c.dataset.name || "").toLowerCase();
    if (name.includes(q)) {
      c.style.outline = "3px solid #22cac7";
      c.style.outlineOffset = "4px";
      if (!found) found = c;
    }
  });
  if (found) {
    found.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    alert('No specialty found for "' + q + '". Try: Dentist, Cardiologist, MRI, Ophthalmologist…');
  }
}

// ── MAP ──
var map, userMarker, radiusCircle;
var markers = [];

function initMap(lat, lng) {
  if (map) { map.remove(); map = null; }
  map = L.map("leaflet-map").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors", maxZoom: 19
  }).addTo(map);
  userMarker = L.marker([lat, lng], {
    icon: L.divIcon({
      className: "",
      html: '<div style="width:16px;height:16px;background:#22cac7;border:3px solid #fff;border-radius:50%;box-shadow:0 0 10px rgba(34,202,199,0.8)"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8]
    })
  }).addTo(map).bindPopup("<b>Your Location</b>").openPopup();
}

function fetchNearby(lat, lng) {
  var radiusKm  = parseFloat(document.getElementById("radius-input").value) || 5;
  var radiusM   = radiusKm * 1000;
  var specialty = document.getElementById("specialty-filter").value || "hospital";
  var status    = document.getElementById("map-status");

  markers.forEach(function(m){ m.remove(); });
  markers = [];
  if (radiusCircle) radiusCircle.remove();

  radiusCircle = L.circle([lat, lng], {
    radius: radiusM, color: "rgba(34,202,199,0.5)",
    fillColor: "rgba(34,202,199,0.05)", fillOpacity: 0.3
  }).addTo(map);

  status.textContent = "🔍 Searching for " + specialty + "s nearby…";

  var url = "https://overpass-api.de/api/interpreter?data=[out:json];(node[\"amenity\"=\"" + specialty + "\"](around:" + radiusM + "," + lat + "," + lng + ");way[\"amenity\"=\"" + specialty + "\"](around:" + radiusM + "," + lat + "," + lng + "););out center;";

  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (!data.elements.length) {
        status.textContent = "No results found. Try a larger radius or different specialty.";
        return;
      }
      data.elements.forEach(function(el){
        var elLat = el.lat || (el.center && el.center.lat);
        var elLng = el.lon || (el.center && el.center.lon);
        if (!elLat || !elLng) return;
        var name  = (el.tags && el.tags.name) || ("Unnamed " + specialty);
        var addr  = (el.tags && el.tags["addr:street"]) ? el.tags["addr:street"] + ", " + (el.tags["addr:city"] || "") : (el.tags && el.tags["addr:city"] || "");
        var phone = (el.tags && (el.tags.phone || el.tags["contact:phone"])) || "";
        var m = L.marker([elLat, elLng]).addTo(map);
        m.bindPopup(
          "<div style='min-width:160px'><b style='color:#22cac7'>" + name + "</b><br>" +
          (addr  ? "📍 " + addr + "<br>" : "") +
          (phone ? "📞 " + phone + "<br>" : "") +
          "<a href='https://www.google.com/maps/dir/?api=1&destination=" + elLat + "," + elLng + "' target='_blank' style='color:#22cac7'>Get Directions ↗</a></div>"
        );
        markers.push(m);
      });
      status.textContent = "✅ Found " + markers.length + " result(s) within " + radiusKm + " km";
    })
    .catch(function(){
      status.textContent = "⚠️ Could not load map data. Check your internet connection.";
    });
}

function locateMe() {
  var status = document.getElementById("map-status");
  if (!navigator.geolocation) { status.textContent = "Geolocation not supported by your browser."; return; }
  status.textContent = "📡 Getting your location…";
  navigator.geolocation.getCurrentPosition(
    function(pos){
      initMap(pos.coords.latitude, pos.coords.longitude);
      fetchNearby(pos.coords.latitude, pos.coords.longitude);
    },
    function(){
      status.textContent = "⚠️ Location access denied — showing default location. Grant permission for accurate results.";
      initMap(30.7333, 76.7794);
      fetchNearby(30.7333, 76.7794);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function refetchIfReady() {
  if (map && userMarker) {
    var ll = userMarker.getLatLng();
    fetchNearby(ll.lat, ll.lng);
  }
}

// ── INIT ──
document.addEventListener("DOMContentLoaded", function(){
  updateNavAuth();
  // Init map with default coords so it's not blank
  initMap(30.7333, 76.7794);

  var sf = document.getElementById("specialty-filter");
  var ri = document.getElementById("radius-input");
  if (sf) sf.addEventListener("change", refetchIfReady);
  if (ri) ri.addEventListener("change", refetchIfReady);

  var searchInput = document.getElementById("siteSearch");
  if (searchInput) searchInput.addEventListener("keydown", function(e){ if (e.key === "Enter") doSearch(); });
});
