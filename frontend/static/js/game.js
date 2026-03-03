/**
 * Three.js Full WebGL 3D Company Engine
 */

const AGENTS = [
    "strategist", "content_writer", "approver", "risk_agent", "finance_controller", "seo_agent", "ads_manager", "social_manager", "peon"
];

const PALETTE = {
    strategist: 0xff4d6d,
    content_writer: 0x4d79ff,
    approver: 0xffb830,
    risk_agent: 0x9933ff,
    finance_controller: 0x2ec4b6,
    seo_agent: 0xff9f1c,
    ads_manager: 0x43bccd,
    social_manager: 0xef476f,
    peon: 0xaaaaaa // Grey uniform for the helper
};

// 3D Grid coordinates (X, Z). Y is UP.
const DESKS = {
    strategist: { x: 30, z: -50 },
    content_writer: { x: 80, z: -50 },
    seo_agent: { x: 130, z: -50 },
    approver: { x: 30, z: 10 },
    risk_agent: { x: 80, z: 10 },
    finance_controller: { x: 130, z: 10 },
    ads_manager: { x: 30, z: 70 },
    social_manager: { x: 80, z: 70 },
    peon: { x: -30, z: 120 } // Peon rests near the cafeteria/washroom
};

const ZONES = {
    war_room: { x: -70, z: -50 },
    cafeteria: { x: -70, z: 70 },
    washroom: { x: 140, z: 140 }
};

class Office3D {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.overlay = document.getElementById('ui-overlay');

        // Setup Three.js core
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c14);
        // Soft fog to blend the edges of our floor
        this.scene.fog = new THREE.Fog(0x0a0c14, 200, 500);

        // Camera setup (Isometric perspective)
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
        this.camera.position.set(150, 200, 200);
        this.camera.lookAt(20, 0, 10);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        this.dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.dirLight.position.set(100, 200, 50);
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.left = -200;
        this.dirLight.shadow.camera.right = 200;
        this.dirLight.shadow.camera.top = 200;
        this.dirLight.shadow.camera.bottom = -200;
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.scene.add(this.dirLight);

        // Environment
        this.buildOffice();

        // Characters Dictionary
        this.characters = {};
        this.buildCharacters();

        // Window resize binding
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });

        // Animation Loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    buildOffice() {
        // Floor Plane
        const floorGeo = new THREE.PlaneGeometry(600, 600);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x1a1d2e,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid helper to simulate carpet tiles
        const grid = new THREE.GridHelper(600, 60, 0x333852, 0x222536);
        grid.position.y = 0.1;
        this.scene.add(grid);

        // War Room Walls (Glass effect)
        const wallMat = new THREE.MeshPhysicalMaterial({
            color: 0x4d79ff, transmission: 0.5, opacity: 0.3, transparent: true, roughness: 0.1
        });

        // Build 3 walls (Back, Left, Right)
        const wallBack = new THREE.Mesh(new THREE.BoxGeometry(80, 25, 2), wallMat);
        wallBack.position.set(ZONES.war_room.x, 12.5, ZONES.war_room.z - 40);
        this.scene.add(wallBack);

        const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(2, 25, 80), wallMat);
        wallLeft.position.set(ZONES.war_room.x - 40, 12.5, ZONES.war_room.z);
        this.scene.add(wallLeft);

        const wallRight = new THREE.Mesh(new THREE.BoxGeometry(2, 25, 80), wallMat);
        wallRight.position.set(ZONES.war_room.x + 40, 12.5, ZONES.war_room.z);
        this.scene.add(wallRight);

        // Interactive Door (Pivot Point grouping for swinging)
        this.warRoomDoorGroup = new THREE.Group();
        this.warRoomDoorGroup.position.set(ZONES.war_room.x + 20, 12.5, ZONES.war_room.z + 40); // Hinge location
        const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(40, 25, 2), wallMat);
        doorMesh.position.set(-20, 0, 0); // Offset mesh from hinge
        this.warRoomDoorGroup.add(doorMesh);
        this.scene.add(this.warRoomDoorGroup);

        // Conference Table
        const confTable = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 3, 32), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        confTable.position.set(ZONES.war_room.x, 8, ZONES.war_room.z);
        confTable.castShadow = true;
        this.scene.add(confTable);

        // Cafeteria Section
        const cafeMat = new THREE.MeshStandardMaterial({ color: 0x2a2e45 });
        const counter = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 15), cafeMat);
        counter.position.set(ZONES.cafeteria.x, 5, ZONES.cafeteria.z - 20);
        counter.castShadow = true;
        this.scene.add(counter);

        // Desks
        const deskGeo = new THREE.BoxGeometry(18, 10, 12);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
        const laptopGeo = new THREE.BoxGeometry(6, 4, 1);
        const lapMat = new THREE.MeshStandardMaterial({ color: 0x111, emissive: 0x00ffcc, emissiveIntensity: 0.2 });

        Object.values(DESKS).forEach(pos => {
            const d = new THREE.Mesh(deskGeo, deskMat);
            d.position.set(pos.x, 5, pos.z);
            d.castShadow = true; d.receiveShadow = true;
            this.scene.add(d);

            const l = new THREE.Mesh(laptopGeo, lapMat);
            l.position.set(pos.x, 12, pos.z + 2);
            l.rotation.x = -0.2;
            this.scene.add(l);
        });
    }

    buildCharacters() {
        AGENTS.forEach(name => {
            const charGrp = new THREE.Group();
            const color = PALETTE[name] || 0xcccccc;

            const tMat = new THREE.MeshStandardMaterial({ color: color });
            const sMat = new THREE.MeshStandardMaterial({ color: 0xffccaa }); // skin
            const dark = new THREE.MeshStandardMaterial({ color: 0x222222 }); // hair/pants

            // Torso (Dress/Shirt)
            const torso = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 4), tMat);
            torso.position.y = 11;
            torso.castShadow = true;
            charGrp.add(torso);

            // Head
            const head = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), sMat);
            head.position.y = 18;
            head.castShadow = true;
            charGrp.add(head);

            // Hair
            const hair = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2, 5.4), dark);
            hair.position.y = 20.5;
            charGrp.add(hair);

            // Eyes
            const eyeGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
            const eyeL = new THREE.Mesh(eyeGeo, dark); eyeL.position.set(-1.2, 18.5, 2.6);
            const eyeR = new THREE.Mesh(eyeGeo, dark); eyeR.position.set(1.2, 18.5, 2.6);
            charGrp.add(eyeL, eyeR);

            // Legs
            const legGeo = new THREE.BoxGeometry(2.5, 7, 2.5);
            const legL = new THREE.Mesh(legGeo, dark);
            legL.position.set(-1.6, 3.5, 0); legL.castShadow = true;
            const legR = new THREE.Mesh(legGeo, dark);
            legR.position.set(1.6, 3.5, 0); legR.castShadow = true;
            charGrp.add(legL, legR);

            // Arms
            const armGeo = new THREE.BoxGeometry(2, 7, 2);
            const armL = new THREE.Mesh(armGeo, tMat);
            armL.position.set(-4.2, 10.5, 0); armL.castShadow = true;
            const armR = new THREE.Mesh(armGeo, tMat);
            armR.position.set(4.2, 10.5, 0); armR.castShadow = true;
            charGrp.add(armL, armR);

            // Reference handles for animation
            charGrp.userData = {
                legL, legR, armL, armR, isWalking: false
            };

            // Start at Desk
            const pos = DESKS[name];
            charGrp.position.set(pos.x, 0, pos.z - 10);
            charGrp.rotation.y = Math.PI; // Look at desk

            this.scene.add(charGrp);
            this.characters[name] = charGrp;

            // Generate 2D Overlay Tags
            this.createOverlayUI(name);
        });
    }

    createOverlayUI(name) {
        // Tag
        const tag = document.createElement('div');
        tag.className = 'agent-tag';
        tag.id = `tag-${name}`;
        tag.innerText = name.toUpperCase();
        this.overlay.appendChild(tag);

        // Bubble holding container
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.id = `bubble-${name}`;
        this.overlay.appendChild(bubble);
    }

    updateOverlays() {
        // Project 3D vectors to 2D screen space to stick HTML labels on heads
        const vector = new THREE.Vector3();
        const heightOffset = 26; // Above head

        Object.keys(this.characters).forEach(name => {
            const char = this.characters[name];

            // Handle Walking Animations smoothly running in the render loop
            if (char.userData.isWalking) {
                const time = Date.now() * 0.01;
                char.userData.legL.rotation.x = Math.sin(time) * 0.5;
                char.userData.legR.rotation.x = -Math.sin(time) * 0.5;
                char.userData.armL.rotation.x = -Math.sin(time) * 0.5;
                char.userData.armR.rotation.x = Math.sin(time) * 0.5;
            }

            vector.setFromMatrixPosition(char.matrixWorld);
            vector.y += heightOffset;

            vector.project(this.camera);

            const x = (vector.x * .5 + .5) * this.container.clientWidth;
            const y = (vector.y * -.5 + .5) * this.container.clientHeight;

            const tag = document.getElementById(`tag-${name}`);
            if (tag) {
                tag.style.left = `${x}px`;
                tag.style.top = `${y}px`;
            }

            const bubble = document.getElementById(`bubble-${name}`);
            if (bubble) {
                // bubble floats higher
                bubble.style.left = `${x}px`;
                bubble.style.top = `${y - 20}px`;
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.updateOverlays();
        this.renderer.render(this.scene, this.camera);
    }

    // Core Movement controller connected to GSAP
    moveTo(name, tgtX, tgtZ, lookRotation = 0) {
        const char = this.characters[name];
        if (!char) return;

        // Calculate distance for dynamic duration speed
        const dx = tgtX - char.position.x;
        const dz = tgtZ - char.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        const dur = Math.max(1, dist / 40); // 40 units per second speed

        // Point character towards target
        const angle = Math.atan2(dx, dz);
        gsap.to(char.rotation, { y: angle, duration: 0.3 });

        char.userData.isWalking = true;

        gsap.to(char.position, {
            x: tgtX, z: tgtZ,
            duration: dur,
            ease: "none",
            onComplete: () => {
                char.userData.isWalking = false;
                // Reset limb rotations to standing flat
                gsap.to([char.userData.legL.rotation, char.userData.legR.rotation, char.userData.armL.rotation, char.userData.armR.rotation], {
                    x: 0, duration: 0.2
                });

                // Snap to final correct facing direction (e.g., looking at desk)
                if (lookRotation !== null) {
                    gsap.to(char.rotation, { y: lookRotation, duration: 0.5 });
                }
            }
        });

        // Auto-open War Room door if character approaches it
        if (tgtX < -30 && tgtZ < -10) {
            gsap.to(this.warRoomDoorGroup.rotation, { y: -Math.PI / 2, duration: 1 }); // Swing open
            setTimeout(() => {
                gsap.to(this.warRoomDoorGroup.rotation, { y: 0, duration: 1 }); // Auto close later
            }, (dur * 1000) + 1000);
        }
    }

    // UI Chat interaction
    showChat(name, text, isError = false) {
        const b = document.getElementById(`bubble-${name}`);
        if (b) {
            b.innerText = text;
            b.className = isError ? "chat-bubble chat-error" : "chat-bubble";

            gsap.killTweensOf(b); // reset if flashing
            // Pop in
            gsap.fromTo(b, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.5)" });

            // Pop out automatically
            gsap.to(b, {
                scale: 0, opacity: 0, duration: 0.3, delay: 5, ease: "back.in(1.5)"
            });
        }
    }

    // Visual indicators for thinking / working
    simulateWorking(name) {
        const char = this.characters[name];
        if (!char) return;

        // Bob arms up and down fast like typing keyboard
        const tl = gsap.timeline({ repeat: 10, yoyo: true });
        tl.to([char.userData.armL.rotation, char.userData.armR.rotation], {
            x: -0.5, duration: 0.1
        });
    }

    // Peon AI loop - Randomly wander
    startPeonLoop() {
        setInterval(() => {
            const loc = Math.random();
            if (loc < 0.3) this.moveTo("peon", ZONES.cafeteria.x, ZONES.cafeteria.z, null);
            else if (loc < 0.6) this.moveTo("peon", DESKS.strategist.x - 20, DESKS.strategist.z, null);
            else this.moveTo("peon", ZONES.washroom.x, ZONES.washroom.z, null);

            // Randomly clean or deliver files
            setTimeout(() => {
                this.showChat("peon", "Refilling coffee...", false);
            }, 3000);

        }, 12000);
    }
}


/* MAIN EXECUTION LIFECYCLE */

let engine3D = null;

// Terminal UI Log
function appendLog(actor, msg) {
    const term = document.getElementById("hud-log");
    const div = document.createElement("div");
    div.className = "log-entry";
    div.innerHTML = `<span style="color:#00ffcc">[${actor}]</span> ${msg}`;
    term.prepend(div);
}

// Map real-time WS events to 3D actions
function handleWsUpdates(msg) {
    if (msg.type === "WS_STATUS") {
        document.getElementById("ws-status-orb").className = msg.status === "connected" ? "orb active" : "orb";
        document.getElementById("ws-status-text").innerText = msg.status === "connected" ? "LLM Engine Synced" : "Reconnecting...";
        return;
    }

    let actor = msg.actor || "system";
    let eventLabel = msg.event_type || msg.decision || msg.type || "LOG";
    let logMsg = msg.message || msg.details?.message || msg.details?.title || JSON.stringify(msg.details || "Processing");

    if (msg.type === "THINKING") logMsg = "Connecting Local Model Core...";

    // Terminal Audit
    appendLog(actor, `${eventLabel}: ${logMsg}`);

    if (!engine3D) return;

    if (msg.type === "THINKING") {
        engine3D.showChat(actor, "💭 (LLM Think...)");
        engine3D.simulateWorking(actor);
        return;
    }

    if (eventLabel === "MEETING") {
        engine3D.showChat(actor, logMsg);
        // Move attendees dynamically into the War Room
        engine3D.moveTo("strategist", ZONES.war_room.x + 15, ZONES.war_room.z - 15, Math.PI / 4);
        engine3D.moveTo("content_writer", ZONES.war_room.x - 15, ZONES.war_room.z + 15, -Math.PI / 4 * 3);
        engine3D.moveTo("finance_controller", ZONES.war_room.x + 20, ZONES.war_room.z + 20, -Math.PI / 4);
        return;
    }

    if (eventLabel === "TASK_STARTED" || eventLabel === "EVALUATING") {
        engine3D.showChat(actor, logMsg);
        // Dispatch worker back to desk to execute task
        if (DESKS[actor]) {
            engine3D.moveTo(actor, DESKS[actor].x, DESKS[actor].z - 12, Math.PI); // PI = looking back at desk coordinates
        }
    }

    if (msg.type === "DECISION_CHAT") {
        const isError = msg.decision === "BLOCKED" || msg.decision === "REVISION";
        const txt = isError ? `❌ ${msg.decision}: ${logMsg}` : `✅ ${msg.decision}`;
        engine3D.showChat(actor, txt, isError);

        // If reviewing, occasionally look around or type
        engine3D.simulateWorking(actor);
        return;
    }

    if (eventLabel === "CAMPAIGN_COMPLETED") {
        engine3D.showChat("strategist", "Initiative completed successfully. ⭐");

        // Let everyone walk to the cafeteria for coffee/break
        AGENTS.forEach((k) => {
            engine3D.moveTo(k, ZONES.cafeteria.x + (Math.random() * 20 - 10), ZONES.cafeteria.z + (Math.random() * 20 - 10), Math.random() * Math.PI);
        });

        // Return to desks after a minute
        setTimeout(() => {
            AGENTS.forEach((k) => {
                if (DESKS[k]) engine3D.moveTo(k, DESKS[k].x, DESKS[k].z - 12, Math.PI);
            });
        }, 15000);

        refreshDashboard();
    }
}

async function refreshDashboard() {
    const list = await api.getCampaigns(5);
    document.getElementById("kpi-campaigns").innerText = list ? list.length : 0;
    if (list) {
        let spend = 0; list.forEach(l => spend += (l.spent_budget || 0));
        document.getElementById("kpi-spend").innerText = `$${spend.toFixed(2)}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Initiate WebGL Engine
    engine3D = new Office3D();
    engine3D.startPeonLoop();

    refreshDashboard();

    // Socket mappings
    wsClient.subscribe(handleWsUpdates);
    wsClient.connect();

    // Theming Button setup
    document.getElementById("theme-toggle").addEventListener("click", () => {
        const doc = document.documentElement;
        if (doc.getAttribute("data-theme") === "dark") {
            doc.setAttribute("data-theme", "light");
            engine3D.scene.background = new THREE.Color(0xf0f0f5);
            engine3D.scene.fog.color = new THREE.Color(0xf0f0f5);
        } else {
            doc.setAttribute("data-theme", "dark");
            engine3D.scene.background = new THREE.Color(0x0a0c14);
            engine3D.scene.fog.color = new THREE.Color(0x0a0c14);
        }
    });

    // Form Intercept API trigger
    document.getElementById("campaignForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            name: document.getElementById("cp_name").value,
            brand_guidelines: document.getElementById("cp_guidelines").value,
            workflow_type: "content_campaign",
            total_budget: parseFloat(document.getElementById("cp_budget").value || 500)
        };
        const res = await api.createCampaign(payload);
        if (res && res.id) {
            document.getElementById("createCampaignModal").classList.remove("active");
            appendLog("system", "New Initiative injected. Routing to workers...");
            await api.runCampaign(res.id);
        }
    });
});

/** Company Drive & Output Asset Display logic */
async function loadCompanyDrive() {
    const modal = document.getElementById('driveModal');
    const container = document.getElementById('drive-contents');
    modal.classList.add('active');

    container.innerHTML = '<div style="text-align:center; padding:20px;">Fetching Latest Asset Blocks <span class="orb active" style="display:inline-block"></span></div>';

    const campaigns = await api.getCampaigns(5);
    if (!campaigns || campaigns.length === 0) {
        container.innerHTML = `<p class="text-muted">No campaigns generated yet. Start the AI Company Work first!</p>`;
        return;
    }

    let htmlStr = ``;
    for (let camp of campaigns) {
        htmlStr += `<div style="background: rgba(0,0,0,0.3); border:1px solid #333; padding:15px; margin-bottom:15px; border-radius:8px;">`;
        htmlStr += `<h3 style="margin:0 0 10px 0; color:var(--primary); font-size:16px;">Marketing Initiative: ${camp.name} <span style="font-size:10px; padding:3px 6px; border-radius:4px; background:#222; color:#fff; float:right;">${camp.status.toUpperCase()}</span></h3>`;
        htmlStr += `<p style="font-size:12px; color:var(--text-muted); margin-bottom:15px;">Budget Expended: $${camp.spent_budget}</p>`;

        const tasks = await api.getCampaignTasks(camp.id);
        if (tasks && tasks.length > 0) {
            htmlStr += `<div style="display:grid; grid-template-columns: 1fr; gap:10px;">`;
            for (let t of tasks) {
                const color = t.status === "approved" ? "var(--success, #00ffcc)" : (t.status === "failed" ? "#ff4d6d" : "#ffb830");
                htmlStr += `<div style="background: rgba(255,255,255,0.02); padding:10px; border-left:3px solid ${color};">`;
                htmlStr += `<strong style="font-size:13px; color:#fff;">${t.title}</strong> <span style="font-size:11px; color:#aaa;">(by ${t.assigned_agent})</span>`;

                // Print the raw AI JSON output or copy!
                if (t.output_content) {
                    let text = t.output_content;
                    // truncate if huge
                    if (text.length > 300) text = text.substring(0, 300) + '...';
                    htmlStr += `<div style="margin-top:8px; padding:8px; background:#000; color:#0f0; font-family:monospace; font-size:10px; border-radius:4px; white-space:pre-wrap;">${text}</div>`;
                } else if (t.description) {
                    htmlStr += `<div style="margin-top:8px; padding:8px; background:#000; color:#bbb; font-family:monospace; font-size:10px; border-radius:4px;">Pending Output: ${t.description}</div>`;
                }

                htmlStr += `</div>`;
            }
            htmlStr += `</div>`;
        } else {
            htmlStr += `<p style="font-size:12px; color:#666;">No tasks instantiated yet...</p>`;
        }
        htmlStr += `</div>`;
    }

    container.innerHTML = htmlStr;
}
