// CRT Shader with Chromatic Aberration, Glow, Scanlines, Dot Matrix and Transparency
// Converted to WebGPU WGSL

struct Uniforms {
    resolution: vec2<f32>,
    time: f32,
    _padding: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;
@group(0) @binding(2) var inputSampler: sampler;

// Customizable Parameters
const GLOBAL_OPACITY: f32 = 0.9;
const ABBERATION_FACTOR: f32 = 0.005;
const DIM_CUTOFF: f32 = 0.35;
const BRIGHT_CUTOFF: f32 = 0.30;
const BRIGHT_BOOST: f32 = 1.5;
const DIM_GLOW: f32 = 0.05;
const BRIGHT_GLOW: f32 = 0.15;
const COLOR_GLOW: f32 = 0.4;
const SCANLINE_INTENSITY: f32 = 1.5;
const SCANLINE_DENSITY: f32 = 0.25;
const MASK_INTENSITY: f32 = 0.6;
const MASK_SIZE: f32 = 1.0;

// Enhanced Glow Parameters
const OUTER_GLOW_RADIUS: f32 = 8.0;
const OUTER_GLOW_INTENSITY: f32 = 0.8;
const INNER_GLOW_RADIUS: f32 = 3.0;
const INNER_GLOW_INTENSITY: f32 = 1.2;
const GLOW_THRESHOLD: f32 = 0.1;
const PHOSPHOR_GLOW: f32 = 0.6;
const NEON_BOOST: f32 = 1.8;

// Color Space Conversion Functions
fn f(x: f32) -> f32 {
    if (x >= 0.0031308) {
        return 1.055 * pow(x, 1.0 / 2.4) - 0.055;
    }
    return 12.92 * x;
}

fn f_inv(x: f32) -> f32 {
    if (x >= 0.04045) {
        return pow((x + 0.055) / 1.055, 2.4);
    }
    return x / 12.92;
}

fn toOklab(rgb: vec4<f32>) -> vec4<f32> {
    let c = vec3<f32>(f_inv(rgb.r), f_inv(rgb.g), f_inv(rgb.b));
    let l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
    let m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
    let s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
    let l_ = pow(l, 1.0 / 3.0);
    let m_ = pow(m, 1.0 / 3.0);
    let s_ = pow(s, 1.0 / 3.0);
    return vec4<f32>(
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
        rgb.a
    );
}

// Bloom sample points
const samples = array<vec3<f32>, 24>(
    vec3<f32>(0.1693761725038636, 0.9855514761735895, 1.0),
    vec3<f32>(-1.333070830962943, 0.4721463328627773, 0.7071067811865475),
    vec3<f32>(-0.8464394909806497, -1.51113870578065, 0.5773502691896258),
    vec3<f32>(1.554155680728463, -1.2588090085709776, 0.5),
    vec3<f32>(1.681364377589461, 1.4741145918052656, 0.4472135954999579),
    vec3<f32>(-1.2795157692199817, 2.088741103228784, 0.4082482904638631),
    vec3<f32>(-2.4575847530631187, -0.9799373355024756, 0.3779644730092272),
    vec3<f32>(0.5874641440200847, -2.7667464429345077, 0.35355339059327373),
    vec3<f32>(2.997715703369726, 0.11704939884745152, 0.3333333333333333),
    vec3<f32>(0.41360842451688395, 3.1351121305574803, 0.31622776601683794),
    vec3<f32>(-3.167149933769243, 0.9844599011770256, 0.30151134457776363),
    vec3<f32>(-1.5736713846521535, -3.0860263079123245, 0.2886751345948129),
    vec3<f32>(2.888202648340422, -2.1583061557896213, 0.2773500981126146),
    vec3<f32>(2.7150778983300325, 2.5745586041105715, 0.2672612419124244),
    vec3<f32>(-2.1504069972377464, 3.2211410627650165, 0.2581988897471611),
    vec3<f32>(-3.6548858794907493, -1.6253643308191343, 0.25),
    vec3<f32>(1.0130775986052671, -3.9967078676335834, 0.24253562503633297),
    vec3<f32>(4.229723673607257, 0.33081361055181563, 0.23570226039551587),
    vec3<f32>(0.40107790291173834, 4.340407413572593, 0.22941573387056174),
    vec3<f32>(-4.319124570236028, 1.159811599693438, 0.22360679774997896),
    vec3<f32>(-1.9209044802827355, -4.160543952132907, 0.2182178902359924),
    vec3<f32>(3.8639122286635708, -2.6589814382925123, 0.21320071635561041),
    vec3<f32>(3.3486228404946234, 3.4331800232609, 0.20851441405707477),
    vec3<f32>(-2.8769733643574344, 3.9652268864187157, 0.20412414523193154)
);

fn offsetFunction(time: f32) -> f32 {
    var amount = 1.0;
    let periods = array<f32, 4>(6.0, 16.0, 19.0, 27.0);
    for (var i = 0; i < 4; i++) {
        amount *= 1.0 + 0.5 * sin(time * periods[i]);
    }
    return amount * periods[3];
}

// Enhanced Glow Sampling
fn sampleGlow(uv: vec2<f32>, radius: f32, intensity: f32) -> vec3<f32> {
    var glow = vec3<f32>(0.0);
    let step = 1.0 / uniforms.resolution;
    let samples_count = 16;
    
    for (var i = 0; i < samples_count; i++) {
        let angle = f32(i) * 6.28318 / f32(samples_count);
        let offset = vec2<f32>(cos(angle), sin(angle)) * radius * step;
        let sample_color = textureSample(inputTexture, inputSampler, uv + offset);
        
        // Only contribute bright pixels to glow
        if (length(sample_color.rgb) > GLOW_THRESHOLD) {
            glow += sample_color.rgb * intensity / f32(samples_count);
        }
    }
    
    return glow;
}

// Phosphor glow effect
fn applyPhosphorGlow(color: vec3<f32>, uv: vec2<f32>) -> vec3<f32> {
    let brightness = dot(color, vec3<f32>(0.299, 0.587, 0.114));
    
    if (brightness > GLOW_THRESHOLD) {
        let innerGlow = sampleGlow(uv, INNER_GLOW_RADIUS, INNER_GLOW_INTENSITY);
        let outerGlow = sampleGlow(uv, OUTER_GLOW_RADIUS, OUTER_GLOW_INTENSITY);
        
        // Combine glows with original color
        let enhanced = color + innerGlow * PHOSPHOR_GLOW + outerGlow * (PHOSPHOR_GLOW * 0.5);
        
        // Boost neon colors (pink/purple range)
        let neonFactor = smoothstep(0.3, 0.8, enhanced.r) * smoothstep(0.1, 0.6, enhanced.b);
        return enhanced * (1.0 + neonFactor * NEON_BOOST);
    }
    
    return color;
}

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    // Apply Chromatic Aberration
    let amount = offsetFunction(uniforms.time);
    let colR = textureSample(inputTexture, inputSampler, vec2<f32>(uv.x - ABBERATION_FACTOR * amount / uniforms.resolution.x, uv.y));
    let colG = textureSample(inputTexture, inputSampler, uv);
    let colB = textureSample(inputTexture, inputSampler, vec2<f32>(uv.x + ABBERATION_FACTOR * amount / uniforms.resolution.x, uv.y));

    // Combine colors while preserving alpha
    var col = vec4<f32>(colR.r, colG.g, colB.b, colG.a);

    // Process Colors and Apply Original Glow
    let splittedColor = col;
    let source = toOklab(splittedColor);
    var dest = source;

    if (source.x > DIM_CUTOFF) {
        dest.x *= BRIGHT_BOOST;
    } else {
        let step = vec2<f32>(1.414) / uniforms.resolution;
        var glow = vec3<f32>(0.0);
        for (var i = 0; i < 24; i++) {
            let s = samples[i];
            let weight = s.z;
            let c = toOklab(textureSample(inputTexture, inputSampler, uv + s.xy * step));
            if (c.x > DIM_CUTOFF) {
                glow.yz += c.yz * weight * COLOR_GLOW;
                if (c.x <= BRIGHT_CUTOFF) {
                    glow.x += c.x * weight * DIM_GLOW;
                } else {
                    glow.x += c.x * weight * BRIGHT_GLOW;
                }
            }
        }
        dest.xyz += glow.xyz;
    }

    var processedColor = toRgb(dest);

    // Apply Enhanced Phosphor Glow
    processedColor.rgb = applyPhosphorGlow(processedColor.rgb, uv);

    // Apply Scanlines with glow interaction
    let fragCoord = uv * uniforms.resolution;
    let scanline = abs(sin(fragCoord.y) * SCANLINE_DENSITY * SCANLINE_INTENSITY);
    
    // Reduce scanline intensity on bright areas to preserve glow
    let brightness = dot(processedColor.rgb, vec3<f32>(0.299, 0.587, 0.114));
    let scanlineReduction = smoothstep(0.3, 0.8, brightness) * 0.5;
    let adjustedScanline = scanline * (1.0 - scanlineReduction);

    // Apply Dot Matrix with glow preservation
    let mask_pos = fragCoord * MASK_SIZE;
    let mask = 1.0 - (MASK_INTENSITY * (
        0.5 + 0.5 * sin(mask_pos.x * 3.14159) *
        sin(mask_pos.y * 3.14159)
    ) * (1.0 - scanlineReduction * 0.3));

    // Combine Effects while preserving glow
    let final_color = processedColor.rgb * mask;
    let with_scanline = mix(final_color, final_color * 0.3, adjustedScanline);

    // Apply global opacity while preserving the original alpha relationship
    let final_alpha = processedColor.a * GLOBAL_OPACITY;

    return vec4<f32>(with_scanline, final_alpha);
}
