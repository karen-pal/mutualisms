window.addEventListener('DOMContentLoaded', () => { 
    let root = "./"; //"http://127.0.0.1:8080/"
    // Array de nombres de archivos de audio
    var audioFiles = ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3"];
    var audioFiles2 = ["1.wav", "2.wav", "3.wav", "4.wav", "5.wav"];
    // Índice para rastrear qué archivo de audio se reproducirá a continuación
    var audioIndex = 0;
    // Función para cargar y reproducir el archivo de audio actual
    function playNextAudio() {
	if (audioIndex % 2 == 0) {
        var audio = new Audio(root + "audios/" + audioFiles[audioIndex]);
	} else {
        var audio = new Audio(root + "audios/" + audioFiles2[audioIndex]);
	}
	console.log(audio);
	console.log(audioIndex)
        audio.play();
        // Incrementar el índice para el próximo clic
        audioIndex = (audioIndex + 1) % audioFiles.length;
    }

    // Get the canvas element
    var canvas = document.getElementById("renderCanvas");

    // Create Babylon.js engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create scene
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1); // RGBA values (r, g, b, a)

    // Add a camera to the scene
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 7, BABYLON.Vector3.Zero(), scene);
    camera.z = .1;
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(.5, .5, .5), scene);

    var pickedMesh = null;

    // Load .obj file using objFileLoader
    BABYLON.SceneLoader.ImportMesh("", root, "board.obj", scene, function (meshes) {
        // Material for edges
        var edgeMaterial = new BABYLON.StandardMaterial("edgeMaterial", scene);
        edgeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color

        // Material for flat surfaces
        var flatMaterial = new BABYLON.StandardMaterial("flatMaterial", scene);
        flatMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); //background

        // Loop through each mesh
        meshes.forEach(function (mesh) {
            // Create edge lines
            var positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var indices = mesh.getIndices();
            var lines = [];

            for (var i = 0; i < indices.length / 3; i++) {
                var p1 = BABYLON.Vector3.FromArray(positions, indices[i * 3] * 3);
                var p2 = BABYLON.Vector3.FromArray(positions, indices[i * 3 + 1] * 3);
                var p3 = BABYLON.Vector3.FromArray(positions, indices[i * 3 + 2] * 3);

                lines.push([p1, p2], [p2, p3], [p3, p1]);
            }

            // Create line system
            var lineSystem = BABYLON.MeshBuilder.CreateLineSystem("edges", { lines: lines }, scene);
            lineSystem.color = new BABYLON.Color3(.5, .5, .5); // lines

            // Apply flat material to the mesh
            mesh.material = flatMaterial;

            // Enable pickability of the mesh
            mesh.isPickable = true;
        });

        // Create glow layer
        var glowLayer = new BABYLON.GlowLayer("glow", scene);

        // Create light points as light sources
        var lightPoints = [];
        for (var i = 0; i < 10; i++) {
            var lightPoint = new BABYLON.PointLight("lightPoint" + i, new BABYLON.Vector3(0, 0, 0), scene);
            lightPoint.diffuse = new BABYLON.Color3(1, 1, 0); // Yellow light
            lightPoint.specular = new BABYLON.Color3(1, 1, 1); // White specular highlight
            lightPoints.push(lightPoint);
        }

        // Position light points
        for (var i = 0; i < lightPoints.length; i++) {
            lightPoints[i].position = new BABYLON.Vector3(Math.random() * 10 - 5, Math.random() * 3, Math.random() * 10 - 5);

            // Add light point to glow layer
            glowLayer.addIncludedOnlyMesh(lightPoints[i]);
        }

        // Create light point indicators
        var lightPointIndicators = [];
        for (var i = 0; i < lightPoints.length; i++) {
            var lightPointIndicator = BABYLON.MeshBuilder.CreateSphere("lightPointIndicator" + i, { diameter: 0.2, segments: 16 }, scene);
            lightPointIndicator.position = lightPoints[i].position;
            lightPointIndicator.material = new BABYLON.StandardMaterial("lightPointIndicatorMat", scene);
            lightPointIndicator.material.diffuseColor = new BABYLON.Color3(1, 1, 0); // Yellow
            lightPointIndicator.material.specularColor = new BABYLON.Color3(0, 0, 0); // No specular highlight
            lightPointIndicator.material.emissiveColor = new BABYLON.Color3(1, 1, 0); // Yellow emission
            lightPointIndicator.material.alpha = 0.1; // Adjust transparency
            lightPointIndicators.push(lightPointIndicator);
        }
        // Animation function to toggle light points visibility
        var animateLightPoints = function (lightPoints, interval) {
            var isVisible = true;
            setInterval(function () {
                lightPoints.forEach(function (point) {
                    point.intensity = isVisible ? 1 : 0; // Turn light on or off
                });
                isVisible = !isVisible;
            }, interval);
        };
    });

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Resize the canvas when the window is resized
    window.addEventListener("resize", function () {
        engine.resize();
    });

    // Listen for mouse click events on the canvas
    canvas.addEventListener("click", function (event) {
        // Perform a pick operation
        engine.stopRenderLoop();
        renderingPaused = true;

        var pickResult = scene.pick(scene.pointerX, scene.pointerY);

        // Check if a mesh was picked
        if (pickResult.hit) {
            // Get the picked mesh
            pickedMesh = pickResult.pickedMesh;

            // Create a new object at the position of the picked mesh
            if (pickedMesh) {
                var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
                var worldPosition = pickInfo.pickedPoint;

                var objFiles = [
                    "yuyoc1.obj",
                    "yuyoc2.obj",
                    "yuyoc3.obj"
                ];

                var randomIndex = Math.floor(Math.random() * objFiles.length);
                var selectedObjFile = objFiles[randomIndex];

                // Load the yuyo2.obj file and position it at the picked mesh's position
                BABYLON.SceneLoader.ImportMesh("", root , selectedObjFile, scene,
                    function (importedMeshes) {
                        importedMeshes.forEach(function (importedMesh) {
                            // Position the imported mesh at the picked mesh's position
                            importedMesh.isVisible = false;
                            importedMesh.scaling = new BABYLON.Vector3(0, 0, 0);

                            importedMesh.position.copyFrom(worldPosition);

                            var randomRotationY = Math.random() * Math.PI * 2; // Random rotation around Y axis
                            importedMesh.rotation.y = randomRotationY;
                            // Hide the imported mesh until it's positioned correctly
                            importedMesh.isVisible = true;
                            var scaleFactor = Math.random() * 1 + 0.25; // Scale factor between 0.5 and 1.0

                            BABYLON.Animation.CreateAndStartAnimation("scaleAnim", importedMesh, "scaling", 30, 60,
                                new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(scaleFactor, scaleFactor, scaleFactor),
                                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                        });

                        // Resume rendering after meshes are positioned and scaled
                        if (renderingPaused) {
                            engine.runRenderLoop(function () {
                                scene.render();
                            });
                            renderingPaused = false;
                        }
                    },
                    function (event) {
                        // Progress callback: Handle loading progress here
                        console.log((event.loaded / event.total * 100) + '% loaded');
                    },
                    function (scene, message) {
                        // Error callback: Handle loading errors here
                        console.error("Failed to load yuyo2.obj:", message);
                    }
                );
                // Start playing audio
                playNextAudio();
                // Hide text after audio finishes
                // Create text
                var textTexture = new BABYLON.DynamicTexture("TextTexture", { width: 512, height: 256 }, scene);
                var textMaterial = new BABYLON.StandardMaterial("TextMaterial", scene);
                textMaterial.diffuseTexture = textTexture;
                textMaterial.diffuseTexture.hasAlpha = true; // Enable alpha channel
                var textPlane = BABYLON.MeshBuilder.CreatePlane("TextPlane", { size: 2 }, scene);
                var altitudes = [1.5, 1, .8, 2, 1.8, .9]
                var randomIndexA = Math.floor(Math.random() * objFiles.length);
                var altitud = altitudes[randomIndexA];
                textPlane.position = worldPosition.add(new BABYLON.Vector3(0, altitud, 0)); // Offset to make text appear above the clicked position
                textPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

                textPlane.material = textMaterial;
                textTexture.drawText("In the small beauty of the forest", null, null, "bold 36px Roboto", "white", "transparent", true);

            }
        }
    });
});

