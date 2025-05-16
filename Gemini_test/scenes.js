// Scene manager for 3D backgrounds
let renderer, camera, scene, controls;
let currentScene = null;
let sceneObjects = {};
let clock = new THREE.Clock();
let mixer;
let mixers = [];

// Initialize Three.js scene
function initThreeJS() {
  try {
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.getElementById("scene-container").appendChild(renderer.domElement);

    // Create camera
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);

    // Basic scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 10, 50);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Window resize handler
    window.addEventListener("resize", onWindowResize);

    // Create scenes
    createScenes();

    // Start animation loop
    animate();

    console.log("Three.js scene initialized successfully");
  } catch (error) {
    console.error("Error initializing Three.js scene:", error);
    // Display error message on the page
    const errorDiv = document.createElement("div");
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "50%";
    errorDiv.style.left = "50%";
    errorDiv.style.transform = "translate(-50%, -50%)";
    errorDiv.style.background = "rgba(0, 0, 0, 0.8)";
    errorDiv.style.color = "#fff";
    errorDiv.style.padding = "20px";
    errorDiv.style.zIndex = "9999";
    errorDiv.textContent = "Error initializing 3D scene: " + error.message;
    document.body.appendChild(errorDiv);
  }
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update all mixers
  mixers.forEach((mixer) => {
    if (mixer) mixer.update(delta);
  });

  // Update current scene
  if (currentScene && currentScene.update) {
    currentScene.update(delta);
  }

  renderer.render(scene, camera);
}

// Clear the current scene
function clearScene() {
  // Store lights
  const lights = [];

  // Find all lights to preserve
  scene.children.forEach((child) => {
    if (child.isLight) {
      lights.push(child);
    }
  });

  // Clear the scene
  scene.clear();

  // Re-add all lights
  lights.forEach((light) => {
    scene.add(light);
  });

  // Reset mixers
  mixers = [];
}

// Create all scene objects
function createScenes() {
  // Create scenes for each section
  createKissScene();
  createMealsScene();
  createBedScene();
  createLifetimeScene();
  createNoMoreScene();
  createNewExcitingScene();
  createGrewUpScene();
  createShatterScene();
  createGlitterScene();
  createBeautifulScene();
  createMagicScene();
}

// Scene for "One more kiss"
function createKissScene() {
  const scene = new THREE.Group();

  // 1. Soft sunset background
  const sunsetGeometry = new THREE.PlaneGeometry(100, 50);
  const sunsetMaterial = new THREE.MeshBasicMaterial({
    color: 0xff9966,
    transparent: true,
    opacity: 0.7,
  });
  const sunset = new THREE.Mesh(sunsetGeometry, sunsetMaterial);
  sunset.position.z = -40;
  sunset.position.y = 10;
  scene.add(sunset);

  // 2. Floating rose petals
  for (let i = 0; i < 30; i++) {
    const petalGeometry = new THREE.PlaneGeometry(0.5, 0.5);
    const petalMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6666,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.set(
      Math.random() * 30 - 15,
      Math.random() * 15 - 5,
      Math.random() * 10 - 10
    );
    petal.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    scene.add(petal);
  }

  // 3. Fog
  const fogParticles = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    const fogGeometry = new THREE.SphereGeometry(1, 16, 16);
    const fogMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
    });
    const fogParticle = new THREE.Mesh(fogGeometry, fogMaterial);
    fogParticle.position.set(
      Math.random() * 40 - 20,
      Math.random() * 10 - 5,
      Math.random() * 30 - 15
    );
    fogParticle.scale.set(
      Math.random() * 2 + 1,
      Math.random() * 2 + 1,
      Math.random() * 2 + 1
    );
    fogParticles.add(fogParticle);
  }
  scene.add(fogParticles);

  // 4. Silhouettes of couple
  const coupleGeometry = new THREE.PlaneGeometry(8, 5);
  const coupleMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const couple = new THREE.Mesh(coupleGeometry, coupleMaterial);
  couple.position.set(0, 0, -20);
  scene.add(couple);

  // 5. Heart animation
  const heartGeometry = new THREE.CircleGeometry(1, 32);
  const heartMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0066,
    transparent: true,
    opacity: 0.5,
  });
  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heart.position.set(0, 0, -5);
  scene.add(heart);

  // Update function
  scene.update = function (delta) {
    // Animate rose petals
    scene.children.forEach((child, i) => {
      if (
        child.geometry &&
        child.geometry.type === "PlaneGeometry" &&
        child.geometry.parameters.width === 0.5
      ) {
        child.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
        child.rotation.z += 0.005;
      }
    });

    // Animate fog
    fogParticles.children.forEach((particle, i) => {
      particle.position.x += Math.sin(Date.now() * 0.0005 + i) * 0.02;
      particle.position.y += Math.cos(Date.now() * 0.0005 + i * 2) * 0.01;
    });

    // Animate heart
    heart.scale.x = 1 + Math.sin(Date.now() * 0.002) * 0.1;
    heart.scale.y = 1 + Math.sin(Date.now() * 0.002) * 0.1;
    heart.material.opacity = 0.3 + Math.sin(Date.now() * 0.002) * 0.2;
  };

  sceneObjects.kiss = scene;
}

// Scene for "One more breakfast, lunch, dinner"
function createMealsScene() {
  const scene = new THREE.Group();

  // 1. Cozy room background
  const roomGeometry = new THREE.BoxGeometry(40, 20, 40);
  const roomMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0d0c0,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.5,
  });
  const room = new THREE.Mesh(roomGeometry, roomMaterial);
  room.position.set(0, 0, 0);
  scene.add(room);

  // 2. Dining table
  const tableGeometry = new THREE.BoxGeometry(10, 0.5, 6);
  const tableMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    shininess: 100,
  });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.set(0, -2, 0);
  table.receiveShadow = true;
  scene.add(table);

  // 3. Plates
  for (let i = 0; i < 3; i++) {
    const plateGeometry = new THREE.CircleGeometry(1, 32);
    const plateMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const plate = new THREE.Mesh(plateGeometry, plateMaterial);
    plate.position.set(i * 3 - 3, -1.7, 0);
    plate.rotation.x = -Math.PI / 2;
    scene.add(plate);
  }

  // 4. Coffee mug with steam
  const mugGeometry = new THREE.CylinderGeometry(0.5, 0.4, 0.8, 32);
  const mugMaterial = new THREE.MeshBasicMaterial({
    color: 0xb22222,
  });
  const mug = new THREE.Mesh(mugGeometry, mugMaterial);
  mug.position.set(3, -1.3, 2);
  scene.add(mug);

  // Steam particles
  const steamParticles = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    const steamGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const steamMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
    });
    const steamParticle = new THREE.Mesh(steamGeometry, steamMaterial);
    steamParticle.position.set(
      3 + Math.random() * 0.2 - 0.1,
      -1 + i * 0.2,
      2 + Math.random() * 0.2 - 0.1
    );
    steamParticle.userData = {
      originalY: steamParticle.position.y,
      speed: Math.random() * 0.01 + 0.01,
    };
    steamParticles.add(steamParticle);
  }
  scene.add(steamParticles);

  // 5. Warm lighting
  const warmLight = new THREE.PointLight(0xffcc88, 2, 30);
  warmLight.position.set(5, 10, 5);
  warmLight.castShadow = true;
  scene.add(warmLight);

  // Update function
  scene.update = function (delta) {
    // Animate steam
    steamParticles.children.forEach((particle) => {
      particle.position.y += particle.userData.speed;
      particle.material.opacity -= 0.005;

      if (particle.material.opacity <= 0) {
        particle.position.y = particle.userData.originalY;
        particle.material.opacity = 0.4;
      }
    });

    // Animate warm light
    warmLight.intensity = 1.5 + Math.sin(Date.now() * 0.001) * 0.5;
  };

  sceneObjects.meals = scene;
}

// Scene for "Lie in bed one more time"
function createBedScene() {
  const scene = new THREE.Group();

  // 1. Create a bedroom with soft lighting
  // Bed frame
  const bedFrameGeometry = new THREE.BoxGeometry(10, 1, 15);
  const bedFrameMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b4513,
    shininess: 30,
  });
  const bedFrame = new THREE.Mesh(bedFrameGeometry, bedFrameMaterial);
  bedFrame.position.y = -3;
  scene.add(bedFrame);

  // Mattress
  const mattressGeometry = new THREE.BoxGeometry(9.5, 1, 14.5);
  const mattressMaterial = new THREE.MeshPhongMaterial({
    color: 0xf5f5dc,
    shininess: 10,
  });
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.y = -2;
  scene.add(mattress);

  // Pillows
  for (let i = 0; i < 2; i++) {
    const pillowGeometry = new THREE.BoxGeometry(3, 0.8, 2);
    const pillowMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      shininess: 5,
    });
    const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
    pillow.position.set(i === 0 ? -3 : 3, -1.5, 6);
    scene.add(pillow);
  }

  // Blanket
  const blanketGeometry = new THREE.BoxGeometry(9, 0.5, 10);
  const blanketMaterial = new THREE.MeshPhongMaterial({
    color: 0x6080a0,
    shininess: 10,
  });
  const blanket = new THREE.Mesh(blanketGeometry, blanketMaterial);
  blanket.position.set(0, -1.7, -1);
  scene.add(blanket);

  // 2. Room walls
  const wallsGeometry = new THREE.BoxGeometry(30, 20, 30);
  const wallsMaterial = new THREE.MeshPhongMaterial({
    color: 0xe8e8e8,
    side: THREE.BackSide,
  });
  const walls = new THREE.Mesh(wallsGeometry, wallsMaterial);
  walls.position.y = 5;
  scene.add(walls);

  // 3. Window with moonlight
  const windowGeometry = new THREE.PlaneGeometry(8, 6);
  const windowMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.5,
  });
  const windowPane = new THREE.Mesh(windowGeometry, windowMaterial);
  windowPane.position.set(0, 5, -14.9);
  scene.add(windowPane);

  // Window frame
  const frameGeometry = new THREE.BoxGeometry(8.5, 6.5, 0.5);
  const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
  const windowFrame = new THREE.Mesh(frameGeometry, frameMaterial);
  windowFrame.position.set(0, 5, -14.5);
  scene.add(windowFrame);

  // Moon light
  const moonLight = new THREE.PointLight(0xb0c4de, 1, 40);
  moonLight.position.set(0, 10, -20);
  scene.add(moonLight);

  // 4. Dream particles
  const dreamParticles = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.5,
    });
    const particle = new THREE.Mesh(geometry, material);

    // Position above the bed
    particle.position.set(
      (Math.random() - 0.5) * 8,
      Math.random() * 5,
      (Math.random() - 0.5) * 12
    );

    particle.userData = {
      speed: Math.random() * 0.2 + 0.1,
      rotationSpeed: Math.random() * 0.02,
      opacity: material.opacity,
    };

    dreamParticles.add(particle);
  }
  scene.add(dreamParticles);

  // 5. Ambient lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Soft bedside lamp
  const lampLight = new THREE.PointLight(0xffcc88, 0.8, 15);
  lampLight.position.set(-7, 0, 5);
  scene.add(lampLight);

  // Update function
  scene.update = function (delta) {
    const time = Date.now() * 0.001;

    // Animate dream particles
    dreamParticles.children.forEach((particle) => {
      const { speed, rotationSpeed, opacity } = particle.userData;

      // Drift upward
      particle.position.y += speed * delta;

      // Rotate
      particle.rotation.x += rotationSpeed;
      particle.rotation.y += rotationSpeed * 0.7;

      // Reset when too high
      if (particle.position.y > 8) {
        particle.position.y = -1;
        particle.material.opacity = opacity;
      } else {
        // Fade out as they rise
        particle.material.opacity = opacity * (1 - particle.position.y / 10);
      }

      // Slight horizontal drift
      particle.position.x += Math.sin(time + particle.position.z) * 0.01;
      particle.position.z += Math.cos(time + particle.position.x) * 0.01;
    });

    // Animate moonlight
    moonLight.intensity = 0.8 + 0.2 * Math.sin(time * 0.5);

    // Subtle breathing movement for the blanket
    blanket.position.y = -1.7 + 0.1 * Math.sin(time * 0.5);
    blanket.rotation.x = Math.sin(time * 0.2) * 0.05;

    // Window glow effect
    windowPane.material.opacity = 0.4 + 0.2 * Math.sin(time * 0.3);
  };

  sceneObjects.bed = scene;
}

// Function to switch to a specific scene
function switchToScene(sceneName) {
  clearScene();

  if (sceneObjects[sceneName]) {
    currentScene = sceneObjects[sceneName];
    scene.add(currentScene);

    // Reset camera position for this scene
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);
  }
}

// Create the remaining scene functions (simplified for now)
function createLifetimeScene() {
  const scene = new THREE.Group();

  // 1. Time spiral effect
  const spiralGroup = new THREE.Group();
  for (let i = 0; i < 200; i++) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / 200, 0.8, 0.5),
      transparent: true,
      opacity: 0.7,
    });
    const box = new THREE.Mesh(geometry, material);

    // Position in a spiral
    const angle = i * 0.1;
    const radius = 0.1 * i;
    box.position.x = Math.cos(angle) * radius;
    box.position.z = Math.sin(angle) * radius;
    box.position.y = i * 0.05 - 10;

    box.userData = {
      initialAngle: angle,
      radius: radius,
      speed: 0.05 + Math.random() * 0.05,
      verticalSpeed: 0.02 + Math.random() * 0.01,
    };

    spiralGroup.add(box);
  }
  scene.add(spiralGroup);

  // 2. Clock face
  const clockRadius = 5;
  const clockGeometry = new THREE.CircleGeometry(clockRadius, 64);
  const clockMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
  });
  const clock = new THREE.Mesh(clockGeometry, clockMaterial);
  clock.rotation.x = Math.PI / 2;
  clock.position.y = -5;
  scene.add(clock);

  // Clock hands
  const hourHandGeometry = new THREE.PlaneGeometry(0.3, clockRadius * 0.5);
  const minuteHandGeometry = new THREE.PlaneGeometry(0.2, clockRadius * 0.7);
  const secondHandGeometry = new THREE.PlaneGeometry(0.1, clockRadius * 0.8);

  const hourHandMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    side: THREE.DoubleSide,
  });
  const minuteHandMaterial = new THREE.MeshBasicMaterial({
    color: 0xf3a183,
    side: THREE.DoubleSide,
  });
  const secondHandMaterial = new THREE.MeshBasicMaterial({
    color: 0x8a2be2,
    side: THREE.DoubleSide,
  });

  const hourHand = new THREE.Mesh(hourHandGeometry, hourHandMaterial);
  const minuteHand = new THREE.Mesh(minuteHandGeometry, minuteHandMaterial);
  const secondHand = new THREE.Mesh(secondHandGeometry, secondHandMaterial);

  hourHand.position.set(0, -4.75, 0);
  minuteHand.position.set(0, -4.75, 0);
  secondHand.position.set(0, -4.75, 0);

  hourHand.rotation.x = Math.PI / 2;
  minuteHand.rotation.x = Math.PI / 2;
  secondHand.rotation.x = Math.PI / 2;

  const clockHands = new THREE.Group();
  clockHands.add(hourHand);
  clockHands.add(minuteHand);
  clockHands.add(secondHand);
  scene.add(clockHands);

  // Update function
  scene.update = function (delta) {
    // Animate spiral
    spiralGroup.children.forEach((box, i) => {
      const { initialAngle, radius, speed, verticalSpeed } = box.userData;

      // Rotate around y-axis
      const currentTime = Date.now() * 0.001;
      const angle = initialAngle + currentTime * speed;

      box.position.x = Math.cos(angle) * radius;
      box.position.z = Math.sin(angle) * radius;

      // Move up and reset
      box.position.y += verticalSpeed;
      if (box.position.y > 10) {
        box.position.y = -10;
      }

      // Rotate the box
      box.rotation.x += 0.01;
      box.rotation.y += 0.01;
    });

    // Animate clock hands
    const time = new Date();
    const hours = time.getHours() % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    hourHand.rotation.z = -(
      (hours * Math.PI) / 6 +
      (minutes * Math.PI) / (6 * 60)
    );
    minuteHand.rotation.z = -((minutes * Math.PI) / 30);
    secondHand.rotation.z = -((seconds * Math.PI) / 30);
  };

  sceneObjects.lifetime = scene;
}

function createNoMoreScene() {
  const scene = new THREE.Group();

  // 1. Dark void with fading particles
  const particles = new THREE.Group();
  for (let i = 0; i < 200; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: Math.random() * 0.5,
    });
    const particle = new THREE.Mesh(geometry, material);

    // Position randomly in a sphere
    const radius = 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
    particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
    particle.position.z = radius * Math.cos(phi);

    particle.userData = {
      initialOpacity: particle.material.opacity,
      fadeSpeed: 0.2 + Math.random() * 0.3,
      fadeDirection: -1,
    };

    particles.add(particle);
  }
  scene.add(particles);

  // 2. "No More" text using a simple fallback instead of TextGeometry
  const textMesh = new THREE.Group();

  // Create "NO" text with simple shapes
  const noTextGroup = new THREE.Group();

  // Letter N
  const nLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  nLeft.position.x = -4;

  const nDiagonal = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2.8, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  nDiagonal.position.x = -3;
  nDiagonal.rotation.z = Math.PI / 4;

  const nRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  nRight.position.x = -2;

  noTextGroup.add(nLeft);
  noTextGroup.add(nDiagonal);
  noTextGroup.add(nRight);

  // Letter O
  const oRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.3, 16, 32),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  oRing.position.x = 0;
  oRing.rotation.x = Math.PI / 2;

  noTextGroup.add(oRing);
  textMesh.add(noTextGroup);

  // Create "MORE" text with simple shapes
  const moreTextGroup = new THREE.Group();
  moreTextGroup.position.x = 4;

  // Letter M
  const mLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  mLeft.position.x = -2;

  const mMiddleLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  mMiddleLeft.position.x = -1.5;
  mMiddleLeft.position.y = 0.4;
  mMiddleLeft.rotation.z = -Math.PI / 4;

  const mMiddleRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  mMiddleRight.position.x = -0.5;
  mMiddleRight.position.y = 0.4;
  mMiddleRight.rotation.z = Math.PI / 4;

  const mRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  mRight.position.x = 0;

  moreTextGroup.add(mLeft);
  moreTextGroup.add(mMiddleLeft);
  moreTextGroup.add(mMiddleRight);
  moreTextGroup.add(mRight);

  // Letter O
  const oMoreRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.3, 16, 32),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  oMoreRing.position.x = 1.5;
  oMoreRing.rotation.x = Math.PI / 2;
  moreTextGroup.add(oMoreRing);

  // Letter R
  const rLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  rLeft.position.x = 3;

  const rTop = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.3, 16, 8, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  rTop.position.x = 3.5;
  rTop.position.y = 0.5;

  const rDiagonal = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  rDiagonal.position.x = 3.7;
  rDiagonal.position.y = -0.5;
  rDiagonal.rotation.z = -Math.PI / 6;

  moreTextGroup.add(rLeft);
  moreTextGroup.add(rTop);
  moreTextGroup.add(rDiagonal);

  // Letter E
  const eLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 2, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  eLeft.position.x = 5;

  const eTop = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  eTop.position.x = 5.5;
  eTop.position.y = 0.75;

  const eMiddle = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  eMiddle.position.x = 5.4;
  eMiddle.position.y = 0;

  const eBottom = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 0.5),
    new THREE.MeshBasicMaterial({ color: 0xff6b6b })
  );
  eBottom.position.x = 5.5;
  eBottom.position.y = -0.75;

  moreTextGroup.add(eLeft);
  moreTextGroup.add(eTop);
  moreTextGroup.add(eMiddle);
  moreTextGroup.add(eBottom);

  textMesh.add(moreTextGroup);
  textMesh.position.z = -5;

  // Make all materials in textMesh transparent
  textMesh.traverse(function (child) {
    if (child.material) {
      child.material.transparent = true;
      child.material.opacity = 0.8;
    }
  });

  scene.add(textMesh);

  // 3. Shrinking ring
  const ringGeometry = new THREE.RingGeometry(9.5, 10, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Update function
  scene.update = function (delta) {
    // Animate particles - fading in and out
    particles.children.forEach((particle) => {
      const { initialOpacity, fadeSpeed, fadeDirection } = particle.userData;

      particle.material.opacity += fadeDirection * fadeSpeed * delta;

      if (particle.material.opacity <= 0) {
        particle.material.opacity = 0;
        particle.userData.fadeDirection = 1;
      } else if (particle.material.opacity >= initialOpacity) {
        particle.material.opacity = initialOpacity;
        particle.userData.fadeDirection = -1;
      }

      // Slow movement toward center
      particle.position.multiplyScalar(0.998);
    });

    // Animate ring - shrinking
    const scale = 1 - Math.sin(Date.now() * 0.001) * 0.3;
    ring.scale.set(scale, scale, scale);

    // Rotate the ring
    ring.rotation.z += delta * 0.2;

    // Animate text
    if (textMesh) {
      const time = Date.now() * 0.001;

      // Pulse opacity
      textMesh.traverse(function (child) {
        if (child.material) {
          child.material.opacity = 0.5 + 0.3 * Math.sin(time * 0.8);
        }
      });

      // Gentle floating motion
      textMesh.position.y = Math.sin(time * 0.5) * 0.5;

      // Rotate slightly
      textMesh.rotation.y = Math.sin(time * 0.2) * 0.1;
    }
  };

  sceneObjects.noMore = scene;
}

function createNewExcitingScene() {
  const scene = new THREE.Group();

  // 1. Colorful bursting particles
  const burstGroup = new THREE.Group();
  const colors = [0xff6b6b, 0xf3a183, 0x8a2be2, 0x00ffcc, 0xffcc00];

  for (let i = 0; i < 100; i++) {
    const geometry = new THREE.SphereGeometry(0.2, 12, 12);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.7,
    });
    const sphere = new THREE.Mesh(geometry, material);

    // Random position in a sphere
    const radius = Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    sphere.position.x = radius * Math.sin(phi) * Math.cos(theta);
    sphere.position.y = radius * Math.sin(phi) * Math.sin(theta);
    sphere.position.z = radius * Math.cos(phi);

    sphere.userData = {
      initialRadius: radius,
      theta: theta,
      phi: phi,
      pulseSpeed: 0.5 + Math.random() * 0.5,
      rotSpeed: 0.1 + Math.random() * 0.2,
    };

    burstGroup.add(sphere);
  }
  scene.add(burstGroup);

  // 2. Horizon plane with grid
  const gridGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
  const gridMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });
  const grid = new THREE.Mesh(gridGeometry, gridMaterial);
  grid.rotation.x = -Math.PI / 2;
  grid.position.y = -10;
  scene.add(grid);

  // 3. Light beams
  const beamGroup = new THREE.Group();

  for (let i = 0; i < 8; i++) {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.5, 20, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.3,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);

    const angle = (i / 8) * Math.PI * 2;
    beam.position.x = Math.cos(angle) * 15;
    beam.position.z = Math.sin(angle) * 15;
    beam.position.y = 0;

    beam.rotation.x = Math.PI / 2;
    beam.userData = {
      angle: angle,
      pulseSpeed: 0.5 + Math.random() * 0.5,
    };

    beamGroup.add(beam);
  }
  scene.add(beamGroup);

  // Update function
  scene.update = function (delta) {
    // Animate burst particles
    const time = Date.now() * 0.001;

    burstGroup.children.forEach((sphere) => {
      const { initialRadius, theta, phi, pulseSpeed, rotSpeed } =
        sphere.userData;

      // Breathe in and out
      const pulseRadius =
        initialRadius * (1 + 0.2 * Math.sin(time * pulseSpeed));

      // Rotate around center
      const rotationOffset = time * rotSpeed;
      const newTheta = theta + rotationOffset;

      sphere.position.x = pulseRadius * Math.sin(phi) * Math.cos(newTheta);
      sphere.position.y = pulseRadius * Math.sin(phi) * Math.sin(newTheta);
      sphere.position.z = pulseRadius * Math.cos(phi);

      // Scale pulse
      const scale = 1 + 0.2 * Math.sin(time * pulseSpeed * 2);
      sphere.scale.set(scale, scale, scale);
    });

    // Animate grid
    grid.material.opacity = 0.1 + 0.1 * Math.sin(time * 0.5);

    // Animate light beams
    beamGroup.children.forEach((beam) => {
      const { angle, pulseSpeed } = beam.userData;

      // Pulse opacity
      beam.material.opacity = 0.2 + 0.2 * Math.sin(time * pulseSpeed);

      // Rotate beams
      const newAngle = angle + time * 0.1;
      beam.position.x = Math.cos(newAngle) * 15;
      beam.position.z = Math.sin(newAngle) * 15;

      // Look at center
      beam.lookAt(0, 0, 0);
      beam.rotation.x += Math.PI / 2;
    });
  };

  sceneObjects.newExciting = scene;
}

function createGrewUpScene() {
  const scene = new THREE.Group();

  // 1. Two trees - one small, one large representing growth
  // Small tree
  const smallTreeTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
    new THREE.MeshBasicMaterial({ color: 0x8b4513 })
  );
  smallTreeTrunk.position.set(-5, -2, 0);

  const smallTreeTop = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 8),
    new THREE.MeshBasicMaterial({ color: 0x228b22 })
  );
  smallTreeTop.position.set(-5, 0, 0);

  const smallTree = new THREE.Group();
  smallTree.add(smallTreeTrunk);
  smallTree.add(smallTreeTop);
  scene.add(smallTree);

  // Large tree
  const largeTreeTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 6, 8),
    new THREE.MeshBasicMaterial({ color: 0x8b4513 })
  );
  largeTreeTrunk.position.set(5, 0, 0);

  const largeTreeTop = new THREE.Mesh(
    new THREE.ConeGeometry(3, 6, 8),
    new THREE.MeshBasicMaterial({ color: 0x228b22 })
  );
  largeTreeTop.position.set(5, 6, 0);

  const largeTree = new THREE.Group();
  largeTree.add(largeTreeTrunk);
  largeTree.add(largeTreeTop);
  scene.add(largeTree);

  // 2. Path between trees
  const pathGeometry = new THREE.PlaneGeometry(12, 1);
  const pathMaterial = new THREE.MeshBasicMaterial({
    color: 0xd2b48c,
    side: THREE.DoubleSide,
  });
  const path = new THREE.Mesh(pathGeometry, pathMaterial);
  path.rotation.x = Math.PI / 2;
  path.position.y = -3;
  scene.add(path);

  // 3. Floating age numbers
  const ageGroup = new THREE.Group();

  // Create age markers from child to adult
  const ages = [5, 10, 15, 20, 25, 30];
  ages.forEach((age, index) => {
    // Use a circle as a simple placeholder for text
    const ageMarker = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 16),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      })
    );

    // Position along the path
    const t = index / (ages.length - 1); // 0 to 1
    ageMarker.position.x = -5 + t * 10; // from small tree to large tree
    ageMarker.position.y = 3 + t * 5; // rising up

    ageMarker.userData = {
      initialY: ageMarker.position.y,
      floatSpeed: 0.5 + Math.random() * 0.5,
      floatAmount: 0.2 + Math.random() * 0.3,
    };

    ageGroup.add(ageMarker);
  });
  scene.add(ageGroup);

  // 4. Ground
  const groundGeometry = new THREE.CircleGeometry(15, 32);
  const groundMaterial = new THREE.MeshBasicMaterial({
    color: 0x7cfc00,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -3;
  scene.add(ground);

  // 5. Sky backdrop
  const skyGeometry = new THREE.SphereGeometry(30, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87ceeb,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.2,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // Update function
  scene.update = function (delta) {
    // Gently sway the trees
    const time = Date.now() * 0.001;

    smallTree.rotation.z = Math.sin(time * 0.5) * 0.05;
    largeTree.rotation.z = Math.sin(time * 0.3) * 0.03;

    // Float the age markers
    ageGroup.children.forEach((marker) => {
      const { initialY, floatSpeed, floatAmount } = marker.userData;
      marker.position.y = initialY + Math.sin(time * floatSpeed) * floatAmount;

      // Also rotate them
      marker.rotation.y += delta * 0.5;
    });

    // Animate sky color
    const hue = (time * 0.02) % 1;
    skyMaterial.color.setHSL(hue, 0.5, 0.7);
  };

  sceneObjects.grewUp = scene;
}

function createShatterScene() {
  const scene = new THREE.Group();

  // 1. Heart that shatters into fragments
  const heartGroup = new THREE.Group();

  // Base heart shape (simplified as a sphere for now)
  const heartGeometry = new THREE.SphereGeometry(3, 16, 16);
  const heartMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  });
  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heartGroup.add(heart);

  // Create fragments
  const fragmentGroup = new THREE.Group();
  for (let i = 0; i < 50; i++) {
    const fragGeometry = new THREE.TetrahedronGeometry(0.5, 0);
    const fragMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b6b,
      transparent: true,
      opacity: 0.8,
    });
    const fragment = new THREE.Mesh(fragGeometry, fragMaterial);

    // Position initially near the heart center
    fragment.position.set(
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.2
    );

    // Set velocity for explosion animation
    fragment.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      ),
      exploded: false,
    };

    fragmentGroup.add(fragment);
  }
  heartGroup.add(fragmentGroup);
  scene.add(heartGroup);

  // 2. Dark emotional background
  const bgGeometry = new THREE.SphereGeometry(30, 32, 32);
  const bgMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8,
  });
  const background = new THREE.Mesh(bgGeometry, bgMaterial);
  scene.add(background);

  // 3. Shockwave ring
  const ringGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6b6b,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.0,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.scale.set(0.1, 0.1, 0.1);
  scene.add(ring);

  // 4. Add lighting for dramatic effect
  const pointLight = new THREE.PointLight(0xff6b6b, 2, 20);
  pointLight.position.set(0, 0, 5);
  scene.add(pointLight);

  // State tracking
  scene.userData = {
    exploded: false,
    explosionTime: 0,
    heartBeatPulse: 0,
  };

  // Update function
  scene.update = function (delta) {
    const time = Date.now() * 0.001;
    const state = scene.userData;

    if (!state.exploded) {
      // Heart beating animation before explosion
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      heart.scale.set(pulse, pulse, pulse);

      // Increment beat pulse
      state.heartBeatPulse += delta;

      // Trigger explosion after a few pulses
      if (state.heartBeatPulse > 3) {
        state.exploded = true;
        state.explosionTime = time;

        // Make heart invisible
        heart.visible = false;

        // Activate shockwave
        ring.material.opacity = 0.8;
      }
    } else {
      // Post-explosion animation
      const timeSinceExplosion = time - state.explosionTime;

      // Animate fragments flying outward
      fragmentGroup.children.forEach((fragment) => {
        // Update position based on velocity
        fragment.position.x += fragment.userData.velocity.x * delta;
        fragment.position.y += fragment.userData.velocity.y * delta;
        fragment.position.z += fragment.userData.velocity.z * delta;

        // Add rotation
        fragment.rotation.x += fragment.userData.rotationSpeed.x * delta;
        fragment.rotation.y += fragment.userData.rotationSpeed.y * delta;
        fragment.rotation.z += fragment.userData.rotationSpeed.z * delta;

        // Fade out
        fragment.material.opacity = Math.max(0, 0.8 - timeSinceExplosion * 0.2);
      });

      // Animate shockwave ring
      const ringScale = Math.min(20, timeSinceExplosion * 10);
      ring.scale.set(ringScale, ringScale, ringScale);
      ring.material.opacity = Math.max(0, 0.8 - timeSinceExplosion * 0.2);

      // Reset the animation after 5 seconds
      if (timeSinceExplosion > 5) {
        state.exploded = false;
        state.heartBeatPulse = 0;
        heart.visible = true;

        // Reset fragments
        fragmentGroup.children.forEach((fragment) => {
          fragment.position.set(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
          );
          fragment.material.opacity = 0.8;
        });

        // Reset ring
        ring.scale.set(0.1, 0.1, 0.1);
        ring.material.opacity = 0;
      }
    }

    // Pulse the light intensity
    pointLight.intensity = 1 + Math.sin(time * 4) * 0.5;
  };

  sceneObjects.shatter = scene;
}

function createGlitterScene() {
  const scene = new THREE.Group();

  // 1. Shattered glass pieces that glitter
  const glassGroup = new THREE.Group();

  const glassColors = [
    0xff6b6b, // red
    0xf3a183, // orange
    0x8a2be2, // purple
    0xffffff, // white
    0x00ffff, // cyan
  ];

  for (let i = 0; i < 100; i++) {
    // Create a random glass shard
    const geometry = new THREE.BufferGeometry();

    // Create a triangular or diamond-like shard
    const vertices = new Float32Array([
      0,
      0,
      0,
      Math.random() * 1 - 0.5,
      Math.random() * 1 - 0.5,
      Math.random() * 0.5 - 0.25,
      Math.random() * 1 - 0.5,
      Math.random() * 1 - 0.5,
      Math.random() * 0.5 - 0.25,
      Math.random() * 1 - 0.5,
      Math.random() * 1 - 0.5,
      Math.random() * 0.5 - 0.25,
    ]);

    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    // Apply a shiny, glassy material
    const material = new THREE.MeshPhongMaterial({
      color: glassColors[Math.floor(Math.random() * glassColors.length)],
      transparent: true,
      opacity: 0.6,
      specular: 0xffffff,
      shininess: 100,
      side: THREE.DoubleSide,
    });

    const shard = new THREE.Mesh(geometry, material);

    // Position randomly in a spherical area
    const radius = Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    shard.position.x = radius * Math.sin(phi) * Math.cos(theta);
    shard.position.y = radius * Math.sin(phi) * Math.sin(theta);
    shard.position.z = radius * Math.cos(phi);

    // Add random rotation
    shard.rotation.x = Math.random() * Math.PI * 2;
    shard.rotation.y = Math.random() * Math.PI * 2;
    shard.rotation.z = Math.random() * Math.PI * 2;

    // Store values for animation
    shard.userData = {
      initialRadius: radius,
      theta: theta,
      phi: phi,
      rotationSpeed: {
        x: Math.random() * 0.02 - 0.01,
        y: Math.random() * 0.02 - 0.01,
        z: Math.random() * 0.02 - 0.01,
      },
      pulseFrequency: Math.random() * 2 + 1,
    };

    glassGroup.add(shard);
  }
  scene.add(glassGroup);

  // 2. Light source in the center
  const light = new THREE.PointLight(0xffffff, 2, 30);
  light.position.set(0, 0, 0);
  scene.add(light);

  // Additional colored lights
  const coloredLights = [];
  const lightColors = [0xff6b6b, 0xf3a183, 0x8a2be2];

  for (let i = 0; i < 3; i++) {
    const colorLight = new THREE.PointLight(lightColors[i], 1, 15);
    const angle = (i / 3) * Math.PI * 2;
    colorLight.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
    scene.add(colorLight);
    coloredLights.push(colorLight);
  }

  // 3. Ambient environment
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // 4. Background gradients
  const bgGeometry = new THREE.SphereGeometry(25, 32, 32);
  const bgMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.9,
  });
  const background = new THREE.Mesh(bgGeometry, bgMaterial);
  scene.add(background);

  // Update function
  scene.update = function (delta) {
    const time = Date.now() * 0.001;

    // Animate the glass shards
    glassGroup.children.forEach((shard) => {
      const { initialRadius, theta, phi, rotationSpeed, pulseFrequency } =
        shard.userData;

      // Subtle pulsing movement
      const radius =
        initialRadius * (1 + 0.1 * Math.sin(time * pulseFrequency));

      // Update position with subtle movement
      shard.position.x = radius * Math.sin(phi) * Math.cos(theta + time * 0.1);
      shard.position.y = radius * Math.sin(phi) * Math.sin(theta + time * 0.1);
      shard.position.z = radius * Math.cos(phi);

      // Rotate each shard slightly
      shard.rotation.x += rotationSpeed.x;
      shard.rotation.y += rotationSpeed.y;
      shard.rotation.z += rotationSpeed.z;

      // Make the material shine by adjusting opacity and shininess
      shard.material.opacity =
        0.4 + 0.3 * Math.sin(time * pulseFrequency + phi);
      shard.material.shininess =
        50 + 50 * Math.sin(time * pulseFrequency * 2 + theta);
    });

    // Animate center light
    light.intensity = 1.5 + Math.sin(time * 2) * 0.5;

    // Animate colored lights
    coloredLights.forEach((light, i) => {
      const angle = (i / 3) * Math.PI * 2 + time * 0.5;
      light.position.set(
        Math.cos(angle) * 5,
        Math.sin(angle) * 5,
        Math.sin(time + i) * 2
      );
      light.intensity = 0.5 + 0.5 * Math.sin(time * 1.5 + i);
    });
  };

  sceneObjects.glitter = scene;
}

function createBeautifulScene() {
  const scene = new THREE.Group();

  // 1. Sunset/sunrise background
  const skyGeometry = new THREE.SphereGeometry(30, 32, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      
      void main() {
        float r = 0.5 + 0.5 * sin(vUv.y * 3.0 + time * 0.5);
        float g = 0.3 + 0.2 * sin(vUv.y * 2.0 + time * 0.3);
        float b = 0.5 + 0.5 * cos(vUv.y * 2.5 + time * 0.2);
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);

  // 2. Reflective water surface
  const waterGeometry = new THREE.PlaneGeometry(60, 60, 32, 32);
  const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x0077be,
    transparent: true,
    opacity: 0.8,
    specular: 0xffffff,
    shininess: 100,
    side: THREE.DoubleSide,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -10;
  scene.add(water);

  // 3. Memory fragments - floating photos/frames
  const frameGroup = new THREE.Group();
  for (let i = 0; i < 10; i++) {
    // Frame geometry
    const frameGeometry = new THREE.BoxGeometry(3, 2, 0.1);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      specular: 0xffffff,
      shininess: 30,
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);

    // Position randomly
    frame.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 15 - 5,
      (Math.random() - 0.5) * 20
    );

    // Random rotation
    frame.rotation.set(
      Math.random() * Math.PI * 0.2 - 0.1,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 0.2 - 0.1
    );

    // Animation parameters
    frame.userData = {
      floatSpeed: 0.2 + Math.random() * 0.3,
      rotateSpeed: 0.1 + Math.random() * 0.2,
      initialY: frame.position.y,
      initialX: frame.position.x,
      initialZ: frame.position.z,
      phase: Math.random() * Math.PI * 2,
    };

    frameGroup.add(frame);
  }
  scene.add(frameGroup);

  // 4. Sun/light source
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc33,
    transparent: true,
    opacity: 0.9,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(15, 10, -20);
  scene.add(sun);

  // Light from the sun
  const sunLight = new THREE.PointLight(0xffcc33, 2, 50);
  sunLight.position.copy(sun.position);
  scene.add(sunLight);

  // Additional ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);

  // 5. Lens flare effect (simplified as glowing objects)
  const flareGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const flareGeometry = new THREE.CircleGeometry(
      Math.random() * 0.5 + 0.2,
      16
    );
    const flareMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3 + Math.random() * 0.3,
      side: THREE.DoubleSide,
    });
    const flare = new THREE.Mesh(flareGeometry, flareMaterial);

    // Position along line from camera to sun
    const t = (i + 1) / 6; // Spread out
    flare.position.set(
      sun.position.x * t,
      sun.position.y * t,
      sun.position.z * t
    );

    flare.userData = {
      pulseSpeed: 0.5 + Math.random() * 1.5,
    };

    flareGroup.add(flare);
  }
  scene.add(flareGroup);

  // Update function
  scene.update = function (delta) {
    const time = Date.now() * 0.001;

    // Update sky shader time
    if (skyMaterial.uniforms) {
      skyMaterial.uniforms.time.value = time;
    }

    // Animate memory frames
    frameGroup.children.forEach((frame) => {
      const { floatSpeed, rotateSpeed, initialY, initialX, initialZ, phase } =
        frame.userData;

      // Gentle floating motion
      frame.position.y = initialY + Math.sin(time * floatSpeed + phase) * 1.5;
      frame.position.x =
        initialX + Math.sin(time * floatSpeed * 0.7 + phase) * 0.5;
      frame.position.z =
        initialZ + Math.cos(time * floatSpeed * 0.5 + phase) * 0.5;

      // Gentle rotation
      frame.rotation.x = Math.sin(time * rotateSpeed + phase) * 0.1;
      frame.rotation.y += rotateSpeed * delta * 0.2;
      frame.rotation.z = Math.cos(time * rotateSpeed + phase) * 0.1;
    });

    // Animate water - subtle waves
    water.geometry.attributes.position.needsUpdate = true;
    const positions = water.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] =
        Math.sin(x * 0.2 + time) * Math.cos(z * 0.2 + time) * 0.5;
    }

    // Animate lens flares
    flareGroup.children.forEach((flare) => {
      const { pulseSpeed } = flare.userData;
      flare.material.opacity = 0.2 + 0.2 * Math.sin(time * pulseSpeed);
      flare.rotation.z += delta * 0.5;
    });

    // Animate sun glow
    sun.scale.set(
      1 + 0.1 * Math.sin(time * 0.5),
      1 + 0.1 * Math.sin(time * 0.5),
      1 + 0.1 * Math.sin(time * 0.5)
    );
  };

  sceneObjects.beautiful = scene;
}

function createMagicScene() {
  const scene = new THREE.Group();

  // 1. Galaxy-like particle system
  const galaxyParticles = new THREE.Group();

  // Create star field
  for (let i = 0; i < 500; i++) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);

    // Colorful stars with rainbow gradient
    const hue = i / 500;
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.8, 0.5),
      transparent: true,
      opacity: Math.random() * 0.5 + 0.5,
    });

    const star = new THREE.Mesh(geometry, material);

    // Position in a spiral galaxy shape
    const arm = Math.floor(Math.random() * 3); // 3 spiral arms
    const armAngle = (arm / 3) * Math.PI * 2;
    const distance = Math.random() * 20 + 5;
    const spiralAmount = 5.0;
    const angle = armAngle + (distance / 15) * spiralAmount;

    star.position.x = Math.cos(angle) * distance;
    star.position.z = Math.sin(angle) * distance;
    star.position.y = (Math.random() - 0.5) * 5;

    // Size variation
    const scale = Math.random() * 3 + 0.5;
    star.scale.set(scale, scale, scale);

    // Animation data
    star.userData = {
      initialDistance: distance,
      initialAngle: angle,
      pulseSpeed: 0.2 + Math.random() * 0.8,
      rotationSpeed: 0.01 + Math.random() * 0.02,
      initialOpacity: star.material.opacity,
    };

    galaxyParticles.add(star);
  }
  scene.add(galaxyParticles);

  // 2. Glowing "MAGIC" text or symbolic representation
  // Create a simple glow effect
  const magicGeometry = new THREE.TorusKnotGeometry(5, 1.5, 64, 16);
  const magicMaterial = new THREE.MeshBasicMaterial({
    color: 0x8a2be2,
    transparent: true,
    opacity: 0.8,
  });
  const magicSymbol = new THREE.Mesh(magicGeometry, magicMaterial);
  magicSymbol.position.set(0, 0, 0);
  scene.add(magicSymbol);

  // Glowing energy field around the symbol
  const glowGeometry = new THREE.SphereGeometry(7, 32, 32);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8a2be2,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glow);

  // 3. Energy beams
  const beamGroup = new THREE.Group();
  const beamColors = [0xff6b6b, 0xf3a183, 0x8a2be2];

  for (let i = 0; i < 8; i++) {
    const beamGeometry = new THREE.CylinderGeometry(0.1, 0.1, 30, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: beamColors[i % beamColors.length],
      transparent: true,
      opacity: 0.5,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);

    // Position beams around center
    const angle = (i / 8) * Math.PI * 2;
    beam.position.x = Math.cos(angle) * 10;
    beam.position.z = Math.sin(angle) * 10;

    beam.rotation.x = Math.PI / 2;

    beam.userData = {
      initialAngle: angle,
      pulseSpeed: 0.5 + Math.random() * 0.5,
    };

    beamGroup.add(beam);
  }
  scene.add(beamGroup);

  // 4. Ambient environment
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  // Colorful point lights
  const lights = [];
  for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(beamColors[i], 2, 20);
    const angle = (i / 3) * Math.PI * 2;
    light.position.set(Math.cos(angle) * 10, 0, Math.sin(angle) * 10);
    scene.add(light);
    lights.push(light);
  }

  // 5. Cosmic background
  const bgGeometry = new THREE.SphereGeometry(40, 32, 32);
  const bgMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
  });
  const background = new THREE.Mesh(bgGeometry, bgMaterial);
  scene.add(background);

  // Update function
  scene.update = function (delta) {
    const time = Date.now() * 0.001;

    // Rotate entire galaxy
    galaxyParticles.rotation.y += delta * 0.05;

    // Animate individual stars
    galaxyParticles.children.forEach((star) => {
      const {
        initialDistance,
        initialAngle,
        pulseSpeed,
        rotationSpeed,
        initialOpacity,
      } = star.userData;

      // Pulsing animation
      star.material.opacity =
        initialOpacity * (0.7 + 0.3 * Math.sin(time * pulseSpeed));

      // Subtle movement
      const distanceVariation =
        initialDistance * (1 + 0.05 * Math.sin(time * pulseSpeed * 0.5));
      const angleVariation = initialAngle + time * rotationSpeed;

      star.position.x = Math.cos(angleVariation) * distanceVariation;
      star.position.z = Math.sin(angleVariation) * distanceVariation;

      // Twinkling effect
      const scale = 1 + 0.2 * Math.sin(time * pulseSpeed * 2);
      star.scale.set(scale, scale, scale);
    });

    // Animate magic symbol
    magicSymbol.rotation.x += delta * 0.1;
    magicSymbol.rotation.y += delta * 0.2;
    magicSymbol.rotation.z += delta * 0.05;

    // Animate glow
    glow.scale.set(
      1 + 0.1 * Math.sin(time * 0.5),
      1 + 0.1 * Math.sin(time * 0.5),
      1 + 0.1 * Math.sin(time * 0.5)
    );

    // Animate beams
    beamGroup.children.forEach((beam, i) => {
      const { initialAngle, pulseSpeed } = beam.userData;

      // Pulse opacity
      beam.material.opacity = 0.3 + 0.3 * Math.sin(time * pulseSpeed);

      // Rotate around center
      const angle = initialAngle + time * 0.1;
      beam.position.x = Math.cos(angle) * 10;
      beam.position.z = Math.sin(angle) * 10;

      // Aim toward center
      beam.lookAt(0, 0, 0);
      beam.rotation.x += Math.PI / 2;
    });

    // Animate lights
    lights.forEach((light, i) => {
      // Move lights up and down
      light.position.y = Math.sin(time * 0.5 + (i * Math.PI * 2) / 3) * 5;

      // Rotate around
      const angle = (i / 3) * Math.PI * 2 + time * 0.2;
      light.position.x = Math.cos(angle) * 10;
      light.position.z = Math.sin(angle) * 10;

      // Pulse intensity
      light.intensity = 1 + Math.sin(time * 0.7 + i) * 0.5;
    });
  };

  sceneObjects.magic = scene;
}

// Initialize ThreeJS after the page loads
window.addEventListener("load", function () {
  try {
    // Check if Three.js is loaded
    if (typeof THREE === "undefined") {
      console.error("Three.js library not loaded");
      const errorDiv = document.createElement("div");
      errorDiv.style.position = "fixed";
      errorDiv.style.top = "50%";
      errorDiv.style.left = "50%";
      errorDiv.style.transform = "translate(-50%, -50%)";
      errorDiv.style.background = "rgba(0, 0, 0, 0.8)";
      errorDiv.style.color = "#fff";
      errorDiv.style.padding = "20px";
      errorDiv.style.zIndex = "9999";
      errorDiv.textContent =
        "Required 3D library not loaded. Please check your internet connection and reload the page.";
      document.body.appendChild(errorDiv);
      return;
    }

    console.log("Calling initThreeJS from load event");
    setTimeout(initThreeJS, 500); // Small delay to ensure all resources are ready
  } catch (error) {
    console.error("Error during Three.js initialization:", error);
  }
});
