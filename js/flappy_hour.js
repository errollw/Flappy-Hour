// make the paper scope global, by injecting it into window:
paper.install(window);

var vw, vh, ground_y;

var beer_mug,
    bm_dy = 0;

var bg_sky, bg_ground;

var bg_ground_scroller,
	bg_trees_scroller,
	bg_clouds_scroller;

var bg_instances = [];

var keg_sets = [],
	keg_set_timer_max = 84;
	keg_set_timer = keg_set_timer_max;

var keg_w = 96,
	keg_h = 118,
	keg_offset = 10;

var beer_keg_syms = {};

var gap_y, gap_y_min, gap_y_max;
var gap_height = 300;

// Only executed our code once the DOM is ready.
window.onload = function() {

    // Create an empty project and a view for the canvas
    paper.setup('flappy_canvas');

    // get page size
    vw = view.size.width, vh = view.size.height;

    // set ground height, and boounds for keg_gaps
    ground_y = vh*7/8;
    trees_y = vh*13/16;
    clouds_y = vh*11/16;
    gap_y_min = 200;
    gap_y_max = ground_y - 200;
    gap_y = Math.ceil(ground_y/2);

    // initialize beer keg symbols
	beer_keg = new Raster("beer_keg_a.png"); beer_keg_syms[1] = new Symbol(beer_keg);
	beer_keg = new Raster("beer_keg_b.png"); beer_keg_syms[2] = new Symbol(beer_keg);
	beer_keg = new Raster("beer_keg_c.png"); beer_keg_syms[3] = new Symbol(beer_keg);
	beer_keg = new Raster("beer_keg_d.png"); beer_keg_syms[4] = new Symbol(beer_keg);

    load_background();

    beer_mug = new Raster("beer_mug.svg");
    beer_mug.scale(0.5);
    beer_mug.position.y = ground_y/2 - beer_mug.bounds.height;
    beer_mug.position.x = vw/3 - beer_mug.bounds.width/2;

    var tool = new Tool();
    tool.onMouseUp = function(event) {
        bm_dy = -12;
        beer_mug.rotation = -25;
    }

    view.onFrame = function(event) {

    	keg_set_timer--;
    	if (keg_set_timer == 0){
    		make_keg_set();
    		keg_set_timer = keg_set_timer_max;
    	}

        bm_dy += 0.7;
        beer_mug.position.y += bm_dy;
        beer_mug.position.y = Math.min(vh,beer_mug.position.y)
        
        beer_mug.rotation = bm_dy

        for(i=0; i<bg_instances.length; i++){
        	bg_instances[i].position.x += bg_instances[i].dx;
        	if(bg_instances[i].bounds.left < bg_instances[i].thresh_x){
        		bg_instances[i].position.x += bg_instances[i].reset_dx;
        	}
        }

        for(i=keg_sets.length-1; i>=0; i--){
        	keg_sets[i].position.x += keg_sets[i].dx;

        	if(keg_sets[i].position.x < -keg_w/2){
        		keg_sets[i].remove();
        		keg_sets.shift();
        	}
        }
    }

    make_keg_set();

}

function make_keg_set(){

	var keg_set = new Group();

    // make top set of kegs
    for(keg_bottom_y=gap_y-gap_height/2; keg_bottom_y>0; keg_bottom_y-=keg_h-keg_offset){
    	keg_set.addChild(place_keg(keg_bottom_y-keg_h/2));
    }

    // make bottom set of kegs
    var lowest_keg_bottom = gap_y+keg_h+gap_height/2;
    while (lowest_keg_bottom < vh) lowest_keg_bottom += keg_h;
    for(keg_bottom_y=lowest_keg_bottom; keg_bottom_y>gap_y+keg_h+gap_height/2; keg_bottom_y-=keg_h-keg_offset){
    	keg_set.addChild(place_keg(keg_bottom_y-keg_h/2));
    }

    keg_set.dx = -4;
    keg_sets.push(keg_set);
    keg_set.insertBelow(bg_ground);

    gap_y += Math.ceil(Math.random()*400-200);
    gap_y = gap_y.clamp(gap_y_min, gap_y_max);
}


// places a beer keg at height y to the right of the screen
function place_keg(y){
	var rand_x_disp = (Math.ceil(Math.random()*4)-2)*2;
	var rand_keg_sym = beer_keg_syms[Math.ceil(Math.random()*4)]
	return rand_keg_sym.place([vw+keg_w/2+rand_x_disp, y]);
}


function load_background(){

    
    bg_sky = new Shape.Rectangle({ // blue sky rectangle 			
        from: [0, 0], to: [vw, vh],
        fillColor: '#70C6CF' });
    
    bg_clouds = new Shape.Rectangle({ // cream clouds rectangle
        from: [0, clouds_y], to: [vw, vh],
        fillColor: '#ECF3DB' });

    bg_trees = new Shape.Rectangle({ // cream clouds rectangle
        from: [0, trees_y], to: [vw, vh],
        fillColor: '#8FCB87' });

    bg_ground = new Shape.Rectangle({ // brown ground rectangle
        from: [0, ground_y], to: [vw, vh],
        fillColor: '#DDD994' });

    // groups for scrolling background items
    bg_ground_scroller = new Group();
    bg_trees_scroller = new Group();
    bg_clouds_scroller = new Group();

    var ground_scroller = new Raster("bg_ground_parallax_scroller.svg");
    var sym_w = 208;
    var ground_scroller_sym = new Symbol(ground_scroller);
    for(sym_x=sym_w/2; sym_x<vw+sym_w*3/2; sym_x+=sym_w){
        bg_ground_scroller.addChild(ground_scroller_sym.place([sym_x,ground_y]));
    }
    bg_instances.push(bg_ground_scroller);
    bg_ground_scroller.dx = -4;
    bg_ground_scroller.thresh_x = -208;
    bg_ground_scroller.reset_dx = 208;

    var clouds_scroller = new Raster("bg_clouds_parallax_scroller.png");
    var sym_w = 544, sym_h = 64;
    var clouds_scroller_sym = new Symbol(clouds_scroller);
    for(sym_x=sym_w/2; sym_x<vw+sym_w*3/2; sym_x+=sym_w){
        bg_clouds_scroller.addChild(clouds_scroller_sym.place([sym_x,clouds_y-sym_h/2+2]));
    }
    bg_instances.push(bg_clouds_scroller);
    bg_clouds_scroller.dx = -2;
    bg_clouds_scroller.thresh_x = -sym_w;
    bg_clouds_scroller.reset_dx = sym_w;

    var trees_scroller = new Raster("bg_trees_parallax_scroller.png");
    var sym_w = 352, sym_h = 102;
    var trees_scroller_sym = new Symbol(trees_scroller);
    for(sym_x=sym_w/2; sym_x<vw+sym_w*3/2; sym_x+=sym_w){
        bg_trees_scroller.addChild(trees_scroller_sym.place([sym_x,trees_y-sym_h/2+4]));
    }
    bg_instances.push(bg_trees_scroller);
    bg_trees_scroller.dx = -3;
    bg_trees_scroller.thresh_x = -sym_w;
    bg_trees_scroller.reset_dx = sym_w;

    bg_trees_scroller.insertBelow(bg_ground)
    bg_clouds_scroller.insertBelow(bg_ground)

}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};