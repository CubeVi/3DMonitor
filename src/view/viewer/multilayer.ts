import * as BABYLON from '@babylonjs/core'
export class Location5{
    constructor(
        x0, x1, y0, y1,
        zk
    ) {
        this.x0 = x0
        this.x1 = x1
        this.y0 = y0
        this.y1 = y1
        this.zk = zk
    }
}
const nullLocation5=new Location5(-200,-199,-200,-199,0)
export class Plane {
    constructor(
        texture, 
        location5
    ) {
        this.texture = texture
        this.location5 = location5
    }
} // supposed to be a very thin struct

export const buildPlane = (scene, url, loc) => {
    return new Plane(new BABYLON.Texture(url, scene), loc)
}
function toFloatString(x) {
    if (Number.isInteger(x)) {
        return x + '.0'
    } else {
        return x.toString()
    }
}
function bool2int(x){
    return x+0
}

let slope = 0.1057
let interval = 19.625
let x0 = 8.89

const output_size_X = 1440;
const output_size_Y = 2560;
// const imgs_count_x = 5
const imgs_count_x = 8
const imgs_count_y = 5
/**
 * a swizzler template for simple multipass shader's each pass to add a overlay with depth
 */
const Shader_Str_Swizzler_Fixed_Layeres_Template = /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif


// // consider define them if needed
// #define INV_X $inv_x$
// #define INV_Y $inv_y$




// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D overlay0Texture;
uniform sampler2D overlay1Texture;
uniform sampler2D overlay2Texture;
float x0_0 = $x0_0$;     // for convinence, all are uniform floats, not relavant to pixels
float x1_0 = $x1_0$;     // 
float y0_0 = $y0_0$;     // 
float y1_0 = $y1_0$;     // 
float zk_0 = $zk_0$; // z_k = z * tangent(angle), and we directly shift image with respect to it. i.e. x' = z_k*angle

float x0_1 = $x0_1$;     // for convinence, all are uniform floats, not relavant to pixels
float x1_1 = $x1_1$;     // 
float y0_1 = $y0_1$;     // 
float y1_1 = $y1_1$;     // 
float zk_1 = $zk_1$; // z_k = z * tangent(angle), and we directly shift image with respect to it. i.e. x' = z_k*angle

float x0_2 = $x0_2$;     // for convinence, all are uniform floats, not relavant to pixels
float x1_2 = $x1_2$;     // 
float y0_2 = $y0_2$;     // 
float y1_2 = $y1_2$;     // 
float zk_2 = $zk_2$; // z_k = z * tangent(angle), and we directly shift image with respect to it. i.e. x' = z_k*angle


// vec2 nullloc = vec2(-1., -1.);

// Parameters
// float slope = $slope$;
// float interval = $interval$;
// float x0 = $x0$;
uniform float slope;
uniform float interval;
uniform float x0;

//float num_of_view = 50.0;
float row_img_num = $imgs_count_x$;
float col_img_num = $imgs_count_y$;
float num_of_view = $imgs_count_all$;

float Gamma = 1.80;
float gridSizeX = $output_size_X$;
float gridSizeY = $output_size_Y$;

// range: 0-1.
float get_choice_float(vec2 pos, float bias) 
{
    // Convert position to grid coordinates
    float x = floor(pos.x * gridSizeX) + 0.5;
    float y = floor((1.0 - pos.y) * gridSizeY) + 0.5;

    // Compute a local x coordinate based on grid position, slope, and bias
    float x1 = (x + y * slope) * 3.0 + bias;
    float x_local = mod(x1 + x0, interval);

    // Determine the choice index based on the local x coordinate
        return (x_local / interval);

}
vec2 get_choice_base(vec2 pos, float bias) 
{
    // Convert position to grid coordinates
    float x = floor(pos.x * 1440.)+1.;
    float y = floor((1.0 - pos.y) * 2560.)+1.;

    // Compute a local x coordinate based on grid position, slope, and bias
    float x1 = (x + y * slope) * 3.0 + bias;
    float x_local = mod(x1 + x0, interval);

    // Determine the choice index based on the local x coordinate
    int choice = int(floor(
        (x_local / interval) * 40.
    ));

    // Calculate row and column choices
    vec2 choice_vec = vec2(
        // 8.0 - mod(float(choice), 8.) - 1., // col_choice (column index), modified to match left-to-right grid arrangement
        mod(float(choice), 8.),
        floor(float(choice) / 8.) // row_choice (row index)
    );

    // Precompute reciprocals to avoid division in the loop
    vec2 reciprocals = vec2(1.0 / 8., 1.0 / 5.);

    // Calculate texture coordinates and return
    vec2 uv = (choice_vec.xy + pos) * reciprocals; // Note the .yx swizzle to match row/col order
    return uv;
}
vec2 get_uv_from_choice(vec2 pos, float choice_float){
    int choice = int(floor(choice_float*num_of_view));
        // Calculate row and column choices
        vec2 choice_vec = vec2(
            // col_choice (column index)
            // #if INV_X
            // row_img_num-mod(float(choice), row_img_num) -1.0
            // #else
            8.0 - mod(float(choice), row_img_num) - 1.0
            // #endif
            ,
            // row_choice (row index)
            // #if INV_Y
            // col_img_num-floor(float(choice) / row_img_num) -1.0
            // #else
            floor(float(choice) / row_img_num) 
            // #endif
        );

    // Precompute reciprocals to avoid division in the loop
    vec2 reciprocals = vec2(1.0 / row_img_num, 1.0 / col_img_num);

    // Calculate texture coordinates and return
    vec2 uv = (choice_vec.xy + pos) * reciprocals; // Note the .yx swizzle to match row/col order
    return uv;
}
// vec2 get_choice(vec2 pos, float bias){
//     return get_uv_from_choice(pos, get_choice_float(pos, bias));
// }
vec4 blend(vec4 src, vec4 dst) {
    float alpha = src.a;
    src.a = 1.;
    return alpha * src + (1.0 - alpha) * dst;
}
vec2 get_rel_loc(
    float choice_f, float x_0, float x_1, float y_0, float y_1, float z_k
    ) {
    float view_angle = choice_f - .5;
    /////
    // should be: offset x = 
    float x_offset = view_angle * z_k;
    float x_rel = (vUV.x - x_offset - x_0) / (x_1 - x_0);
    float y_rel = (vUV.y - y_0) / (y_1 - y_0);

    if (x_rel > 1. || x_rel < 0. || y_rel > 1. || y_rel < 0.){
        return vec2(-1., -1.); // use this to denote nothing
    }
    return vec2(x_rel, y_rel);
}

// 
vec4 get_color_channel(float bias){
    // basic
    float choice_float = get_choice_float(vUV, bias);
    // float choice2 = choice_float *2. - 1.;
    // choice_float = abs(choice2);

    // return vec4(choice_float,choice_float,choice_float,1.);
    vec2 uv1=vec2(-1., -1.);
    vec4 color;
    vec4 cumulative_front=vec4(0.,0.,0.,0.);
    // uv1 = get_uv_from_choice(vUV, choice_float);
    // color = vec4(uv1,0.,1.);
    // color = texture2D(textureSampler, vUV);
    // color = texture2D(overlay1Texture, vUV);
    // color.a =1.;
    // return color;

    // uv1 = get_uv_from_choice(vUV, choice_float);
    // // color = texture2D(textureSampler, uv1);
    // color = texture2D(textureSampler, uv1);
    // cumulative_front = blend(cumulative_front, color);
    // // if (color.rgb != vec3(0.,0.,0.)){
    // //     cumulative_front = blend(cumulative_front, color);
    // //     return cumulative_front;
    // // }
    // return cumulative_front;
    // overlay_0
    uv1 = get_rel_loc(choice_float, x0_0, x1_0, y0_0, y1_0, zk_0);
    // return vec4(uv1, 0., 1.);
    if (uv1.x != -1.){
        color = texture2D(overlay0Texture, uv1);
        cumulative_front = blend(cumulative_front, color);
        if (cumulative_front.a >= 0.99){// non-transparent
            return cumulative_front;
        }
    }
    // // overlay_1
    // uv1 = get_rel_loc(choice_float, x0_1, x1_1, y0_1, y1_1, zk_1);
    // if (uv1.x != -1.){
    //     color = texture2D(overlay1Texture, uv1);
    //     cumulative_front = blend(cumulative_front, color);
    //     if (cumulative_front.a >= 0.99){// non-transparent
    //         return cumulative_front;
    //     }
    // }

    // // base from 3d box render
    // vec2 sel_pos = get_choice_base(vUV, bias);
    // color = texture2D(overlay1Texture, sel_pos);
    // cumulative_front = blend(cumulative_front, color);
    // return cumulative_front;
    // if (color.rgb != vec3(0.,0.,0.)){
    //     color = texture2D(overlay1Texture, sel_pos);
    //     cumulative_front = blend(cumulative_front, color);
    //     return cumulative_front;
    // }
    // base from 3d box render
    uv1 = get_uv_from_choice(vUV, choice_float);
    color = texture2D(textureSampler, uv1);
    // color = texture2D(textureSampler, vUV);
    if (color.rgb != vec3(0.,0.,0.)){
        cumulative_front = blend(cumulative_front, color);
        return cumulative_front;
    }

    // // overlay_2
    // uv1 = get_rel_loc(choice_float, x0_2, x1_2, y0_2, y1_2, zk_2);
    // if (uv1.x != -1.){
    //     color = texture2D(overlay2Texture, uv1);
    //     cumulative_front = blend(cumulative_front, color);
    //     if (cumulative_front.a >= 0.99){// non-transparent
    //         return cumulative_front;
    //     }
        
    // }


}

// vec4 get_color_channels(vec4 ref_color){
//     // 1. early exit if y is not right. should be optimized later 
//     if (uv.y > y_1 || uv.y < y_0){
//         return ref_color;
//     }
//     ref_color = get_color(0.0, ref_color);
//     ref_color.g = get_color(1.0, ref_color).g;
//     ref_color.b = get_color(0.0, ref_color).b;
//     return ref_color;
// }

void main(void) 
{   

    vec4 color = get_color_channel(0.0); // r
    color.g    = get_color_channel(1.0).g; //g
    color.b    = get_color_channel(2.0).b; //b
    gl_FragColor = color;
    // gl_FragColor = texture2D(textureSampler, vUV);
    // gl_FragColor=get_color_channels(color);

    
    // gl_FragColor = vec4(pow(color.rgb, vec3(1.0/Gamma)), 1.);

    // gl_FragColor = color;
    // gl_FragColor = vec4(pow(color.rgb, vec3(1.0/Gamma)), 1.);
    // gl_FragColor = vec4(color.r * color.r, color.g * color.g, color.b * color.b, 1.) + 0.1;
    // gl_FragColor = texture2D(textureSampler, vUV) * vec4(1., 0.5, 1., 1.);  // vec4(1,0,0,0.5); //newColor;
    // gl_FragColor = texture2D(overlay0Texture, vUV);  // vec4(1,0,0,0.5); //newColor;
}`//Shader_Str_Swizzler_Fixed_Layeres_Template

export const getSwizzlerFixedLayersFragShader = (loc0, loc1, loc2, inv_x = false, inv_y = false) => {
    return Shader_Str_Swizzler_Fixed_Layeres_Template
    .replaceAll('$slope$', toFloatString(slope))
    .replaceAll('$interval$', toFloatString(interval))
    .replaceAll('$x0$', toFloatString(x0))
    .replaceAll('$output_size_X$', toFloatString(output_size_X))
    .replaceAll('$output_size_Y$', toFloatString(output_size_Y))
    .replaceAll('$imgs_count_x$', toFloatString(imgs_count_x))
    .replaceAll('$imgs_count_y$', toFloatString(imgs_count_y))
    .replaceAll('$imgs_count_all$', toFloatString(imgs_count_x * imgs_count_y))
    


    .replaceAll('$x0_0$', toFloatString(loc0.x0))
    .replaceAll('$x1_0$', toFloatString(loc0.x1))
    .replaceAll('$y0_0$', toFloatString(loc0.y0))
    .replaceAll('$y1_0$', toFloatString(loc0.y1))
    .replaceAll('$zk_0$', toFloatString(loc0.zk))

    .replaceAll('$x0_1$', toFloatString(loc1.x0))
    .replaceAll('$x1_1$', toFloatString(loc1.x1))
    .replaceAll('$y0_1$', toFloatString(loc1.y0))
    .replaceAll('$y1_1$', toFloatString(loc1.y1))
    .replaceAll('$zk_1$', toFloatString(loc1.zk))

    .replaceAll('$x0_2$', toFloatString(loc2.x0))
    .replaceAll('$x1_2$', toFloatString(loc2.x1))
    .replaceAll('$y0_2$', toFloatString(loc2.y0))
    .replaceAll('$y1_2$', toFloatString(loc2.y1))
    .replaceAll('$zk_2$', toFloatString(loc2.zk))
    // .replaceAll('$inv_x$', bool2int(inv_x)) //seems not working
    // .replaceAll('$inv_y$', bool2int(inv_y))

}






/**
 * a swizzler template for simple multipass shader's each pass to add a overlay with depth
 */
const Shader_Str_Swizzler_Layered_Template = /* glsl */ `
#ifdef GL_ES
precision highp float;
#endif

// Samplers
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform sampler2D overlayImage;
uniform float x_0;     // for convinence, all are uniform floats, not relavant to pixels
uniform float x_1;     // 
uniform float y_0;     // 
uniform float y_1;     // 
uniform float z_k; // z_k = z * tangent(angle), and we directly shift image with respect to it. i.e. x' = z_k*angle



// Parameters
float slope = $slope$;
float interval = $interval$;
float x0 = $x0$;

float Gamma = 1.80;
float gridSizeX = $output_size_X$;
float gridSizeY = $output_size_Y$;
// range: 0-1.
float get_choice(vec2 pos, float bias) 
{
    // Convert position to grid coordinates
    float x = floor(pos.x * gridSizeX) + 0.5;
    float y = floor((1.0 - pos.y) * gridSizeY) + 0.5;

    // Compute a local x coordinate based on grid position, slope, and bias
    float x1 = (x + y * slope) * 3.0 + bias;
    float x_local = mod(x1 + x0, interval);

    // Determine the choice index based on the local x coordinate
        return (x_local / interval);

}

vec4 get_color(float bias, vec4 ref_color) {
    float view_angle = get_choice(vUV, bias)*2. - 1.;
    /////
    // should be: offset x = 
    float x_offset = view_angle * z_k;
    float x_rel = (vUV.x - x_offset - x_0) / (x_1 - x_0);
    float y_rel = (vUV.y - y_0) / (y_1 - y_0);
    if (x_rel > 1. || x_new < 0.){
        return ref_color;
    }
    return texture2D(overlayImage, vec2(x_rel, y_rel));
}

vec4 get_color_channels(vec4 ref_color){
    // 1. early exit if y is not right. should be optimized later 
    if (uv.y > y_1 || uv.y < y_0){
        return ref_color;
    }
    ref_color = get_color(0.0, ref_color);
    ref_color.g = get_color(1.0, ref_color).g;
    ref_color.b = get_color(0.0, ref_color).b;
    return ref_color;
}
void main(void) 
{

    vec4 color = texture2D(textureSampler, vUV);
    gl_FragColor=get_color_channels(color);

    
    // gl_FragColor = vec4(pow(color.rgb, vec3(1.0/Gamma)), 1.);

    // gl_FragColor = color;
    // gl_FragColor = vec4(pow(color.rgb, vec3(1.0/Gamma)), 1.);
    // gl_FragColor = vec4(color.r * color.r, color.g * color.g, color.b * color.b, 1.) + 0.1;
    // gl_FragColor = texture2D(overlay0Texture, vUV);  // vec4(1,0,0,0.5); //newColor;
}`

function getSwizzlerLayeredFragShader(){
    return Shader_Str_Swizzler_Layered_Template
    .replaceAll('$slope$', toFloatString(slope))
    .replaceAll('$interval$', toFloatString(interval))
    .replaceAll('$x0$', toFloatString(x0))
    .replaceAll('$output_size_X$', toFloatString(output_size_X))
    .replaceAll('$output_size_Y$', toFloatString(output_size_Y))
        
}


