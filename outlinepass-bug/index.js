var THREE = require("three");
var ColladaLoader = require("three-collada-loader-2");

var EffectComposer = require("postprocessing").EffectComposer;
var RenderPass = require("postprocessing").RenderPass;
var OutlinePass = require("postprocessing").OutlinePass;
var ShaderPass = require("postprocessing").ShaderPass;
var FXAAShader = require("postprocessing").FXAAShader;


//*
var loader = new ColladaLoader();


var camera, scene, renderer;
var geometry, material, mesh, mixer, action, playFrom, playUntil;
var clock = new THREE.Clock(); 

var models = {
    "knight": "./knight/knight_low_collada.DAE",
    "scorpid": "./scorpid/scorpid_collada.DAE"
}

var modelId = document.location.search.substring(1) || "knight";
var modelPath = models[modelId] || models.knight;
 
var outlinePass, composer, childMeshes = []; 




function init() {

    loader.load(modelPath, function ( collada ) {
        console.log(collada)
        mesh = window.mesh = collada.scene;
        var sc = 0.15;
        mesh.scale.set(sc, sc, sc);
        mesh.position.z = -0.5;
        if (modelId === "scorpid") {
            mesh.rotation.z = Math.PI;
        }
        mixer = new THREE.AnimationMixer(mesh);
        action = mixer.clipAction(collada.animations[0]);
        
    
        scene.add( mesh );
        childMeshes = [];
        mesh.traverse(function(obj) {
            if ( ! (obj instanceof THREE.AmbientLight)) {
                childMeshes.push(obj);
            }
        })
        
		outlinePass = new OutlinePass( scene, camera, {edgeStrength: 4.5, patternScale: 7.5 } ); /* new THREE.Vector2( window.innerWidth, window.innerHeight ), */
        outlinePass.renderToScreen = true;
		composer.addPass( outlinePass );
        outlinePass.setSelection(childMeshes);
    });

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10/* */);
    camera.position.z = 1;
 
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.shadowMap.enabled = true;
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);
    
    
    composer = new EffectComposer( renderer );
    composer.setSize( window.innerWidth, window.innerHeight );
                
	renderPass = new RenderPass( scene, camera );
    renderPass.renderToScreen = false;
	composer.addPass( renderPass );
}

function animate() {

    var delta = clock.getDelta();
    requestAnimationFrame( animate );
     
    composer.render(delta);
    
    if (mixer && playUntil) {
        
        if (clock.elapsedTime >= (playUntil - playFrom)) {
            action.stop();
            clock = new THREE.Clock(true);
            mixer.time = action.time = playFrom;
            action.play();
        }
        mixer.update(delta);
        
    }
    
}

var anims = {};

anims.knight = {
    "T-pose": [0, 5],
    walk: [10, 80],
    walk_backwards: [90, 160],
    run: [170, 220],
    strafe_left: [230, 300],
    strafe_right: [300, 370],
    jump: [380, 430],
    attack_1: [440, 520],
    attack_2: [520, 615],
    attack_3: [615, 795],
    attack_4: [795, 850],
    attack_5: [850, 970],
    attack_6: [970, 1040],
    hit_1: [1040, 1080],
    hit_2: [1080, 1120],
    hit_3: [1120, 1160],
    death_1: [1160, 1260],
    death_2: [1270, 1370],
    idle_1: [1380, 1530],
    Idle_2: [1530, 1830],
    emotion_1: [1830, 1930],
    emotion_2: [1930, 2040]
}

anims.scorpid = {
    "walk": [0, 72],
    "strafe left": [72, 120],
    "strafe right": [120, 168],
    "attack 1": [168, 220],
    "death 1": [220, 292],
    "attack 2": [292, 350],
    "attack 3": [350, 440],
    "death 2": [440, 576],
    "death 3": [580, 650],
    "idle 1": [660, 760],
    "idle 2": [761, 849],
    "gethit 1": [850, 880],
    "gethit 2": [880, 950],
    "jump": [951, 1015]
}

window.playAnim = function(name) {
    console.log(modelId, name)
    var anim = anims[modelId][name];
    if (!anim) {
        console.error("not found", name);
        return;
    }
    var baseFPS=30.0;
    action.stop();
    clock = new THREE.Clock(true);
    action.time = mixer.time = clock.time = playFrom = anim[0] / baseFPS;
    playUntil = anim[1] / baseFPS;
    action.play();
    
}

init();
animate();
