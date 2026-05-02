/**
 * 3D Background Canvas with Animated Elements
 */

(function() {
    'use strict';

    let scene, camera, renderer, particles;
    let animationId;
    let mouseX = 0, mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function init3DBackground() {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) return;

        // Scene setup
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0d1b2e, 1, 2000);

        // Camera setup
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        camera.position.z = 500;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio || 1);

        // Create particles
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color = new THREE.Color();

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Position
            positions[i3] = (Math.random() - 0.5) * 2000;
            positions[i3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i3 + 2] = (Math.random() - 0.5) * 2000;

            // Color - bright teal/blue palette for dark backgrounds
            const roll = Math.random();
            if (roll > 0.65) {
                color.setHex(0x4a9eff); // bright blue
            } else if (roll > 0.35) {
                color.setHex(0x2aafa0); // teal
            } else {
                color.setHex(0x1B4B8A); // brand navy (subtler)
            }

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Create geometric shapes floating
        const shapes = [];
        const shapeCount = 5;

        for (let i = 0; i < shapeCount; i++) {
            let geometry;
            const shapeType = Math.random();

            if (shapeType < 0.33) {
                geometry = new THREE.TetrahedronGeometry(30, 0);
            } else if (shapeType < 0.66) {
                geometry = new THREE.OctahedronGeometry(25, 0);
            } else {
                geometry = new THREE.IcosahedronGeometry(20, 0);
            }

            const material = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0x1B4B8A : 0x2aafa0,
                wireframe: true,
                transparent: true,
                opacity: 0.18
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000,
                (Math.random() - 0.5) * 1000
            );
            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            scene.add(mesh);
            shapes.push(mesh);
        }

        // Mouse movement
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onWindowResize);

        // Animate
        animate(shapes);
    }

    function onMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.01;
        mouseY = (event.clientY - windowHalfY) * 0.01;
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate(shapes) {
        animationId = requestAnimationFrame(() => animate(shapes));

        // Rotate particles
        if (particles) {
            particles.rotation.x += 0.0005;
            particles.rotation.y += 0.001;
        }

        // Animate shapes
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.005 + i * 0.001;
            shape.rotation.y += 0.008 + i * 0.001;
            shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.1;
        });

        // Camera movement based on mouse
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3DBackground);
    } else {
        init3DBackground();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onWindowResize);
    });

})();

