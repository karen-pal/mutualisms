window.addEventListener('DOMContentLoaded', () => {
    // Get the canvas element
    var canvas = document.getElementById("renderCanvas");

    // Create Babylon.js engine
    var engine = new BABYLON.Engine(canvas, true);

    // Create scene
    var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene
    var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // Load .obj file for motherboard
    BABYLON.SceneLoader.ImportMesh("", "./", "board.obj", scene, function (meshes) {
        // Material for edges
        var edgeMaterial = new BABYLON.StandardMaterial("edgeMaterial", scene);
        edgeMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1); // Blue color

        // Material for flat surfaces
        var flatMaterial = new BABYLON.StandardMaterial("flatMaterial", scene);
        flatMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1); // Green color

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
            lineSystem.color = new BABYLON.Color3(0, 0, 1); // Blue color

            // Apply flat material to the mesh
            mesh.material = flatMaterial;
        });

    });

    // Run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Resize the canvas when the window is resized
    window.addEventListener("resize", function () {
        engine.resize();
    });
});


