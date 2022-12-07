import * as THREE from 'three';
import { TrackballControls } from 'TrackballControls';
import {OBJLoader} from 'OBJLoader';
import { GUI } from 'lil-gui';

var textureLoader = new THREE.TextureLoader();
var texture = textureLoader.load( 'resources/jupiter.jpg' );

// Global variables
let WIDTH, HEIGHT, aspectRatio;
let renderer, scene, camera;

let ctrl;
let gui;

let uralommas, gyuru, spaceShip, asteroid, planet;
let dLight, sLight, sunLight;
let cameraPos;

let clock = new THREE.Clock();
let pos_x = -100, pos_x_dir = 1;
let planetSizeOriginal = 24;


let controller = function () {
    this.positionSpaceRock = 0.0;
    this.dayLight = true;
    this.ssLight = true;
    this.snLight = false;
    this.newSize = 1;
};

function addControlGui( controlObject ) {
    gui = new GUI( { autoPlace: false } );
    gui.add( controlObject, 'positionSpaceRock', -200, 200 ).name('position of asteroid');
    gui.add( controlObject, 'newSize', 1, 2.5 ).name('size of planet');
    gui.add( controlObject, 'dayLight').name('"Sunlight"').onChange( function ( e ) {
        dLight.visible = !e;
        dLight.visible = e;
    });
    gui.add( controlObject, 'ssLight').name('reflector of space station').onChange( function ( e ) {
        sLight.visible = !e;
        sLight.visible = e;
    });
    gui.add( controlObject, 'snLight').name('blue light').onChange( function ( e ) {
        sunLight.visible = !e;
        sunLight.visible = e;
    });

    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = '0px';
    gui.domElement.style.right = '0px';
    gui.domElement.style.zIndex = '120';
    document.body.appendChild( gui.domElement );
}

loader();

function loader(){
    var loader = new OBJLoader();
    loader.load(
        'resources/spaceship.obj',
        function (loaded){
            spaceShip = loaded;
            spaceShip.scale.set( 4, 4, 4 );
            spaceShip.traverse( function (child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material = new THREE.MeshPhongMaterial({color: 0xFF0800, side: THREE.DoubleSide});
                }
            } );
            init();
        },
        // Betöltés előrehaladása közben hívódik
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // Hibás betöltés esetén
        function ( error ) {
            console.log( 'An error happened!', error.currentTarget.statusText, error.currentTarget.responseURL );
        });

}

function init() {
    // Böngésző ablakméret lekérése és méretarány számítása
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    aspectRatio = WIDTH / HEIGHT;

    // Renderer létrehozása és DOM-hoz adása
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( WIDTH, HEIGHT );
    renderer.shadowMap.enabled = true;
    renderer.setClearColor( 0x000000 );
    document.body.appendChild( renderer.domElement );

    scene = new THREE.Scene();

    // Kamera létrehozása és vetítési paramétereinek beállítása
    camera = new THREE.PerspectiveCamera( 75, aspectRatio, 0.1, 1000 );
    // camera.position.set( 0, 10, 200 );
    // camera.lookAt( scene.position );

    /*
    * Create Objects
    * */
    /*
      Space Station
     */
    let a = 4; // alap oldal hossz - viszonyítási alap
    let cylMesh3Height = a*2;
    let whiteMaterial = new THREE.MeshPhongMaterial( { color: 0xefffff } );
    let redMaterial = new THREE.MeshPhongMaterial( { color: 0xeff0000 } );
    let grayMaterial = new THREE.MeshPhongMaterial( { color: 0xB2BEB5, side: THREE.DoubleSide} );
    let cylGeometry2 = new THREE.CylinderGeometry(a/2, a/2, cylMesh3Height, 16, 1, false, 0, 2*Math.PI);
    uralommas = new THREE.Mesh( cylGeometry2, redMaterial );
    uralommas.rotation.z = Math.PI / 2;
    uralommas.rotation.x = Math.PI / 4;
    uralommas.castShadow = true;
    uralommas.receiveShadow = true;
    let tav = (a*14)
    uralommas.position.set(-tav,tav, -tav);
    scene.add( uralommas );

    // Body of space station
    let cylMesh4 = new THREE.Mesh( cylGeometry2, redMaterial );
    cylMesh4.rotation.x = Math.PI / 2;
    cylMesh4.position.set(0, 0 , cylMesh3Height/2);
    uralommas.add( cylMesh4 );
    // Cube
    let boxMeshHeight = a*3.5;
    let boxGeometry = new THREE.BoxGeometry( a*1.3, a*1.5, boxMeshHeight );
    let boxMesh = new THREE.Mesh( boxGeometry, redMaterial );
    boxMesh.position.z = (cylMesh3Height + boxMeshHeight/2);
    uralommas.add( boxMesh );
    // Nagy Henger
    let cylMeshHeight = a*6;
    let cylMeshWidth = a;
    let cylGeometry = new THREE.CylinderGeometry(cylMeshWidth, cylMeshWidth, cylMeshHeight, 32, 1, false, 0, 2*Math.PI);
    let cylMesh = new THREE.Mesh( cylGeometry, whiteMaterial );
    cylMesh.position.set(0, -(cylMesh3Height/2 + cylMeshHeight/2) , 0);
    uralommas.add( cylMesh );
    let cylMesh2 = new THREE.Mesh( cylGeometry, whiteMaterial );
    cylMesh2.position.set(0, (cylMesh3Height/2 + cylMeshHeight/2), 0);
    uralommas.add( cylMesh2 );
    // end of space station's sides
    let csucsGeometry = new THREE.CylinderGeometry(cylMeshWidth, cylMeshWidth/1.5, cylMeshHeight/7, 32, 1, false, 0, 2*Math.PI);
    let csucsMesh = new THREE.Mesh( csucsGeometry, whiteMaterial );
    let csucsMesh2 = new THREE.Mesh( csucsGeometry, whiteMaterial );
    csucsMesh.position.set(0, -(cylMesh3Height/2 + cylMeshHeight*7.5/7) , 0);
    csucsMesh2.position.set(0, (cylMesh3Height/2 + cylMeshHeight*7.5/7), 0);
    csucsMesh2.rotation.x = Math.PI;

    uralommas.add( csucsMesh );
    uralommas.add( csucsMesh2 );
    // Solar panels
    let planeHeight = a * 8;
    let planeWidth = a * 2;
    let planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight, 4, 4 );
    let planeMesh1 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh2 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh3 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh4 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh5 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh6 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh7 = new THREE.Mesh( planeGeometry, grayMaterial );
    let planeMesh8 = new THREE.Mesh( planeGeometry, grayMaterial );
    planeMesh1.position.set((cylMeshWidth + planeHeight/2), cylMeshHeight/4, 0);
    planeMesh2.position.set((cylMeshWidth + planeHeight/2), -cylMeshHeight/4, 0);
    planeMesh3.position.set(-(cylMeshWidth + planeHeight/2), cylMeshHeight/4, 0);
    planeMesh4.position.set(-(cylMeshWidth + planeHeight/2), -cylMeshHeight/4, 0);
    planeMesh5.position.set((cylMeshWidth + planeHeight/2), cylMeshHeight/4, 0);
    planeMesh6.position.set((cylMeshWidth + planeHeight/2), -cylMeshHeight/4, 0);
    planeMesh7.position.set(-(cylMeshWidth + planeHeight/2), cylMeshHeight/4, 0);
    planeMesh8.position.set(-(cylMeshWidth + planeHeight/2), -cylMeshHeight/4, 0);
    planeMesh1.rotation.z = Math.PI/2;
    planeMesh2.rotation.z = Math.PI/2;
    planeMesh3.rotation.z = Math.PI/2;
    planeMesh4.rotation.z = Math.PI/2;
    planeMesh5.rotation.z = Math.PI/2;
    planeMesh6.rotation.z = Math.PI/2;
    planeMesh7.rotation.z = Math.PI/2;
    planeMesh8.rotation.z = Math.PI/2;
    cylMesh.add( planeMesh1 );
    cylMesh.add( planeMesh2 );
    cylMesh.add( planeMesh3 );
    cylMesh.add( planeMesh4 );
    cylMesh2.add( planeMesh5 );
    cylMesh2.add( planeMesh6 );
    cylMesh2.add( planeMesh7 );
    cylMesh2.add( planeMesh8 );
    /*
    Planet
     */
    let sphereGeometry = new THREE.SphereGeometry( planetSizeOriginal, 30, 30 );
    let stoneMaterial = new THREE.MeshPhongMaterial( { color: 0x333333} );
    let bolyoMaterial = new THREE.MeshPhongMaterial();
    bolyoMaterial.map = texture;
    planet = new THREE.Mesh( sphereGeometry, bolyoMaterial );
    planet.castShadow = true;
    planet.receiveShadow = true;
    scene.add( planet );
    /*
    Space-Ship
     */
    spaceShip.position.set( 0, -10, 150 );
    spaceShip.rotation.y += Math.PI / 2;
    spaceShip.receiveShadow = true;
    scene.add(spaceShip);
    let smallBall = new THREE.SphereGeometry( 1, 8, 8);
    cameraPos = new THREE.Mesh( smallBall, stoneMaterial );
    spaceShip.add(cameraPos);
    cameraPos.position.set(0, a, 0);
    cameraPos.visible = false;
    // camera.position.set(-10, 5, 0);
    camera.position.set(0, 60, 240);
    camera.lookAt( scene.position );
    scene.add(camera);
    /*
    Asteroid
    */
    let gombRadius2 = a * 2;
    let sphereGeometry2 = new THREE.SphereGeometry( gombRadius2, 6, 6 );
    asteroid = new THREE.Mesh( sphereGeometry2, stoneMaterial );
    asteroid.scale.set(2, 1, 1);
    asteroid.position.set((2.5*planetSizeOriginal), (2*planetSizeOriginal), 0);
    asteroid.rotation.x = Math.PI / 2;
    asteroid.rotation.y = Math.PI / 6;
    scene.add( asteroid );
    /*
    Ring
     */
    const gyuruGeometry = new THREE.TorusGeometry( 9*a, 3, 8, 40 );
    const gyuruMaterial = new THREE.MeshPhongMaterial( { color: 0x9A7B4F} );
    gyuruMaterial.transparent = true;
    gyuruMaterial.opacity = 0.6;
    gyuru = new THREE.Mesh( gyuruGeometry, gyuruMaterial );
    gyuru.rotation.x = Math.PI / 2;
    gyuru.rotation.y = Math.PI / 6;
    gyuru.castShadow = true;
    gyuru.receiveShadow = true;
    scene.add( gyuru );

    /*
    * Lights
    * */
    // ambiens fény
    let ambient = new THREE.AmbientLight( 0xffffff, 0.2 );
    scene.add( ambient );
    //irányított fény
    dLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    dLight.position.set(  0,8*a, 0);
    dLight.target = gyuru;
    scene.add( dLight )
    // űrállomás fénye - reflektor fény
    sLight = new THREE.SpotLight( 0xff5f5f, 10, 45*a, Math.PI / 12, 0.2 );
    sLight.target = planet;
    sLight.castShadow = true;
    cylMesh4.add( sLight );
    // let sLightHelper = new THREE.SpotLightHelper(sLight, 0x0000ff);
    // sLight.add(sLightHelper);
    // pontfény
    sunLight = new THREE.PointLight(0x005f5f , 0.8, a*45);
    sunLight.position.set(  16 * a, 6 * a, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.visible = false;
    scene.add(sunLight);
    let pointLightHelper = new THREE.PointLightHelper(sunLight, a*2, 0x005f5f);
    scene.add(pointLightHelper);

    // Az ablak későbbi átméretezése esetén visszahívható függvény megadása
    window.addEventListener( 'resize', handleWindowResize, false );
    window.addEventListener( 'keydown', handleKeyDown );

    // Kamera vezérlés
    // controls = new TrackballControls( camera, renderer.domElement );
    // controls.rotateSpeed = 5.0;
    // controls.panSpeed = 1.0;
    // Paraméter panel
    ctrl = new controller();
    addControlGui( ctrl );

    animate();
}

function handleWindowResize() {
    // Az ablak átméretezése esetén a kamera vetítési paraméterek újraszámolása
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    console.log( 'WIDTH=' + WIDTH + '; HEIGHT=' + HEIGHT );
    renderer.setSize( WIDTH, HEIGHT );
    aspectRatio = WIDTH / HEIGHT;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    render();
}

let rotation =  Math.PI / 720;
function animate() {
    // Újabb képkocka rajzolásának kérése.
    // Maximálisan 60 FPS-t biztosít a rendszer.
    requestAnimationFrame( animate );
    // Kameramozgás vezérlése
    // clock.getDelta()
    // controls.update(clock.getDelta());

    toBackMove(uralommas);
    planet.rotation.y += rotation/3;
    gyuru.rotation.x += rotation*2;
    asteroid.rotation.x += rotation*8;
    asteroid.rotation.y += rotation*4;

    asteroid.position.x = ctrl.positionSpaceRock;
    planet.scale.set(ctrl.newSize,ctrl.newSize, ctrl.newSize);
    gyuru.scale.set(ctrl.newSize,ctrl.newSize, ctrl.newSize);
    // Új képkocka rajzolása
    render();
}

function render() {
    // 3D -> 2D vetített kép kiszámítása.
    // scene 3D színtér képe a camera kamera szemszögéből.
    renderer.render( scene, camera );
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function toBackMove(mesh){
    pos_x += pos_x_dir;
    if( pos_x > 100 ) {
        pos_x = 100 - ( pos_x - 100 );
        pos_x_dir = -1;
    }
    if( pos_x < -100 ) {
        pos_x = -100 - ( pos_x + 100 );
        pos_x_dir = 1;
    }
    mesh.position.x = pos_x;
    sleep(20);
}

let infoCheck = false;
function handleKeyDown( event ) {
    console.log( 'keydown: ' + event.keyCode );
    if( event.keyCode === "I".charCodeAt( 0 ) || event.keyCode === "i".charCodeAt( 0 ) || event.keyCode === "0".charCodeAt( 0 ) ) {
        if(infoCheck){
            document.getElementById('key-info').innerHTML = '<p>0/i -> info</p>\n' +
                '  <p>w -> forward move</p>\n' +
                '  <p>s -> backwards move</p>\n' +
                '  <p>8 -> up</p>\n' +
                '  <p>2 -> down</p>\n' +
                '  <p>a -> left rotate</p>\n' +
                '  <p>d -> right rotate</p>';
        } else {
            document.getElementById( 'info' ).innerHTML = '';
            document.getElementById( 'key-info' ).innerHTML = '';
        }
        infoCheck = !infoCheck;
    }
    if( event.keyCode === "w".charCodeAt( 0 ) || event.keyCode === "W".charCodeAt( 0 )) {
        spaceShip.position.z -= Math.cos(spaceShip.rotation.y - Math.PI/2) * 4;
        spaceShip.position.x -= Math.sin(spaceShip.rotation.y - Math.PI/2) * 4;

        spaceShip.position.y += Math.sin(spaceShip.rotation.x)  * 4;
    }
    if( event.keyCode === "s".charCodeAt( 0 ) || event.keyCode === "S".charCodeAt( 0 )) {
        spaceShip.position.z += Math.cos(spaceShip.rotation.y - Math.PI/2) * 4;
        spaceShip.position.x += Math.sin(spaceShip.rotation.y - Math.PI/2) * 4;

        spaceShip.position.y -= Math.sin(spaceShip.rotation.x)  * 4;
    }

    if( event.keyCode === "a".charCodeAt( 0 ) || event.keyCode === "A".charCodeAt( 0 )) {
        spaceShip.rotation.y += Math.PI / 32;
    }
    if( event.keyCode === "d".charCodeAt( 0 ) || event.keyCode === "D".charCodeAt( 0 )) {
        spaceShip.rotation.y -= Math.PI / 32;
    }

    if( event.keyCode === "8".charCodeAt( 0 ) || event.keyCode === 104)  {
        spaceShip.position.y += 4;
        // spaceShip.rotation.x += Math.cos(spaceShip.rotation.y - Math.PI/2) * Math.PI / 32;
        // spaceShip.rotation.z -= Math.sin(spaceShip.rotation.y - Math.PI/2) * Math.PI / 32;
        // document.getElementById( 'xr' ).innerHTML = 'x: ' + spaceShip.rotation.x;
    }
    if( event.keyCode === "2".charCodeAt( 0 ) || event.keyCode === 98)  {
        spaceShip.position.y -= 4;
        // spaceShip.rotation.x -= Math.cos(spaceShip.rotation.y - Math.PI/2) * Math.PI / 32;
        // spaceShip.rotation.z += Math.sin(spaceShip.rotation.y - Math.PI/2) * Math.PI / 32;
        // document.getElementById( 'xr' ).innerHTML =  'x: ' + spaceShip.rotation.x;
    }
}
