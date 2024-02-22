window.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    var canvas = document.getElementById("renderCanvas");

    // Create Babylon.js engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create scene
    var scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1); // RGBA values (r, g, b, a)

    // Add a camera to the scene
   var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 7, BABYLON.Vector3.Zero(), scene);

	camera.z=.1;
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(.5, .5, .5), scene);

    var pickedMesh = null;

    // Load .obj file using objFileLoader
    BABYLON.SceneLoader.ImportMesh("", "./", "board.obj", scene, function (meshes) {
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
                BABYLON.SceneLoader.ImportMesh("", "./", selectedObjFile, scene, 
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
                        // Register a function to be called after the scene renders to show the mesh
                        //scene.registerAfterRender(function () {
                        //    // Show the imported mesh now that it's positioned correctly
                        //    importedMesh.isVisible = true;

                        //    // Unregister the function to prevent it from being called again
                        //    scene.unregisterAfterRender(arguments.callee);
                        //});



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
            }
        }
    });
});

