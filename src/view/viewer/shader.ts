import { ImgCountX, ImgCountY, OutPutSizeX, OutPutSizeY } from './config'
export const Shader_Str_Template = /* glsl */ `
    #ifdef GL_ES
    precision highp float;
    #endif

    // Samplers
    varying vec2 vUV;
    uniform sampler2D tDiffuse;
    uniform float slope;
    uniform float interval;
    uniform float x0;

    // Parameters
    // uniform float threshold;

    //float num_of_view = 50.0;
    float row_img_num = $imgs_count_x$;
    float col_img_num = $imgs_count_y$;
    float num_of_view = $imgs_count_all$;
    // float slope = -0.1007;
    // float interval = 19.6104;
    // float x0 = 0.0;
    // float slope = -0.0946;
    // float interval = 29.1803;
    // float x0 = 15.;
    // float gridSizeX = 1440.0;
    // float gridSizeY = 2560.0;
    float gridSizeX = $output_size_X$;
    float gridSizeY = $output_size_Y$;
    vec2 get_choice(vec2 pos, float bias) 
    {
        // Convert position to grid coordinates
        float x = floor(pos.x * gridSizeX)+1.;
        float y = floor((1.0 - pos.y) * gridSizeY)+1.;

        // Compute a local x coordinate based on grid position, slope, and bias
        float x1 = (x + y * slope) * 3.0 + bias;
        float x_local = mod(x1 + x0, interval);

        // Determine the choice index based on the local x coordinate
        int choice = int(floor(
            (x_local / interval) * num_of_view
        ));

        // Calculate row and column choices
        vec2 choice_vec = vec2(
            row_img_num - mod(float(choice), row_img_num) - 1., // col_choice (column index), modified to match left-to-right grid arrangement
            floor(float(choice) / row_img_num) // row_choice (row index)
        );

        // Precompute reciprocals to avoid division in the loop
        vec2 reciprocals = vec2(1.0 / row_img_num, 1.0 / col_img_num);

        // Calculate texture coordinates and return
        vec2 uv = (choice_vec.xy + pos) * reciprocals; // Note the .yx swizzle to match row/col order
        return uv;
    }
    vec4 get_color(float bias) {
        vec2 sel_pos = get_choice(vUV, bias);
        return texture2D(tDiffuse, sel_pos);
    }
    void main(void) 
    {

        vec4 color = get_color(0.0); // r
        color.g = get_color(1.0).g; //g
        color.b = get_color(2.0).b; //b
        gl_FragColor = vec4(color.rgb, 1.);

        // gl_FragColor = color;
        // gl_FragColor = vec4(pow(color.rgb, vec3(1.0/1.66)), 1.);
        // gl_FragColor = vec4(color.r * color.r, color.g * color.g, color.b * color.b, 1.) + 0.1;
        // gl_FragColor = texture2D(tDiffuse, vUV);  // vec4(1,0,0,0.5); //newColor;
        // gl_FragColor = vec4(vUV, 0., 1.);
    }
    `
function toFloatString(x: number) {
    if (Number.isInteger(x)) {
        return x + '.0'
    } else {
        return x.toString()
    }
}
export class EffectShader {
    private _slope: number = 0.09878 // Lenticular grating slope
    private _interval = 19.6138 // Lenticular grating interval
    private _x0 = -1.951725 // 13.6 - this._interval / 8  // Lenticular grating offset
    private _imgs_count_x = ImgCountX // Number of horizontal viewports
    private _imgs_count_y = ImgCountY // Number of vertical viewports

    private _output_size_X = OutPutSizeX // Output width
    private _output_size_Y = OutPutSizeY // Output height
    private _shader_str_template = Shader_Str_Template // Interlaced image shader template
    constructor() {
        //
    }

    getFinalShader() {
        let shaderStrTemp = ''
        shaderStrTemp = this._shader_str_template
            .replaceAll('$imgs_count_x$', toFloatString(this._imgs_count_x))
            .replaceAll('$imgs_count_y$', toFloatString(this._imgs_count_y))
            .replaceAll('$imgs_count_all$', toFloatString(this._imgs_count_x * this._imgs_count_y))
            .replaceAll('$slope$', toFloatString(this._slope))
            .replaceAll('$interval$', toFloatString(this._interval))
            .replaceAll('$x0$', toFloatString(this._x0))
            .replaceAll('$output_size_X$', toFloatString(this._output_size_X))
            .replaceAll('$output_size_Y$', toFloatString(this._output_size_Y))
        shaderStrTemp = shaderStrTemp
            .replaceAll('$imgs_count_x$', this._imgs_count_x.toString())
            .replaceAll('$imgs_count_y$', this._imgs_count_y.toString())
            .replaceAll('$imgs_count_all$', (this._imgs_count_x * this._imgs_count_y).toString())
        return shaderStrTemp
    }

    get slope(): number {
        return this._slope
    }
    set slope(val: number) {
        this._slope = val
    }

    get interval(): number {
        return this._interval
    }
    set interval(val: number) {
        this._interval = val
    }

    get x0(): number {
        return this._x0
    }
    set x0(val: number) {
        this._x0 = val
    }

    get imgs_count_x(): number {
        return this._imgs_count_x
    }
    set imgs_count_x(val: number) {
        this._imgs_count_x = val
    }

    get imgs_count_y(): number {
        return this._imgs_count_y
    }
    set imgs_count_y(val: number) {
        this._imgs_count_y = val
    }

    get output_size_X(): number {
        return this._output_size_Y
    }
    set output_size_X(val: number) {
        this._output_size_X = val
    }

    get output_size_Y(): number {
        return this._output_size_Y
    }
    set output_size_Y(val: number) {
        this._output_size_Y = val
    }
}
