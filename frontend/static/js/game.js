/**
 * AgencyOS Master Engine
 * Core logic for 3D simulation and HUD orchestration.
 */

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

const AGENTS = ["strategist", "content_writer", "approver", "risk_agent", "finance_controller", "seo_agent", "ads_manager", "social_manager", "peon"];

const PALETTE = {
    strategist: 0xe2b714,
    content_writer: 0x6c63ff,
    approver: 0x00ffaa,
    risk_agent: 0xff4d4d,
    finance_controller: 0x00ccff,
    seo_agent: 0xfbbf24,
    ads_manager: 0x818cf8,
    social_manager: 0xf472b6,
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
    peon: { x: -40, z: 140 }
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

        this.setupCamera();
        this.setupRenderer();
        this.setupLights();

        this.characters = {};
        this.labels = [];
        this.lightGroups = {
            overhead: [],
            lamps: [],
            bulbs: []
        };
        this.lightsOn = true;

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
    modal.classList.add('active');

    container.innerHTML = '<div style="text-align:center; padding:40px; color: var(--text-dim);">Accessing encrypted campaign storage...</div>';

    try {
        const campaigns = await api.getCampaigns(10);
        if (!campaigns || campaigns.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding:40px;">No campaigns found in current drive.</p>`;
            return;
        }

        let html = '<div style="display: grid; gap: 2rem;">';
        for (let camp of campaigns) {
            html += `
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <h3 style="margin:0; color:var(--brand-gold);">${camp.name}</h3>
                        <span style="font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase;">ID: ${camp.id}</span>
                    </div>
            `;

            const tasks = await api.getCampaignTasks(camp.id);
            if (tasks && tasks.length > 0) {
                html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">';
                tasks.forEach(t => {
                    html += `
                        <div style="background: #000; padding: 10px; border-radius: 4px; border-left: 3px solid ${PALETTE[t.actor] || '#333'}">
                            <div style="font-size: 0.75rem; font-weight: 800; color: #fff; margin-bottom: 4px;">${t.actor.toUpperCase()}</div>
                            <div style="font-size: 0.7rem; color: var(--text-base);">${t.status}</div>
                        </div>
                    `;
                });
                html += '</div>';
            }
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    } catch (e) {
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
    engine = new WorkspaceEngine();

    // API/WS Hookup
    wsClient.subscribe(handleUpdates);
    wsClient.connect();

    // Stats refresh
    setInterval(async () => {
        const campaigns = await api.getCampaigns(5);
        document.getElementById('kpi-campaigns').innerText = campaigns ? campaigns.length : 0;
        let spend = 0;
        if (campaigns) campaigns.forEach(c => spend += (c.spent_budget || 0));
        document.getElementById('kpi-spend').innerText = `$${spend.toFixed(2)}`;
    }, 10000);

    // Form
    document.getElementById('campaign-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById('cp_name').value,
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

    setTimeout(() => hideLoader(), 1500);
});
