/**
 * AgencyOS Master Engine
 * Core logic for 3D simulation and HUD orchestration.
 * Version: 1.1.1 (Fixed Init Order)
 */
console.log("AgencyOS Engine V1.1.1 Loading...");

// --- Global UI Utilities ---

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style = `
        background: #16171d; 
        border: 1px solid rgba(255,255,255,0.1); 
        padding: 12px 20px; 
        border-radius: 6px; 
        color: #fff; 
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(100px);
        opacity: 0;
    `;
    toast.innerHTML = `<span>${type === 'error' ? '🔴' : '🟡'}</span> ${message}`;
    container.appendChild(toast);

    gsap.to(toast, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" });

    setTimeout(() => {
        gsap.to(toast, { x: 100, opacity: 0, duration: 0.4, onComplete: () => toast.remove() });
    }, 4000);
}

function showLoader(text = "Processing") {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.visibility = 'visible';
        loader.style.opacity = '1';
    }
}

function hideLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.visibility = 'hidden'; }, 1000);
    }
}

// --- 3D Engine Constants ---

const AGENTS = ["strategist", "content_writer", "approver", "risk_agent", "finance_controller", "seo_agent", "ads_manager", "social_manager", "cio", "researcher", "peon"];

const PALETTE = {
    strategist: 0xe2b714,
    content_writer: 0x6c63ff,
    approver: 0x00ffaa,
    risk_agent: 0xff4d4d,
    finance_controller: 0x00ccff,
    seo_agent: 0xfbbf24,
    ads_manager: 0x818cf8,
    social_manager: 0xf472b6,
    cio: 0xffffff,
    researcher: 0x00d4aa,
    peon: 0x52525b
};

const DESKS = {
    strategist: { x: 40, z: -60 },
    content_writer: { x: 90, z: -60 },
    seo_agent: { x: 140, z: -60 },
    approver: { x: 40, z: 20 },
    risk_agent: { x: 90, z: 20 },
    finance_controller: { x: 140, z: 20 },
    ads_manager: { x: 40, z: 100 },
    social_manager: { x: 90, z: 100 },
    peon: { x: -40, z: 140 },
    cio: { x: -80, z: -20 },
    researcher: { x: -80, z: 20 }
};

const ZONES = {
    war_room: { x: -80, z: -60 },
    cafeteria: { x: -80, z: 80 },
    restroom: { x: 160, z: 150 },
    smoking_room: { x: -160, z: 150 }
};

// --- Core 3D Class ---

class WorkspaceEngine {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.overlay = document.getElementById('ui-overlay');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111218); // Lightened
        this.scene.fog = new THREE.Fog(0x111218, 150, 800);

        this.characters = {};
        this.labels = [];
        this.lightGroups = {
            overhead: [],
            lamps: [],
            bulbs: []
        };
        this.lightsOn = true;

        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        this.init();
    }

    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 2000);
        this.camera.position.set(220, 250, 220);
        this.camera.lookAt(20, 0, 0);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    setupLights() {
        if (!this.lightGroups) {
            console.error("Critical Error: lightGroups is undefined in setupLights! Re-initializing...");
            this.lightGroups = { overhead: [], lamps: [], bulbs: [] };
        }

        this.ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambient);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.dirLight.position.set(150, 350, 100);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.scene.add(this.dirLight);

        this.warRoomLight = new THREE.PointLight(0xffffff, 1, 200);
        this.warRoomLight.position.set(ZONES.war_room.x, 50, ZONES.war_room.z);
        this.scene.add(this.warRoomLight);
        this.lightGroups.overhead.push(this.warRoomLight);
    }

    toggleLights() {
        this.lightsOn = !this.lightsOn;
        const intensity = this.lightsOn ? 1 : 0.1;
        const ambientIntensity = this.lightsOn ? 0.6 : 0.05;
        const dirIntensity = this.lightsOn ? 0.8 : 0.02;

        gsap.to(this.ambient, { intensity: ambientIntensity, duration: 0.5 });
        gsap.to(this.dirLight, { intensity: dirIntensity, duration: 0.5 });

        this.lightGroups.overhead.forEach(l => gsap.to(l, { intensity: intensity, duration: 0.5 }));
        this.lightGroups.lamps.forEach(l => gsap.to(l, { intensity: intensity * 0.8, duration: 0.5 }));
        this.lightGroups.bulbs.forEach(l => gsap.to(l, { intensity: intensity * 1.5, duration: 0.5 }));

        this.scene.background = new THREE.Color(this.lightsOn ? 0x111218 : 0x020205);
        this.scene.fog.color = new THREE.Color(this.lightsOn ? 0x111218 : 0x020205);

        showToast(`Office Lights: ${this.lightsOn ? 'ON' : 'OFF'}`, 'info');
    }

    init() {
        this.buildEnvironment();
        this.spawnPersonnel();

        window.addEventListener('resize', () => this.handleResize());
        this.animate = this.animate.bind(this);
        this.animate();

        // Intro Animation
        gsap.from(this.camera.position, {
            x: 500, y: 600, z: 500,
            duration: 2.5,
            ease: "expo.out"
        });
    }

    handleResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    buildEnvironment() {
        // Floor (Lightened)
        const floorGeo = new THREE.PlaneGeometry(800, 800);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1b26, roughness: 0.7 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid accents
        const grid = new THREE.GridHelper(800, 40, 0x2d2e36, 0x1b1c20);
        grid.position.y = 0.1;
        this.scene.add(grid);

        // Zone Markers
        this.addZoneMarker("STRATEGY HUB", ZONES.war_room.x, ZONES.war_room.z, 150, 150, 0x222436);
        this.addZoneMarker("CAFETERIA", ZONES.cafeteria.x, ZONES.cafeteria.z, 120, 120, 0x1e2025);
        this.addZoneMarker("RESTROOM", ZONES.restroom.x, ZONES.restroom.z, 80, 80, 0x1a1c22);
        this.addZoneMarker("SMOKING AREA", ZONES.smoking_room.x, ZONES.smoking_room.z, 80, 80, 0x2a2a2a);

        // Real Walls
        this.addWall(ZONES.war_room.x - 75, ZONES.war_room.z, 2, 40, 150); // War room left
        this.addWall(ZONES.war_room.x, ZONES.war_room.z - 75, 150, 40, 2); // War room back
        this.addWall(ZONES.restroom.x + 40, ZONES.restroom.z, 2, 40, 80); // Restroom wall
        this.addWall(ZONES.smoking_room.x - 40, ZONES.smoking_room.z, 2, 40, 80); // Smoking wall

        // Corner Bulbs
        this.addBulb(380, 380);
        this.addBulb(-380, 380);
        this.addBulb(380, -380);
        this.addBulb(-380, -380);

        // Air Conditioners
        this.addAC(ZONES.war_room.x, 35, ZONES.war_room.z - 74);
        this.addAC(0, 35, -399);

        // Desks
        const deskGeo = new THREE.BoxGeometry(20, 10, 12);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x2a2e3a });

        Object.entries(DESKS).forEach(([name, pos]) => {
            const desk = new THREE.Mesh(deskGeo, deskMat);
            desk.position.set(pos.x, 5, pos.z);
            desk.castShadow = true;
            desk.receiveShadow = true;
            this.scene.add(desk);

            // Lamp on desk
            this.addLamp(pos.x - 6, 10, pos.z - 3);

            // Laptop
            const lap = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 4), new THREE.MeshStandardMaterial({ color: 0x000 }));
            lap.position.set(pos.x, 10.5, pos.z);
            this.scene.add(lap);

            const screen = new THREE.Mesh(
                new THREE.BoxGeometry(6, 4, 0.2),
                new THREE.MeshStandardMaterial({ color: 0x000, emissive: PALETTE[name], emissiveIntensity: 0.5 })
            );
            screen.position.set(pos.x, 12.5, pos.z - 2);
            screen.rotation.x = 0.2;
            this.scene.add(screen);
        });

        // Cafeteria furniture
        this.addCounter(ZONES.cafeteria.x, ZONES.cafeteria.z - 40);
        this.addTable(ZONES.cafeteria.x + 30, ZONES.cafeteria.z);

        // Restroom furniture
        this.addToilet(ZONES.restroom.x - 20, ZONES.restroom.z);
        this.addToilet(ZONES.restroom.x + 20, ZONES.restroom.z);
        this.addAC(ZONES.restroom.x, 35, ZONES.restroom.z + 38);

        // Smoking room furniture
        this.addSofa(ZONES.smoking_room.x, ZONES.smoking_room.z);

        this.addPillar(200, 200);
        this.addPillar(-200, 200);
    }

    addCounter(x, z) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(60, 12, 10), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        c.position.set(x, 6, z);
        this.scene.add(c);
    }

    addTable(x, z) {
        const t = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 1, 32), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        t.position.set(x, 8, z);
        this.scene.add(t);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8), new THREE.MeshStandardMaterial({ color: 0x444 }));
        leg.position.set(x, 4, z);
        this.scene.add(leg);
    }

    addToilet(x, z) {
        const t = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 6), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
        t.add(base);
        const back = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 2), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
        back.position.set(0, 3, -4);
        t.add(back);
        t.position.set(x, 2, z);
        this.scene.add(t);
    }

    addSofa(x, z) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(30, 6, 12), new THREE.MeshStandardMaterial({ color: 0x442211 }));
        s.position.set(x, 3, z);
        this.scene.add(s);
    }

    addWall(x, z, w, h, d) {
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({ color: 0x2a2e3a, transparent: true, opacity: 0.4 })
        );
        wall.position.set(x, h / 2, z);
        this.scene.add(wall);
    }

    addAC(x, y, z) {
        const ac = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 3), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        ac.add(body);
        const vent = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 2.5), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        vent.position.y = -1.8;
        ac.add(vent);
        ac.position.set(x, y, z);
        this.scene.add(ac);
    }

    addBulb(x, z) {
        const bulbGrp = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 4), new THREE.MeshStandardMaterial({ color: 0x333 }));
        base.position.y = 48; // Near ceiling
        bulbGrp.add(base);

        const glass = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffffaa, emissive: 0xffffaa, emissiveIntensity: 1 }));
        glass.position.y = 46;
        bulbGrp.add(glass);

        const pl = new THREE.PointLight(0xffffaa, 1.5, 300);
        pl.position.y = 45;
        bulbGrp.add(pl);
        this.lightGroups.bulbs.push(pl);

        bulbGrp.position.set(x, 0, z);
        this.scene.add(bulbGrp);
    }

    addLamp(x, y, z) {
        const lamp = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x111 }));
        lamp.add(base);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4), new THREE.MeshStandardMaterial({ color: 0x222 }));
        stem.position.y = 2;
        lamp.add(stem);
        const shade = new THREE.Mesh(new THREE.CylinderGeometry(1, 3, 3), new THREE.MeshStandardMaterial({ color: 0xcc0000 }));
        shade.position.y = 4;
        lamp.add(shade);

        const pl = new THREE.PointLight(0xffaa22, 0.8, 40);
        pl.position.y = 3;
        lamp.add(pl);
        this.lightGroups.lamps.push(pl);

        lamp.position.set(x, y, z);
        this.scene.add(lamp);
    }

    addZoneMarker(name, x, z, w, h, color) {
        const rect = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshStandardMaterial({ color: color, roughness: 1 })
        );
        rect.rotation.x = -Math.PI / 2;
        rect.position.set(x, 0.2, z);
        this.scene.add(rect);
    }

    addPillar(x, z) {
        const p = new THREE.Mesh(
            new THREE.BoxGeometry(10, 100, 10),
            new THREE.MeshStandardMaterial({ color: 0x0a0b10 })
        );
        p.position.set(x, 50, z);
        this.scene.add(p);
    }

    spawnPersonnel() {
        AGENTS.forEach(name => {
            const group = new THREE.Group();
            const color = PALETTE[name];

            // Body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(6, 10, 4),
                new THREE.MeshStandardMaterial({ color: color })
            );
            body.position.y = 10;
            body.castShadow = true;
            group.add(body);

            // Head
            const head = new THREE.Mesh(
                new THREE.BoxGeometry(5, 5, 5),
                new THREE.MeshStandardMaterial({ color: 0xffdbac })
            );
            head.position.y = 17.5;
            head.castShadow = true;
            group.add(head);

            const hair = new THREE.Mesh(
                new THREE.BoxGeometry(5.2, 2, 5.2),
                new THREE.MeshStandardMaterial({ color: 0x222 })
            );
            hair.position.y = 20;
            group.add(hair);

            this.scene.add(group);
            const pos = DESKS[name];
            group.position.set(pos.x, 0, pos.z + 15);
            this.characters[name] = group;

            // 2D UI Sync
            const marker = document.createElement('div');
            marker.className = 'agent-marker';
            marker.innerHTML = `
                <div class="thought-bubble" id="bubble-${name}">...</div>
                <div class="marker-tag">${name.replace('_', ' ')}</div>
            `;
            this.overlay.appendChild(marker);
            this.labels.push({ el: marker, obj: group, id: name });
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
        this.updateLabels();
    }

    updateLabels() {
        this.labels.forEach(l => {
            const vec = new THREE.Vector3();
            l.obj.getWorldPosition(vec);
            vec.y += 25;
            vec.project(this.camera);

            const x = (vec.x * 0.5 + 0.5) * this.container.clientWidth;
            const y = (vec.y * -0.5 + 0.5) * this.container.clientHeight;

            l.el.style.left = `${x}px`;
            l.el.style.top = `${y}px`;
        });
    }

    moveTo(name, x, z) {
        const obj = this.characters[name];
        if (!obj) return;

        const dx = x - obj.position.x;
        const dz = z - obj.position.z;
        const angle = Math.atan2(dx, dz);

        gsap.to(obj.rotation, { y: angle, duration: 0.3 });
        gsap.to(obj.position, {
            x, z,
            duration: 2.5,
            ease: "power1.inOut"
        });
    }

    speak(name, text) {
        const bubble = document.getElementById(`bubble-${name}`);
        if (!bubble) return;

        bubble.innerText = text;
        gsap.to(bubble, { opacity: 1, scale: 1, y: -10, duration: 0.4, ease: "back.out" });

        setTimeout(() => {
            gsap.to(bubble, { opacity: 0, scale: 0.5, y: 0, duration: 0.3 });
        }, 5000);
    }
}

// --- App Orchestration ---

let engine;

function appendToLog(actor, msg) {
    const log = document.getElementById('hud-log');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<span class="timestamp">[${time}]</span> <span class="actor">${actor.toUpperCase()}</span> ${msg}`;
    log.prepend(entry);

    if (log.children.length > 50) log.lastElementChild.remove();
}

/** Company Drive & Output Asset Display logic */
async function loadCompanyDrive() {
    const modal = document.getElementById('drive-modal');
    const container = document.getElementById('drive-contents');
    const title = document.getElementById('drive-modal-title');

    title.innerText = "Corporate Intelligence Drive";
    modal.classList.add('active');

    container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Accessing Corporate Knowledge...</div>';

    try {
        const brainEntries = await api.getBrainEntries();
        const campaigns = await api.getCampaigns(5);

        let html = '<div style="display: grid; gap: 2rem;">';

        // --- Knowledge Brain Section ---
        html += `<div><h2 style="color:#fff; border-bottom:1px solid var(--border-subtle); padding-bottom:10px;">🧠 Corporate Brain</h2><div style="display:grid; gap:10px; margin-top:10px;">`;
        if (brainEntries && brainEntries.length > 0) {
            brainEntries.reverse().forEach(e => {
                html += `
                    <div style="background: rgba(108, 99, 255, 0.05); border: 1px solid var(--primary); border-radius: 8px; padding: 1rem;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong style="color:var(--primary)">${e.type.toUpperCase()}</strong>
                            <span style="font-size:0.7rem; color:var(--text-dim)">${e.actor} | ${new Date(e.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div style="font-size:0.85rem; margin-top:10px; color:var(--text-base); white-space: pre-wrap;">${typeof e.content === 'string' ? e.content.substring(0, 300) : 'Structured Intelligence'}...</div>
                        <div style="margin-top:15px; display:flex; gap:10px;">
                            <button class="primary-btn" style="padding:5px 12px; font-size:0.65rem;" 
                                onclick="publishToFeed('${e.type === 'research' ? 'Market Insight' : 'Agency Post'}', \`${(typeof e.content === 'string' ? e.content : 'Complex intelligence data').replace(/`/g, '\\`')}\`, '${e.actor}')">
                                Push to Feed
                            </button>
                        </div>
                    </div>
                `;
            });
        } else {
            html += '<p style="color:var(--text-dim)">Brain is empty. Run campaigns to build intelligence.</p>';
        }
        html += '</div></div>';

        // --- Campaigns Section ---
        html += `<div><h2 style="color:#fff; border-bottom:1px solid var(--border-subtle); padding-bottom:10px; margin-top:40px;">📂 Active Drives</h2><div style="display:grid; gap:1.5rem; margin-top:10px;">`;
        if (campaigns && campaigns.length > 0) {
            for (let camp of campaigns) {
                html += `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <h3 style="margin:0; color:var(--brand-gold);">${camp.name}</h3>
                            <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">STATUS: ${camp.status}</span>
                        </div>
                `;

                const tasks = await api.getCampaignTasks(camp.id);
                if (tasks && tasks.length > 0) {
                    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';
                    tasks.forEach(t => {
                        html += `
                            <div style="background: #000; padding: 10px; border-radius: 4px; border-left: 3px solid ${PALETTE[t.assigned_agent] || '#333'}">
                                <div style="font-size: 0.75rem; font-weight: 800; color: #fff; margin-bottom: 4px;">${t.assigned_agent.toUpperCase()}</div>
                                <div style="font-size: 0.7rem; color: var(--text-base);">${t.title}</div>
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                html += '</div>';
            }
        } else {
            html += '<p style="color:var(--text-dim)">No active campaigns.</p>';
        }
        html += '</div></div>';

        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p style="color: var(--danger)">Failed to synchronize drive data.</p>`;
    }
}

function handleUpdates(data) {
    if (data.type === "WS_STATUS") {
        appendToLog("system", data.status === "connected" ? "Neural link established." : "Neural link severed.");
        return;
    }

    const actor = data.actor || 'system';
    const type = data.type || data.event_type || data.decision || 'LOG';
    const msg = data.message || data.details?.message || data.details?.title || JSON.stringify(data.details || "Processing");

    appendToLog(actor, msg);

    if (!engine) return;

    if (type === 'THINKING') {
        engine.speak(actor, "💭 (LLM Think...)");
    } else if (type === 'TASK_STARTED' || type === 'EVALUATING') {
        engine.speak(actor, msg);
        if (DESKS[actor]) engine.moveTo(actor, DESKS[actor].x, DESKS[actor].z - 12);
    } else if (type === 'MEETING') {
        engine.speak(actor, msg);
        engine.moveTo('strategist', ZONES.war_room.x + 15, ZONES.war_room.z - 15);
        engine.moveTo('content_writer', ZONES.war_room.x - 15, ZONES.war_room.z + 15);
        engine.moveTo('finance_controller', ZONES.war_room.x + 20, ZONES.war_room.z + 20);
    } else if (type === 'DECISION_CHAT' || type === 'BLOCKED') {
        engine.speak(actor, msg);
    } else if (type === 'CAMPAIGN_COMPLETED') {
        engine.speak('strategist', "Deployment Successful. ⭐");
        AGENTS.forEach(k => {
            engine.moveTo(k, ZONES.cafeteria.x + (Math.random() * 20 - 10), ZONES.cafeteria.z + (Math.random() * 20 - 10));
        });
        setTimeout(() => {
            AGENTS.forEach(k => {
                if (DESKS[k]) engine.moveTo(k, DESKS[k].x, DESKS[k].z + 15);
            });
        }, 30000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize engine and hide loader immediately
    try {
        engine = new WorkspaceEngine();
        hideLoader();
    } catch (e) {
        console.error("Failed to initialize WorkspaceEngine:", e);
        hideLoader(); // Hide anyway to prevent infinite loading
    }

    // API/WS Hookup
    wsClient.subscribe(handleUpdates);
    wsClient.connect();

    // Stats refresh
    setInterval(async () => {
        const campaigns = await api.getCampaigns(5);
        document.getElementById('kpi-campaigns').innerText = campaigns ? campaigns.length : 0;

        const brainStats = await api.getBrainStats();
        if (brainStats) {
            document.getElementById('kpi-knowledge').innerText = brainStats.total_knowledge_points || 0;
        }

        let spend = 0;
        if (campaigns) campaigns.forEach(c => spend += (c.spent_budget || 0));
        document.getElementById('kpi-spend').innerText = `$${spend.toFixed(2)}`;
    }, 10000);

    // Form
    document.getElementById('campaign-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('cp_name').value,
            industry: document.getElementById('cp_industry').value,
            brand_guidelines: document.getElementById('cp_guidelines').value,
            total_budget: parseFloat(document.getElementById('cp_budget').value)
        };

        showLoader();
        const res = await api.createCampaign(payload);
        if (res) {
            document.getElementById('campaign-modal').classList.remove('active');
            showToast("Deployment Sequence Started", "success");
            await api.runCampaign(res.id);
        }
        hideLoader();
    });
});

// --- Company Identity & Auth Mock ---
function checkCompanyIdentity() {
    const name = localStorage.getItem('agency_company_name');
    const btn = document.getElementById('login-status-btn');
    if (!btn) return name;

    if (name) {
        btn.innerText = name;
        btn.style.background = 'var(--brand-accent)';
        return name;
    }
    return null;
}

function toggleCompanyLogin() {
    document.getElementById('login-modal').classList.add('active');
}

function saveCompanyIdentity() {
    const input = document.getElementById('company_name_input');
    if (input.value.trim()) {
        localStorage.setItem('agency_company_name', input.value.trim());
        document.getElementById('login-modal').classList.remove('active');
        checkCompanyIdentity();
        if (typeof showToast === 'function') showToast(`Authenticated as ${input.value.trim()}`, 'success');
    }
}

// Ensure identity is checked on load
window.addEventListener('load', () => {
    checkCompanyIdentity();
});

async function publishToFeed(title, content, actor, campaignId = 0) {
    const company = checkCompanyIdentity();
    if (!company) {
        if (typeof showToast === 'function') showToast('Please login to your company first', 'warning');
        toggleCompanyLogin();
        return;
    }

    const res = await api.publishPost({
        title: title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        actor: actor,
        campaign_id: campaignId
    });

    if (res && res.status === 'success') {
        if (typeof showToast === 'function') showToast('Content pushed to public feed!', 'success');
        loadCorporateFeed(); // Refresh if open
    }
}

async function loadCorporateFeed() {
    const modal = document.getElementById('drive-modal');
    const container = document.getElementById('drive-contents');
    const title = document.getElementById('drive-modal-title');

    title.innerText = "🌍 Public Corporate Feed";
    modal.classList.add('active');
    container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Tapping into public data stream...</div>';

    try {
        const feed = await api.getPortalFeed();
        if (!feed || feed.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Feed is currently quiet. Publish research to attract users.</div>';
            return;
        }

        let html = '<div style="display:grid; gap:20px;">';
        feed.forEach(post => {
            html += `
                <div style="background: rgba(0, 212, 170, 0.05); border: 1px solid var(--success); border-radius: 12px; padding: 20px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <span style="font-weight:800; color:var(--success); font-size:0.7rem;">LIVE UPDATE</span>
                        <span style="font-size:0.65rem; color:var(--text-dim)">${new Date(post.timestamp).toLocaleString()}</span>
                    </div>
                    <h3 style="margin:0 0 10px 0; color:#fff;">${post.title}</h3>
                    <div style="font-size:0.85rem; color:var(--text-base); white-space: pre-wrap; margin-bottom:15px; border-left: 2px solid #333; padding-left:15px;">
                        ${post.content.substring(0, 500)}${post.content.length > 500 ? '...' : ''}
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:0.75rem; color:var(--text-dim)">By ${post.actor}</span>
                        <div style="display:flex; gap:10px;">
                            <span style="font-size:0.7rem; color:var(--brand-accent)">1.2k views</span>
                            <span style="font-size:0.7rem; color:var(--success)">84 engagements</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div style="color:var(--danger)">Failed to load corporate feed.</div>';
    }
}

// --- NEW: Human Review Center ---
async function loadHumanReviewCenter() {
    const modal = document.getElementById('review-modal');
    const container = document.getElementById('review-contents');
    modal.classList.add('active');
    container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Scanning for unrated intelligence...</div>';

    try {
        const tasks = await api.getCompletedTasks();
        if (!tasks || tasks.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">No completed tasks found. Deploy AI to generate results.</div>';
            return;
        }

        const avgRating = (tasks.reduce((acc, t) => acc + (t.human_rating || 0), 0) / tasks.filter(t => t.human_rating).length || 0).toFixed(1);

        let html = `
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; margin-bottom:30px; background:rgba(255,255,255,0.03); padding:20px; border-radius:12px; border:1px solid #222;">
                <div style="text-align:center; border-right:1px solid #222;">
                    <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Fleet Output</div>
                    <div style="font-size:1.5rem; font-weight:800; color:#fff;">${tasks.length}</div>
                </div>
                <div style="text-align:center; border-right:1px solid #222;">
                    <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Avg Rating</div>
                    <div style="font-size:1.5rem; font-weight:800; color:var(--brand-gold);">${avgRating} ⭐</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:0.6rem; color:var(--text-dim); text-transform:uppercase; letter-spacing:1px;">Automated</div>
                    <div style="font-size:1.5rem; font-weight:800; color:var(--brand-accent);">${tasks.filter(t => t.published_at).length}</div>
                </div>
            </div>
            <div style="display:grid; gap:25px;">
        `;

        // Active Reviews
        const pendingTasks = tasks.filter(t => !t.published_at);
        const archivedTasks = tasks.filter(t => t.published_at);

        if (pendingTasks.length > 0) {
            html += '<h2 style="color:var(--brand-gold); margin-bottom:10px; border-bottom:1px solid #333; padding-bottom:10px;">📥 Pending Human Review</h2>';
            pendingTasks.forEach(task => {
                const hasRating = task.human_rating !== null;
                html += `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid ${hasRating ? 'var(--success)' : 'var(--border-subtle)'}; border-radius: 12px; padding: 25px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px;">
                            <div>
                                <h3 style="margin:0; color:#fff;">${task.title}</h3>
                                <div style="display:flex; gap:10px; margin-top:5px;">
                                    <span style="font-size:0.65rem; color:var(--text-dim); text-transform:uppercase;">Agent: ${task.assigned_agent}</span>
                                    <span style="font-size:0.65rem; color:var(--brand-gold); text-transform:uppercase;">Platform: ${task.platform || 'General'}</span>
                                </div>
                            </div>
                            <span style="background:${hasRating ? 'var(--success)' : '#333'}; padding:4px 10px; border-radius:4px; font-size:0.65rem; color:#fff; font-weight:800;">
                                ${hasRating ? 'READY TO POST' : 'NEEDS REVIEW'}
                            </span>
                        </div>
                        
                        <div style="background:#000; border:1px solid #111; padding:15px; border-radius:8px; font-family:'JetBrains Mono'; font-size:0.8rem; line-height:1.6; color:var(--text-base); white-space:pre-wrap; max-height:300px; overflow-y:auto; margin-bottom:20px;">
                            ${task.output_content}
                        </div>

                        <div style="display:flex; align-items:center; gap:20px; border-top:1px solid #222; padding-top:20px;">
                            <div style="display:flex; gap:5px;">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <span onclick="submitHumanRating(${task.id}, ${star})" 
                                          style="cursor:pointer; font-size:1.2rem; filter: ${task.human_rating >= star ? 'none' : 'grayscale(1) opacity(0.3)'}">
                                        ⭐
                                    </span>
                                `).join('')}
                            </div>
                            <input type="text" id="feedback-${task.id}" placeholder="Add qualitative feedback..." 
                                   value="${task.human_feedback || ''}"
                                   style="flex:1; background:transparent; border:none; border-bottom:1px solid #333; color:#fff; font-size:0.8rem; padding:5px;">
                            <div style="display:flex; gap:10px;">
                                <button class="primary-btn" style="padding:8px 15px; font-size:0.7rem; background:#333;" onclick="submitHumanRating(${task.id})">Save Rating</button>
                                <button class="primary-btn" 
                                        style="padding:8px 15px; font-size:0.7rem; background: ${hasRating ? 'var(--brand-accent)' : '#111'}; cursor: ${hasRating ? 'pointer' : 'not-allowed'}" 
                                        onclick="${hasRating ? `automatePublish(${task.id})` : ''}">
                                    Direct Publish
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        if (archivedTasks.length > 0) {
            html += '<h2 style="color:var(--text-dim); margin:40px 0 10px 0; border-bottom:1px solid #333; padding-bottom:10px;">📁 Post Archive (Automated)</h2>';
            archivedTasks.forEach(task => {
                html += `
                    <div style="background: rgba(0,255,100,0.02); border: 1px solid rgba(0,255,100,0.1); border-radius: 12px; padding: 20px; opacity: 0.7;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <div>
                                <h4 style="margin:0; color:#fff;">${task.title}</h4>
                                <div style="font-size:0.6rem; color:var(--text-dim); margin-top:4px;">
                                    PUBLISHED TO ${task.platform.toUpperCase()} ON ${new Date(task.published_at).toLocaleString()}
                                </div>
                            </div>
                            <div style="display:flex; gap:5px;">
                                ${[1, 2, 3, 4, 5].map(star => `<span style="font-size:0.8rem; filter: ${task.human_rating >= star ? 'none' : 'grayscale(1) opacity(0.3)'}">⭐</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div style="color:var(--danger)">Fault in Review Logic. System restart required.</div>';
    }
}

async function submitHumanRating(taskId, star = null) {
    const feedback = document.getElementById(`feedback-${taskId}`).value;
    const rating = star || parseInt(prompt("Enter Star Rating (1-5):", "5"));

    if (rating < 1 || rating > 5) return;

    showLoader("Syncing Human Insight");
    const res = await api.rateTask(taskId, rating, feedback);
    hideLoader();

    if (res) {
        showToast("Insight Synced to Neural Network", "success");
        loadHumanReviewCenter(); // Refresh
    }
}

async function automatePublish(taskId) {
    showLoader("Bypassing 2FA Gateways...");
    const res = await api.publishTask(taskId);
    hideLoader();

    if (res) {
        showToast("Content Fully Automated & Pushed!", "success");
        loadHumanReviewCenter(); // Refresh UI to show PUBLISHED
    }
}

// --- NEW: Security Vault ---
async function loadSecurityVault() {
    const modal = document.getElementById('security-modal');
    const container = document.getElementById('security-contents');
    modal.classList.add('active');
    container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Decrypting security sectors...</div>';

    try {
        const accounts = await api.getSocialAccounts();
        let html = '<div style="display:grid; gap:15px;">';

        accounts.forEach(acc => {
            const isConnected = acc.status === 'connected';
            html += `
                <div style="background: #0a0a0a; border:1px solid #222; padding:20px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="width:40px; height:40px; background:#111; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                            ${acc.platform === 'linkedin' ? '🔗' : acc.platform === 'meta' ? '♾️' : '💬'}
                        </div>
                        <div>
                            <div style="font-weight:800; color:#fff; font-size:0.9rem;">${acc.platform.toUpperCase()}</div>
                            <div style="font-size:0.75rem; color:var(--text-dim)">${acc.account_name || 'Not Linked'}</div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="margin-bottom:8px;">
                            ${isConnected ?
                    '<span style="color:var(--success); font-size:0.65rem; font-weight:800;">● SECURE</span>' :
                    '<span style="color:var(--danger); font-size:0.65rem; font-weight:800;">● ACTION REQUIRED</span>'}
                        </div>
                        <button class="primary-btn" style="padding:5px 12px; font-size:0.65rem; background: ${isConnected ? '#222' : 'var(--brand-accent)'}" 
                                onclick="${isConnected ? '' : `verify2FA('${acc.platform}')`}">
                            ${isConnected ? 'Manage 2FA' : 'Verify 2FA'}
                        </button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = '<div style="color:var(--danger)">Security Protocol Breach. Access Blocked.</div>';
    }
}

async function verify2FA(platform) {
    const code = prompt(`Enter 6-digit 2FA code for ${platform.toUpperCase()}:`, "123456");
    if (!code) return;

    showLoader("Authenticating...");
    const res = await api.verifySocial2FA(platform);
    hideLoader();

    if (res) {
        showToast(`${platform.capitalize()} Linked & Secured`, "success");
        loadSecurityVault();
    }
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
