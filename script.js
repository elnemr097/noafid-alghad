// script.js
document.addEventListener('DOMContentLoaded', () => {
    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if(navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // 3. Scroll Reveal Animation setup
    const revealElements = document.querySelectorAll('.reveal, .reveal-top, .reveal-left');
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                
                // If it's a stats counter, trigger counting
                if (entry.target.classList.contains('stat-card')) {
                    const counter = entry.target.querySelector('.counter');
                    if(counter && !counter.classList.contains('counted')) {
                        updateCount(counter);
                        counter.classList.add('counted');
                    }
                }
                
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 4. Trigger initial reveal for items already in view (like hero section elements)
    setTimeout(() => {
        const topElements = document.querySelectorAll('#hero-placeholder .reveal-top');
        topElements.forEach(el => el.classList.add('active'));
    }, 100);

    // 5. Stat Counter Animation Logic
    const speed = 200; // The lower the slower
    function updateCount(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;

        // Lower inc to slow and higher to speed up
        const inc = target / speed;

        if (count < target) {
            // Add inc to count and output in counter
            counter.innerText = Math.ceil(count + inc);
            // Call function every ms
            setTimeout(() => updateCount(counter), 10);
        } else {
            counter.innerText = target;
        }
    }

    // 6. Language Switch Logic
    const langSwitch = document.getElementById('lang-switch');
    if(langSwitch) {
        langSwitch.addEventListener('click', (e) => {
            e.preventDefault();
            alert('النسخة الإنجليزية قيد الإنشاء وسيتم إطلاقها قريباً!');
        });
    }

    // 7. Interactive Globe Logic
    function initHeroGlobe() {
        const canvas = document.getElementById('hero-globe');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Colors based on React Component (Adjusted for Light Theme)
        const dotColor = "rgba(4, 30, 66, ALPHA)";
        const arcColor = "rgba(33, 150, 243, 0.6)";
        const markerColor = "rgba(33, 150, 243, 1)";
        const autoRotateSpeed = 0.002;

        const markers = [
            { lat: 30, lng: 0, label: "الرياض" },
            { lat: 10, lng: 90, label: "جدة" },
            { lat: -20, lng: 180, label: "الدمام" },
            { lat: 0, lng: -90, label: "مكة المكرمة" },
            { lat: 45, lng: 135, label: "المدينة" },
            { lat: -45, lng: -45, label: "تبوك" },
            { lat: -10, lng: 45, label: "أبها" },
            { lat: 20, lng: -135, label: "الطائف" },
            { lat: -30, lng: 270, label: "القصيم" }
        ];

        const connections = [
            { from: [30, 0], to: [10, 90] },
            { from: [30, 0], to: [-20, 180] },
            { from: [30, 0], to: [0, -90] },
            { from: [10, 90], to: [0, -90] },
            { from: [10, 90], to: [45, 135] },
            { from: [30, 0], to: [-45, -45] },
            { from: [-20, 180], to: [-10, 45] },
            { from: [30, 0], to: [20, -135] },
            { from: [10, 90], to: [-30, 270] },
            { from: [0, -90], to: [-45, -45] }
        ];

        let rotY = 0.4;
        let rotX = 0.3;
        let drag = { active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 };
        let time = 0;

        const dots = [];
        const numDots = 1200;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio;
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.cos(phi);
            const z = Math.sin(theta) * Math.sin(phi);
            dots.push([x, y, z]);
        }

        function latLngToXYZ(lat, lng, radius) {
            const phi = ((90 - lat) * Math.PI) / 180;
            const theta = ((lng + 180) * Math.PI) / 180;
            return [
                -(radius * Math.sin(phi) * Math.cos(theta)),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta),
            ];
        }

        function rotateYFunc(x, y, z, angle) {
            const cos = Math.cos(angle), sin = Math.sin(angle);
            return [x * cos + z * sin, y, -x * sin + z * cos];
        }

        function rotateXFunc(x, y, z, angle) {
            const cos = Math.cos(angle), sin = Math.sin(angle);
            return [x, y * cos - z * sin, y * sin + z * cos];
        }

        function project(x, y, z, cx, cy, fov) {
            const scale = fov / (fov + z);
            return [x * scale + cx, y * scale + cy, z];
        }

        function draw() {
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;

            if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
                canvas.width = w * dpr;
                canvas.height = h * dpr;
            }

            ctx.resetTransform();
            ctx.scale(dpr, dpr);
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(w, h) * 0.42;
            const fov = 600;

            if (!drag.active) rotY += autoRotateSpeed;
            time += 0.015;

            // Optional glow
            const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
            glowGrad.addColorStop(0, "rgba(33, 150, 243, 0.05)");
            glowGrad.addColorStop(1, "rgba(33, 150, 243, 0)");
            ctx.fillStyle = glowGrad;
            ctx.fillRect(0, 0, w, h);

            // Globe outline
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(4, 30, 66, 0.08)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Dots
            for (let i = 0; i < dots.length; i++) {
                let [x, y, z] = dots[i];
                x *= radius; y *= radius; z *= radius;

                let rotatedRaw = rotateXFunc(x, y, z, rotX);
                let rotatedRawY = rotateYFunc(rotatedRaw[0], rotatedRaw[1], rotatedRaw[2], rotY);
                x = rotatedRawY[0]; y = rotatedRawY[1]; z = rotatedRawY[2];

                if (z > 0) continue;

                const proj = project(x, y, z, cx, cy, fov);
                const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius));
                const dotSize = 1 + depthAlpha * 0.8;

                ctx.beginPath();
                ctx.arc(proj[0], proj[1], dotSize, 0, Math.PI * 2);
                ctx.fillStyle = dotColor.replace("ALPHA", depthAlpha.toFixed(2));
                ctx.fill();
            }

            // Arcs (Connections)
            for (const conn of connections) {
                let p1 = latLngToXYZ(conn.from[0], conn.from[1], radius);
                let p2 = latLngToXYZ(conn.to[0], conn.to[1], radius);

                p1 = rotateXFunc(p1[0], p1[1], p1[2], rotX);
                p1 = rotateYFunc(p1[0], p1[1], p1[2], rotY);
                p2 = rotateXFunc(p2[0], p2[1], p2[2], rotX);
                p2 = rotateYFunc(p2[0], p2[1], p2[2], rotY);

                if (p1[2] > radius * 0.3 && p2[2] > radius * 0.3) continue;

                const sx1 = project(p1[0], p1[1], p1[2], cx, cy, fov);
                const sx2 = project(p2[0], p2[1], p2[2], cx, cy, fov);

                const midX = (p1[0] + p2[0]) / 2;
                const midY = (p1[1] + p2[1]) / 2;
                const midZ = (p1[2] + p2[2]) / 2;
                const midLen = Math.sqrt(midX*midX + midY*midY + midZ*midZ);
                const arcHeight = radius * 1.25;
                const elevX = (midX / midLen) * arcHeight;
                const elevY = (midY / midLen) * arcHeight;
                const elevZ = (midZ / midLen) * arcHeight;

                const scm = project(elevX, elevY, elevZ, cx, cy, fov);

                ctx.beginPath();
                ctx.moveTo(sx1[0], sx1[1]);
                ctx.quadraticCurveTo(scm[0], scm[1], sx2[0], sx2[1]);
                ctx.strokeStyle = arcColor;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                const t = (Math.sin(time * 1.2 + conn.from[0] * 0.1) + 1) / 2;
                const tx = (1 - t)**2 * sx1[0] + 2 * (1 - t) * t * scm[0] + t**2 * sx2[0];
                const ty = (1 - t)**2 * sx1[1] + 2 * (1 - t) * t * scm[1] + t**2 * sx2[1];

                ctx.beginPath();
                ctx.arc(tx, ty, 2, 0, Math.PI * 2);
                ctx.fillStyle = markerColor;
                ctx.fill();
            }

            // Markers
            for (const marker of markers) {
                let m = latLngToXYZ(marker.lat, marker.lng, radius);
                m = rotateXFunc(m[0], m[1], m[2], rotX);
                m = rotateYFunc(m[0], m[1], m[2], rotY);

                if (m[2] > radius * 0.1) continue;
                const proj = project(m[0], m[1], m[2], cx, cy, fov);

                const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(proj[0], proj[1], 4 + pulse * 4, 0, Math.PI * 2);
                ctx.strokeStyle = markerColor.replace("1)", `${0.2 + pulse * 0.15})`);
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(proj[0], proj[1], 2.5, 0, Math.PI * 2);
                ctx.fillStyle = markerColor;
                ctx.fill();

                if (marker.label) {
                    ctx.font = "bold 22px 'Tajawal', sans-serif";
                    ctx.fillStyle = markerColor;
                    ctx.fillText(marker.label, proj[0] + 12, proj[1] + 6);
                }
            }

            requestAnimationFrame(draw);
        }

        canvas.addEventListener('pointerdown', (e) => {
            drag.active = true;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.startRotY = rotY;
            drag.startRotX = rotX;
            canvas.setPointerCapture(e.pointerId);
        });
        
        canvas.addEventListener('pointermove', (e) => {
            if (!drag.active) return;
            rotY = drag.startRotY + (e.clientX - drag.startX) * 0.005;
            rotX = Math.max(-1, Math.min(1, drag.startRotX + (e.clientY - drag.startY) * 0.005));
        });
        
        canvas.addEventListener('pointerup', () => drag.active = false);

        requestAnimationFrame(draw);
    }
    
    initHeroGlobe();
});
