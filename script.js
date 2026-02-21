/* ===================================================================
   FEBIN T JAMES — PORTFOLIO SPA ENGINE
   Features: SPA Router, 3D Background, Groq AI Chat, Voice Nav,
             Cursor Trail, Command Palette, Page Nav Buttons, Voice Guide
   =================================================================== */

/* ========== 1. THREE.JS 3D BACKGROUND ========== */
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const N = 180, pos = new Float32Array(N * 3), cols = new Float32Array(N * 3);
    const pal = [[0, .94, 1], [0, .4, 1], [.55, .36, .96], [.08, .72, .65]];
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - .5) * 100; pos[i * 3 + 1] = (Math.random() - .5) * 100; pos[i * 3 + 2] = (Math.random() - .5) * 100; const c = pal[Math.floor(Math.random() * 4)]; cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2]; }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    scene.add(particles);

    // Add 3D Grid / Point Cloud structure
    const grid = new THREE.GridHelper(100, 20, 0x00f0ff, 0x00f0ff);
    grid.material.transparent = true;
    grid.material.opacity = 0.05;
    grid.rotation.x = Math.PI / 2;
    scene.add(grid);

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(6, 1), new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.12 })); ico.position.set(14, 2, -10); scene.add(ico);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(4, .4, 8, 24), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.1 })); tor.position.set(-16, -5, -15); scene.add(tor);
    const oct = new THREE.Mesh(new THREE.OctahedronGeometry(3, 0), new THREE.MeshBasicMaterial({ color: 0x14b8a6, wireframe: true, transparent: true, opacity: 0.1 })); oct.position.set(-10, 10, -20); scene.add(oct);
    const lPos = new Float32Array(N * 6), lGeo = new THREE.BufferGeometry(); lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    scene.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending })));
    camera.position.z = 40; let mx = 0, my = 0;
    document.addEventListener('mousemove', e => { mx = (e.clientX / innerWidth - .5) * 2; my = (e.clientY / innerHeight - .5) * 2; });
    function updateLines() { const p = pGeo.attributes.position.array; let idx = 0; for (let i = 0; i < N && idx < N * 6; i += 3) for (let j = i + 3; j < N && idx < N * 6; j += 3) { const dx = p[i * 3] - p[j * 3], dy = p[i * 3 + 1] - p[j * 3 + 1], dz = p[i * 3 + 2] - p[j * 3 + 2]; if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 14) { lPos[idx++] = p[i * 3]; lPos[idx++] = p[i * 3 + 1]; lPos[idx++] = p[i * 3 + 2]; lPos[idx++] = p[j * 3]; lPos[idx++] = p[j * 3 + 1]; lPos[idx++] = p[j * 3 + 2]; } } for (let k = idx; k < lPos.length; k++)lPos[k] = 0; lGeo.attributes.position.needsUpdate = true; lGeo.setDrawRange(0, idx / 3); }
    let fr = 0;
    (function anim() {
        requestAnimationFrame(anim); fr++;
        particles.rotation.y += .00015; particles.rotation.x += .00005;
        grid.rotation.z += 0.0001;
        ico.rotation.x += .002; ico.rotation.y += .003; tor.rotation.x += .003; tor.rotation.z += .002; oct.rotation.y += .004; oct.rotation.z += .002;
        camera.position.x += (mx * 3 - camera.position.x) * .015; camera.position.y += (-my * 3 - camera.position.y) * .015; camera.lookAt(scene.position);
        const p = pGeo.attributes.position.array; for (let i = 0; i < N; i++) p[i * 3 + 1] += Math.sin(fr * .003 + i) * .003; pGeo.attributes.position.needsUpdate = true;
        if (fr % 15 === 0) updateLines(); renderer.render(scene, camera);
    })();
    addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
})();

/* ========== 2. PRELOADER ========== */
addEventListener('load', () => {
    const p = document.getElementById('preloader');
    const sub = document.getElementById('loaderSubtext');
    if (!sub) return;

    const messages = [
        'Searching for ROS nodes...',
        'Connecting to master_node...',
        'Loading SLAM transforms...',
        'Initializing LiDAR scan...',
        'System ready.'
    ];
    let i = 0;
    const interval = setInterval(() => {
        sub.textContent = messages[i++];
        if (i >= messages.length) clearInterval(interval);
    }, 300);

    if (p) setTimeout(() => p.classList.add('hidden'), 2000);
});

/* ========== 3. SPA ROUTER ========== */
const SPA = {
    currentPage: 'home',
    pages: ['home', 'about', 'experience', 'projects', 'education', 'contact'],
    navigate(page) {
        if (!this.pages.includes(page) || page === this.currentPage) return;
        const old = document.getElementById('page-' + this.currentPage);
        const next = document.getElementById('page-' + page);
        if (!old || !next) return;
        old.style.transition = 'opacity 0.3s, transform 0.3s'; old.style.opacity = '0'; old.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            old.classList.remove('active'); old.style.cssText = '';
            next.classList.add('active');
            next.style.opacity = '0'; next.style.transform = 'translateY(24px)';
            requestAnimationFrame(() => {
                next.style.transition = 'opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1)';
                next.style.opacity = '1'; next.style.transform = 'translateY(0)';
            });
            this.currentPage = page;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.updateNav();
            this.onPageEnter(page);
            history.pushState({ page }, '', '#' + page);
        }, 300);
    },
    updateNav() {
        document.querySelectorAll('.nav-links a').forEach(a => {
            a.classList.toggle('active', a.dataset.page === this.currentPage);
        });
    },
    onPageEnter(page) {
        const el = document.getElementById('page-' + page);
        if (!el) return;
        el.querySelectorAll('.reveal').forEach(r => r.classList.remove('visible'));
        setTimeout(() => {
            el.querySelectorAll('.reveal').forEach(r => {
                const obs = new IntersectionObserver(e => { e.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); } }); }, { threshold: 0.1 });
                obs.observe(r);
            });
        }, 100);
        if (page === 'projects') this.initProjects();
        if (page === 'home') animateCounters();
    },
    initProjects() {
        const cards = document.querySelectorAll('#page-projects .project-card');
        const anims = ['anim-slide-up', 'anim-slide-right', 'anim-zoom-in', 'anim-slide-left', 'anim-flip-in', 'anim-rotate-in'];
        cards.forEach((c, i) => { c.classList.add('project-hidden'); c.dataset.anim = anims[i % anims.length]; c.style.transitionDelay = `${(i % 3) * 0.15}s`; });
        setTimeout(() => {
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('project-hidden'); e.target.classList.add(e.target.dataset.anim); } });
            }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
            cards.forEach(c => obs.observe(c));
        }, 200);
    },
    init() {
        document.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', e => {
                e.preventDefault();
                const page = el.dataset.page;
                if (page) this.navigate(page);
                document.getElementById('hamburger')?.classList.remove('active');
                document.getElementById('navLinks')?.classList.remove('active');
            });
        });
        const hash = location.hash.replace('#', '') || 'home';
        if (hash !== 'home' && this.pages.includes(hash)) {
            document.getElementById('page-home')?.classList.remove('active');
            document.getElementById('page-' + hash)?.classList.add('active');
            this.currentPage = hash;
            this.updateNav();
        }
        addEventListener('popstate', e => { if (e.state?.page) this.navigate(e.state.page); });
        this.onPageEnter(this.currentPage);
    }
};

/* ========== 4. TYPED TEXT ========== */
const typedEl = document.getElementById('typed-text');
if (typedEl) {
    const strs = ['Autonomous Robots', 'Computer Vision Systems', 'ROS 2 Applications', 'AI-Powered Solutions', 'Embedded IoT Devices', 'Robotic Arms'];
    let si = 0, ci = 0, del = false;
    (function type() {
        const s = strs[si]; typedEl.textContent = del ? s.substring(0, ci--) : s.substring(0, ci++);
        let d = del ? 40 : 80;
        if (!del && ci > s.length) { d = 2000; del = true; } else if (del && ci < 0) { del = false; si = (si + 1) % strs.length; d = 500; }
        setTimeout(type, d);
    })();
}

/* ========== 5. STAT COUNTERS ========== */
function animateCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const t = +el.dataset.target, s = performance.now();
        (function u(now) { const p = Math.min((now - s) / 2000, 1); el.textContent = Math.floor(p * t); if (p < 1) requestAnimationFrame(u); else el.textContent = t; })(s);
    });
}

/* ========== 6. NAVBAR ========== */
const navbar = document.getElementById('navbar');
addEventListener('scroll', () => { if (navbar) navbar.classList.toggle('scrolled', scrollY > 50); });
const hamburger = document.getElementById('hamburger'), navLinks = document.getElementById('navLinks');
if (hamburger) hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); navLinks.classList.toggle('active'); });

/* ========== 7. SCROLL REVEAL ========== */
document.querySelectorAll('.skill-category,.section-title,.about-text,.about-image,.timeline-item,.hero-stats,.contact-subtitle,.project-filters,.education-card,.achievement-item,.cert-card,.contact-card,.page-nav-card,.contact-grid,.page-nav-bar').forEach(el => {
    el.classList.add('reveal');
    const obs = new IntersectionObserver(e => { e.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); }); }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    obs.observe(el);
});

/* ========== 8. PROJECT FILTERS ========== */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active')?.classList.remove('active');
        btn.classList.add('active');
        const f = btn.dataset.filter;
        const cards = document.querySelectorAll('.project-card');
        let vi = 0;
        cards.forEach(c => {
            if (f === 'all' || c.dataset.category.includes(f)) {
                c.style.display = ''; c.className = 'project-card glass-card'; c.classList.add('project-hidden');
                setTimeout(() => { c.classList.remove('project-hidden'); c.classList.add(c.dataset.anim || 'anim-slide-up'); }, vi * 100); vi++;
            } else c.style.display = 'none';
        });
    });
});

/* ========== 9. 3D TILT (Desktop) ========== */
if (innerWidth > 768) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => { const r = card.getBoundingClientRect(); card.style.transform = `perspective(800px) rotateX(${((e.clientY - r.top) / r.height - .5) * -8}deg) rotateY(${((e.clientX - r.left) / r.width - .5) * 8}deg) scale(1.02)`; });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}

/* ========== 10. VIDEO MODAL ========== */
const videoModal = document.getElementById('videoModal'), modalVideo = document.getElementById('modalVideo');
if (videoModal) {
    document.querySelectorAll('.btn-play-video').forEach(b => { b.addEventListener('click', () => { modalVideo.src = b.dataset.video; videoModal.classList.add('active'); modalVideo.play(); }); });
    document.querySelector('.video-modal-close')?.addEventListener('click', () => { videoModal.classList.remove('active'); modalVideo.pause(); modalVideo.src = ''; });
    videoModal.addEventListener('click', e => { if (e.target === videoModal) { videoModal.classList.remove('active'); modalVideo.pause(); modalVideo.src = ''; } });
}

/* ========== 11. CURSOR GLOW TRAIL ========== */
(function () {
    const c = document.getElementById('cursor-canvas');
    if (!c || 'ontouchstart' in window) return;
    const ctx = c.getContext('2d');
    c.width = innerWidth; c.height = innerHeight;
    addEventListener('resize', () => { c.width = innerWidth; c.height = innerHeight; });
    const dots = [], MAX = 40;
    let cmx = 0, cmy = 0;
    document.addEventListener('mousemove', e => { cmx = e.clientX; cmy = e.clientY; });
    (function loop() {
        requestAnimationFrame(loop);
        ctx.clearRect(0, 0, c.width, c.height);
        dots.push({ x: cmx, y: cmy, alpha: 1, size: 3 + Math.random() * 3 });
        if (dots.length > MAX) dots.shift();
        dots.forEach(d => {
            d.alpha -= 0.025; d.size *= 0.97;
            if (d.alpha <= 0) return;
            ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${d.alpha * 0.5})`; ctx.fill();
            ctx.beginPath(); ctx.arc(d.x, d.y, d.size * 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${d.alpha * 0.08})`; ctx.fill();
        });
    })();
})();

/* ========== 12. COMMAND PALETTE ========== */
(function () {
    const palette = document.getElementById('cmdPalette');
    const input = document.getElementById('cmdInput');
    const results = document.getElementById('cmdResults');
    if (!palette) return;
    const commands = [
        { label: 'Go to Home', icon: 'fas fa-home', action: () => SPA.navigate('home') },
        { label: 'Go to About & Skills', icon: 'fas fa-user', action: () => SPA.navigate('about') },
        { label: 'Go to Experience', icon: 'fas fa-briefcase', action: () => SPA.navigate('experience') },
        { label: 'Go to Projects', icon: 'fas fa-project-diagram', action: () => SPA.navigate('projects') },
        { label: 'Go to Education', icon: 'fas fa-graduation-cap', action: () => SPA.navigate('education') },
        { label: 'Go to Contact', icon: 'fas fa-envelope', action: () => SPA.navigate('contact') },
        { label: 'Open AI Chat', icon: 'fas fa-robot', action: () => { document.getElementById('chatBox')?.classList.add('open'); } },
        { label: 'Toggle Voice Navigation', icon: 'fas fa-microphone', action: () => VoiceNav.toggle() },
        { label: 'Email Febin', icon: 'fas fa-paper-plane', action: () => window.open('mailto:febintj007@gmail.com') },
        { label: 'GitHub Profile', icon: 'fab fa-github', action: () => window.open('https://github.com/febintjames', '_blank') },
        { label: 'LinkedIn Profile', icon: 'fab fa-linkedin', action: () => window.open('https://linkedin.com/in/febin-t-james', '_blank') },
        { label: 'Filter: Robotics Projects', icon: 'fas fa-robot', action: () => { SPA.navigate('projects'); setTimeout(() => document.querySelector('[data-filter="robotics"]')?.click(), 400); } },
        { label: 'Filter: AI Projects', icon: 'fas fa-brain', action: () => { SPA.navigate('projects'); setTimeout(() => document.querySelector('[data-filter="ai"]')?.click(), 400); } },
        { label: 'Filter: IoT Projects', icon: 'fas fa-microchip', action: () => { SPA.navigate('projects'); setTimeout(() => document.querySelector('[data-filter="iot"]')?.click(), 400); } },
    ];
    let selected = 0;
    function open() { palette.classList.add('active'); input.value = ''; render(commands); input.focus(); selected = 0; }
    function close() { palette.classList.remove('active'); }
    function render(cmds) {
        results.innerHTML = cmds.map((c, i) => `<li data-idx="${i}" class="${i === selected ? 'selected' : ''}"><i class="${c.icon}"></i><span class="cmd-label">${c.label}</span></li>`).join('');
        results.querySelectorAll('li').forEach(li => { li.addEventListener('click', () => { cmds[+li.dataset.idx].action(); close(); }); });
    }
    addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); } if (e.key === 'Escape') close(); });
    document.getElementById('cmdPaletteBtn')?.addEventListener('click', open);
    palette.addEventListener('click', e => { if (e.target === palette) close(); });
    input.addEventListener('input', () => { const q = input.value.toLowerCase(); const f = commands.filter(c => c.label.toLowerCase().includes(q)); selected = 0; render(f); });
    input.addEventListener('keydown', e => {
        const items = results.querySelectorAll('li');
        if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(selected + 1, items.length - 1); items.forEach((l, i) => l.classList.toggle('selected', i === selected)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(selected - 1, 0); items.forEach((l, i) => l.classList.toggle('selected', i === selected)); }
        if (e.key === 'Enter') { items[selected]?.click(); }
    });
})();

/* ========== 13. VOICE NAVIGATION ========== */
const VoiceNav = {
    recognition: null,
    isListening: false,
    init() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        this.recognition = new SR();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.onresult = (e) => {
            const txt = Array.from(e.results).map(r => r[0].transcript).join('').toLowerCase();
            document.getElementById('voiceText').textContent = txt || 'Listening...';
            if (e.results[0].isFinal) this.processCommand(txt);
        };
        this.recognition.onend = () => this.stop();
        this.recognition.onerror = () => this.stop();
    },
    toggle() {
        if (!this.recognition) { this.init(); if (!this.recognition) return; }
        this.isListening ? this.stop() : this.start();
    },
    start() {
        this.isListening = true;
        document.getElementById('voiceBtn')?.classList.add('listening');
        document.getElementById('voiceGuideBtn')?.classList.add('listening');
        document.getElementById('voiceFeedback')?.classList.add('active');
        document.getElementById('voiceText').textContent = 'Listening...';
        try { this.recognition.start(); } catch (e) { }
    },
    stop() {
        this.isListening = false;
        document.getElementById('voiceBtn')?.classList.remove('listening');
        document.getElementById('voiceGuideBtn')?.classList.remove('listening');
        document.getElementById('voiceFeedback')?.classList.remove('active');
        try { this.recognition.stop(); } catch (e) { }
    },
    processCommand(txt) {
        const map = {
            home: ['home', 'go home', 'main', 'start', 'landing'],
            about: ['about', 'skills', 'about me', 'who', 'tell me about', 'skill'],
            experience: ['experience', 'work', 'career', 'roles', 'job', 'jobs', 'internship'],
            projects: ['project', 'projects', 'portfolio', 'builds', 'work samples', 'show projects'],
            education: ['education', 'degree', 'school', 'college', 'certificate', 'certification', 'workshop', 'achievement'],
            contact: ['contact', 'email', 'phone', 'connect', 'reach', 'touch', 'message', 'call'],
        };
        for (const [page, keys] of Object.entries(map)) {
            if (keys.some(k => txt.includes(k))) {
                this.stop(); setTimeout(() => SPA.navigate(page), 300); return;
            }
        }
        if (txt.includes('chat') || txt.includes('assistant') || txt.includes('help')) {
            this.stop(); document.getElementById('chatBox')?.classList.add('open');
        }
    }
};
document.getElementById('voiceBtn')?.addEventListener('click', () => VoiceNav.toggle());

/* ========== 14. VOICE GUIDE WIDGET ========== */
(function () {
    const btn = document.getElementById('voiceGuideBtn');
    const panel = document.getElementById('voiceGuidePanel');
    const startBtn = document.getElementById('voiceGuideStart');
    if (!btn) return;

    btn.addEventListener('click', () => {
        panel.classList.toggle('open');
    });

    startBtn?.addEventListener('click', () => {
        panel.classList.remove('open');
        VoiceNav.toggle();
    });

    // Close panel when clicking outside
    document.addEventListener('click', e => {
        if (!e.target.closest('.voice-guide')) {
            panel.classList.remove('open');
        }
    });
})();

/* ========== 15. AI CHAT ASSISTANT (via /api/chat proxy) ========== */
(function () {
    const toggle = document.getElementById('chatToggle');
    const box = document.getElementById('chatBox');
    const closeBtn = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');
    if (!toggle) return;

    toggle.addEventListener('click', () => box.classList.toggle('open'));
    closeBtn.addEventListener('click', () => box.classList.remove('open'));

    function addMsg(text, type) {
        const div = document.createElement('div');
        div.className = 'chat-msg ' + type;
        div.innerHTML = '<p>' + text + '</p>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // Call server-side proxy (Vercel serverless function)
    async function askAI(question) {
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });
            if (!res.ok) throw new Error('Server error');
            const data = await res.json();
            return data.reply;
        } catch (err) {
            console.warn('AI proxy unavailable, using fallback:', err.message);
            return null; // Fallback to rule-based
        }
    }

    // Built-in rule-based fallback (works locally without server)
    function ruleBased(q) {
        q = q.toLowerCase().trim();
        if (/who|about|yourself|febin|introduction|bio/.test(q))
            return "Febin T James is a <em>Junior Robotics & AI Engineer</em> at Qmark Technolabs, Kochi. AMR Team Lead with expertise in ROS 2, Nav2/SLAM, AI perception, and embedded systems. 🤖";
        if (/skill|tech|stack|know|language|framework/.test(q))
            return "Core skills: <em>ROS 2, Nav2, SLAM, YOLOv8, TensorFlow, OpenCV, Python, C++, Embedded C, Fusion 360, 3D Printing</em>. Also <em>React, Flutter, Angular, Django, Flask</em>, plus <em>Gazebo, Rviz, Jetson Nano, Raspberry Pi</em>.";
        if (/luq|delivery|amr|autonomous/.test(q))
            return "🚀 <em>LuQ</em> — production-grade autonomous delivery robot! ROS 2 Humble on RPi 4, Nav2 + SLAM, ESP32 firmware, AprilTag docking, ROSBridge web interface. Febin is <em>Team Lead</em>!";
        if (/project|portfolio|build/.test(q))
            return "Febin has <em>12+ projects</em>: LuQ robot, 6-Axis Robotic Arm, UAE AI Kiosk, Gesture Control, Human Detection, AI Chatbot, Emotion Detection, FlexiSense Glove, Smart Curtain, Street Light, Waste Segregation, Face Detection.";
        if (/experience|career|job|intern/.test(q))
            return "<em>5 roles</em>: Jr. Robotics Engineer at Qmark (current), Paid Intern, Graduate Intern, ML Intern at Keltron, Front-End Intern at NextDigital.";
        if (/education|college|degree|study/.test(q))
            return "🎓 B.Tech CS from Providence College (2021–2025), Plus Two 93%, SSLC 88%.";
        if (/contact|email|phone|reach|hire/.test(q))
            return "📧 <em>febintj007@gmail.com</em> | 📱 +91 7902871746 | LinkedIn: febin-t-james | GitHub: febintjames";
        if (/arm|robotic arm|6.axis/.test(q)) return "6-Axis Robotic Arm — 3D-printed, MicroROS on ESP32, ROS motion planning for pick-and-place.";
        if (/uae|avatar|kiosk/.test(q)) return "UAE National Day AI Avatar Kiosk — personalized AI videos from photos, deployed on AWS.";
        if (/gesture|hand|touchless/.test(q)) return "Touchless Gesture Control — MediaPipe + OpenCV for hand gesture commands. 🖐️";
        if (/emotion|infant|baby/.test(q)) return "Infant Emotion Detection — TensorFlow + Streamlit for facial/cry analysis.";
        if (/flexisense|glove|deaf/.test(q)) return "FlexiSense Smart Glove — ESP32 + flex sensors for deaf & speech impaired. 🧤";
        if (/ros|ros2|navigation|slam/.test(q)) return "Expert in <em>ROS 2 (Humble/Jazzy)</em>, <em>Nav2</em>, <em>SLAM Toolbox</em>. LuQ robot runs this stack!";
        if (/hello|hi|hey/.test(q)) return "Hey! 👋 Ask about <em>projects</em>, <em>skills</em>, <em>experience</em>, or anything!";
        if (/thank|thanks|cool|awesome/.test(q)) return "You're welcome! 😊 Try <em>Ctrl+K</em> or the 🎙️ voice button!";
        // Navigation via chat
        if (/show project|go to project|open project/.test(q)) { setTimeout(() => SPA.navigate('projects'), 500); return "Navigating to <em>Projects</em>... 🚀"; }
        if (/show.*about|go to about|show.*skill/.test(q)) { setTimeout(() => SPA.navigate('about'), 500); return "Navigating to <em>About & Skills</em>... ✨"; }
        if (/show.*experience|go to experience/.test(q)) { setTimeout(() => SPA.navigate('experience'), 500); return "Navigating to <em>Experience</em>... 💼"; }
        if (/show.*contact|go to contact/.test(q)) { setTimeout(() => SPA.navigate('contact'), 500); return "Navigating to <em>Contact</em>... 📧"; }
        if (/show.*education|go to education/.test(q)) { setTimeout(() => SPA.navigate('education'), 500); return "Navigating to <em>Education</em>... 🎓"; }
        return "Ask about Febin's <em>projects</em>, <em>skills</em>, <em>experience</em>, <em>education</em>, or <em>contact</em>. Try: <em>\"Tell me about LuQ\"</em>!";
    }

    // Handle navigation commands from AI response
    function handleNav(question) {
        const q = question.toLowerCase();
        if (/show project|go to project|navigate.*project/.test(q)) setTimeout(() => SPA.navigate('projects'), 500);
        else if (/show.*about|go to about|show.*skill/.test(q)) setTimeout(() => SPA.navigate('about'), 500);
        else if (/show.*experience|go to experience/.test(q)) setTimeout(() => SPA.navigate('experience'), 500);
        else if (/show.*contact|go to contact/.test(q)) setTimeout(() => SPA.navigate('contact'), 500);
        else if (/show.*education|go to education/.test(q)) setTimeout(() => SPA.navigate('education'), 500);
    }

    async function send() {
        const q = input.value.trim();
        if (!q) return;
        addMsg(q, 'user');
        input.value = '';

        const typing = document.createElement('div');
        typing.className = 'chat-msg bot';
        typing.innerHTML = '<p>⏳ Thinking...</p>';
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;

        // Try server proxy first, fallback to rules
        let response = await askAI(q);
        if (response) {
            handleNav(q);
        } else {
            response = ruleBased(q);
        }

        typing.remove();
        addMsg(response, 'bot');
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
})();

/* ========== 16. IMAGE CAROUSEL (project cards) ========== */
document.querySelectorAll('.project-img-carousel').forEach(carousel => {
    const imgs = carousel.querySelectorAll('.carousel-img');
    const dots = carousel.querySelectorAll('.dot');
    if (imgs.length < 2) return;
    let cur = 0;
    function show(idx) {
        imgs.forEach(i => i.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        imgs[idx].classList.add('active');
        dots[idx].classList.add('active');
        cur = idx;
    }
    dots.forEach(dot => {
        dot.addEventListener('click', () => show(+dot.dataset.idx));
    });
    setInterval(() => show((cur + 1) % imgs.length), 4000);
});

/* ========== 17. ROBOTIC SYSTEM ENGINE (ROS & TELEMETRY) ========== */
const ROSEngine = {
    logs: [
        { type: 'info', node: 'ros2', msg: 'Base system initialized.' },
        { type: 'info', node: 'nav2', msg: 'Map server online.' },
        { type: 'info', node: 'vision', msg: 'Inference engine active.' }
    ],
    isTerminalOpen: false,

    init() {
        this.initHUD();
        this.initTelemetry();
        this.initLidar();
        this.initSerialMonitor();
        this.initXRay();
        this.addLog('info', 'ros2', 'Robotic System Interface fully operational.');
    },

    initHUD() {
        const toggleBtn = document.getElementById('terminalToggle');
        const terminal = document.getElementById('rosTerminal');
        if (toggleBtn && terminal) {
            toggleBtn.addEventListener('click', () => {
                this.isTerminalOpen = !this.isTerminalOpen;
                terminal.classList.toggle('active', this.isTerminalOpen);
                toggleBtn.querySelector('span').textContent = this.isTerminalOpen ? 'Hide Logs' : 'ROS Terminal';
            });
        }
    },

    initSerialMonitor() {
        const body = document.getElementById('serialBody');
        if (!body) return;

        setInterval(() => {
            const types = ['odom', 'lidar', 'imu', 'hex'];
            const type = types[Math.floor(Math.random() * types.length)];
            let data = '';

            if (type === 'odom') data = `/odom: x=${(Math.random() * 2).toFixed(2)}, y=${(Math.random() - 0.5).toFixed(2)}`;
            else if (type === 'lidar') data = `/lidar: [${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ...]`;
            else if (type === 'imu') data = `/imu: q=[${(Math.random().toFixed(2))}, 0.00, 0.00, 1.00]`;
            else data = `0x${Math.floor(Math.random() * 16777215).toString(16).toUpperCase()} 0xAA 0xFF`;

            const line = document.createElement('div');
            line.className = 'serial-line';
            line.textContent = data;
            body.appendChild(line);
            if (body.children.length > 15) body.removeChild(body.children[0]);
        }, 400);
    },

    initXRay() {
        const btn = document.getElementById('xRayToggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.body.classList.toggle('x-ray-active');
            btn.classList.toggle('active');
            this.addLog('warn', 'system', `X-Ray mode ${document.body.classList.contains('x-ray-active') ? 'ENABLED' : 'DISABLED'}`);
        });
    },

    initTelemetry() {
        // Battery simulation
        let battery = 85;
        const bBar = document.querySelector('#hudBattery .hud-progress-bar');
        const bVal = document.querySelector('#hudBattery .hud-value');

        // CPU simulation
        const cBar = document.querySelector('#hudCPU .hud-progress-bar');
        const cVal = document.querySelector('#hudCPU .hud-value');

        // IMU simulation
        const imuYaw = document.getElementById('imuYaw');
        let yaw = 0;

        setInterval(() => {
            // Fluctuating CPU
            const cpu = Math.floor(Math.random() * 15) + 10;
            if (cBar) cBar.style.width = cpu + '%';
            if (cVal) cVal.textContent = cpu + '%';

            // Slowly draining battery (illusory)
            if (globalThis.fr % 1000 === 0) {
                battery = Math.max(0, battery - 0.1);
                if (bBar) bBar.style.width = battery + '%';
                if (bVal) bVal.textContent = Math.floor(battery) + '%';
            }

            // IMU Drift simulation
            yaw += (Math.random() - 0.5) * 0.5;
            if (imuYaw) imuYaw.textContent = yaw.toFixed(1) + '°';
        }, 1500);
    },

    initLidar() {
        const container = document.createElement('div');
        container.className = 'lidar-scan';
        container.innerHTML = '<div class="scan-line"></div>';
        document.body.appendChild(container);
    },

    addLog(type, node, msg) {
        const body = document.getElementById('terminalBody');
        if (!body) return;

        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        line.innerHTML = `<span style="color: var(--text-secondary); opacity: 0.6">[${time}]</span> [${type.toUpperCase()}] [${node}]: ${msg}`;

        body.appendChild(line);
        body.scrollTop = body.scrollHeight;

        // Limit log history
        if (body.children.length > 50) body.removeChild(body.children[0]);
    }
};

// Integrate with SPA and Actions
const originalNavigate = SPA.navigate;
SPA.navigate = function (page) {
    originalNavigate.call(SPA, page);
    ROSEngine.addLog('info', 'nav2', `Executing plan to goal: /page/${page}`);
    ROSEngine.addLog('info', 'ros2', `Activating node: page_manager_${page}`);
};

// Global fr variable shared with three.js if needed, or local
let fr = 0;
setInterval(() => fr++, 16);

// Start the engine
ROSEngine.init();

/* ========== INIT SPA ========== */
SPA.init();

