
var app = {

    scene           : null,
    camera          : null,
    renderer        : null,
    raycaster       : null,
    intersected     : null,
    particles       : [],
    mouse           : {x:0,y:0},
    raycasterMouse  : null,
    PARTICLE_NUM    : 1000,
    COLORS          : [0x4285F4, 0x34A853, 0xFBBC05, 0xEA4335],

    init:function(){

        // Camera setup
        app.camera = new THREE.PerspectiveCamera(
            75,
            $(window).width()/$(window).height(),
            1,
            10000 );

        app.camera.position.z = 100;

        // Scene setup
        app.scene = new THREE.Scene();

        app.raycasterMouse = new THREE.Vector2();

        // Raycaster setup
        app.raycaster = new THREE.Raycaster();

        // Renderer setup
        app.renderer = new THREE.CanvasRenderer();
        app.renderer.setPixelRatio(window.devicePixelRatio);
        app.renderer.setSize($(window).width(), $(window).height());
        app.renderer.setClearColorHex(0xffffff, 1);


        // Append to HTML
        var container = $('<div>');
        container.append(app.renderer.domElement);
        $('body').append(container);

        $(document).on('mousemove', app.onMouseMove);

    },
    drawParticles:function(){

        var PI2 = Math.PI*2;
        var geometry = new THREE.Geometry();

        for(var i=0;i<app.PARTICLE_NUM;i++){

            var colorIndex = Math.floor(Math.random()*app.COLORS.length);
            var color = app.COLORS[colorIndex];

            var material = new THREE.SpriteCanvasMaterial({
                color : color,
                program : function(context){
                    context.beginPath();
                    context.arc(0, 0, 1, 0, PI2, true);
                    context.fill();
                }
            });

            material.overdraw = 0.5;

            var particle = new THREE.Sprite(material);
            particle.position.x = Math.random() * 2 - 1;
            particle.position.y = Math.random() * 2 - 1;
            particle.position.z = Math.random() * 2 - 1;
            particle.position.normalize();
            particle.position.multiplyScalar(Math.random()*10+450);
            particle.scale.x = particle.scale.y = 15;

            app.particles.push({sprite: particle, value:Math.random()-0.5});

            geometry.vertices.push(particle.position);

            app.scene.add(particle);

        }

        var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color:color, opacity:0.5}));
        app.scene.add(line);

    },
    render:function(){

        app.camera.updateMatrixWorld();

        app.raycaster.setFromCamera(app.raycasterMouse, app.camera);

        var intersects = app.raycaster.intersectObjects(app.scene.children);

        if(intersects.length > 0){

            if(app.intersected != intersects[0].object) {


                if(app.intersected){
                    app.intersected.material.program = function (context) {
                        context.beginPath();
                        context.arc(0, 0, 1, 0, Math.PI * 2, true);
                        context.fill();
                    };
                }

                app.intersected = intersects[0].object;
                app.intersected.material.program = function (context) {
                    context.beginPath();
                    context.arc(0, 0, 3, 0, Math.PI * 2, true);
                    context.fill();
                }

            }
        }else{

            if(app.intersected) {

                app.intersected.material.program = function (context) {
                    context.beginPath();
                    context.arc(0, 0, 1, 0, Math.PI * 2, true);
                    context.fill();
                };

                app.intersected = null;

            }

        }

        app.renderer.render(app.scene, app.camera);

    },
    animate:function(){

        requestAnimationFrame(app.animate);

        /**
         * ANIMATE STUFF
         */

        //console.log((app.mouse.x - app.camera.position.x)*0.05);

        app.camera.position.x += (app.mouse.x - app.camera.position.x)*0.05;
        app.camera.position.y += (-app.mouse.y + 200 - app.camera.position.y)*0.05;

        //app.camera.lookAt(app.scene.position);

        _.each(app.particles, function(particle, index){

            particle.sprite.position.z += particle.value;

        });

        app.render();

    },
    onMouseMove:function(evt){

        app.raycasterMouse.x = (evt.clientX/$(window).width())*2-1;
        app.raycasterMouse.y = - (evt.clientY/$(window).height())*2+1;

        app.mouse.x = evt.clientX-($(window).width()/2);
        app.mouse.y = evt.clientY-($(window).height()/2);

    }


};

app.init();
app.drawParticles();
app.animate();