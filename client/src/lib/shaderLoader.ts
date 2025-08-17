// Shader loader utility for WebGPU
export async function loadShader(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load shader: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading shader from ${path}:`, error);
    throw error;
  }
}

// Inline shaders as fallback (for build systems that don't serve .wgsl files)
export const VERTEX_SHADER = `
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
}

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0,  1.0)
    );
    
    var uv = array<vec2<f32>, 6>(
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 0.0)
    );

    var output: VertexOutput;
    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);
    output.uv = uv[vertexIndex];
    return output;
}
`;

export const FRAGMENT_SHADER = `
// CRT Shader with Chromatic Aberration, Glow, Scanlines, Dot Matrix and Transparency
// Converted to WebGPU WGSL with Theme Support

struct Uniforms {
    resolution: vec2<f32>,
    time: f32,
    theme: f32, // 0=neon, 1=lumon, 2=pico
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var inputTexture: texture_2d<f32>;
@group(0) @binding(2) var inputSampler: sampler;

// Base Parameters
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

// Theme-specific parameters
fn getThemeParams(theme: f32) -> vec4<f32> {
    if (theme < 0.5) {
        // NEON theme - Enhanced glow
        return vec4<f32>(1.8, 0.8, 1.2, 0.6); // neon_boost, outer_glow, inner_glow, phosphor
    } else if (theme < 1.5) {
        // LUMON theme - Classic blue glow
        return vec4<f32>(1.4, 0.6, 0.9, 0.4); // moderate glow for blue
    } else {
        // PICO theme - Retro pixel glow
        return vec4<f32>(1.6, 0.7, 1.0, 0.5); // balanced for all PICO colors
    }
}

// Theme-specific color enhancement
fn enhanceThemeColors(color: vec3<f32>, theme: f32) -> vec3<f32> {
    if (theme < 0.5) {
        // NEON: Boost pink/purple range
        let pinkFactor = smoothstep(0.3, 0.8, color.r) * smoothstep(0.1, 0.6, color.b);
        let purpleFactor = smoothstep(0.4, 0.9, color.b) * smoothstep(0.3, 0.7, color.r);
        return color * (1.0 + (pinkFactor + purpleFactor) * 0.8);
    } else if (theme < 1.5) {
        // LUMON: Boost cyan/blue range
        let cyanFactor = smoothstep(0.2, 0.8, color.b) * smoothstep(0.1, 0.6, color.g);
        return color * (1.0 + cyanFactor * 0.6);
    } else {
        // PICO: Boost all saturated colors equally
        let saturation = max(max(color.r, color.g), color.b) - min(min(color.r, color.g), color.b);
        return color * (1.0 + saturation * 0.5);
    }
}

// Enhanced Glow Sampling with theme awareness
fn sampleGlow(uv: vec2<f32>, radius: f32, intensity: f32, theme: f32) -> vec3<f32> {
    var glow = vec3<f32>(0.0);
    let step = 1.0 / uniforms.resolution;
    let samples_count = 16;
    
    for (var i = 0; i < samples_count; i++) {
        let angle = f32(i) * 6.28318 / f32(samples_count);
        let offset = vec2<f32>(cos(angle), sin(angle)) * radius * step;
        let sample_color = textureSample(inputTexture, inputSampler, uv + offset);
        
        // Theme-specific glow threshold
        let threshold = select(0.1, select(0.15, 0.08, theme < 1.5), theme < 0.5);
        
        if (length(sample_color.rgb) > threshold) {
            let enhanced = enhanceThemeColors(sample_color.rgb, theme);
            glow += enhanced * intensity / f32(samples_count);
        }
    }
    
    return glow;
}

// Phosphor glow effect with theme support
fn applyPhosphorGlow(color: vec3<f32>, uv: vec2<f32>, theme: f32) -> vec3<f32> {
    let brightness = dot(color, vec3<f32>(0.299, 0.587, 0.114));
    let params = getThemeParams(theme);
    
    let threshold = select(0.1, select(0.15, 0.08, theme < 1.5), theme < 0.5);
    
    if (brightness > threshold) {
        let innerGlow = sampleGlow(uv, 3.0, params.z, theme);
        let outerGlow = sampleGlow(uv, 8.0, params.y, theme);
        
        // Combine glows with original color
        let enhanced = color + innerGlow * params.w + outerGlow * (params.w * 0.5);
        
        // Apply theme-specific color enhancement
        return enhanceThemeColors(enhanced, theme) * params.x;
    }
    
    return color;
}

// Theme-specific scanline effects
fn applyThemeScanlines(color: vec3<f32>, fragCoord: vec2<f32>, theme: f32) -> vec3<f32> {
    let scanline = abs(sin(fragCoord.y) * SCANLINE_DENSITY * SCANLINE_INTENSITY);
    
    // Reduce scanline intensity on bright areas to preserve glow
    let brightness = dot(color, vec3<f32>(0.299, 0.587, 0.114));
    let scanlineReduction = smoothstep(0.3, 0.8, brightness) * 0.5;
    let adjustedScanline = scanline * (1.0 - scanlineReduction);
    
    // Theme-specific scanline colors
    var scanlineColor = vec3<f32>(0.0);
    if (theme < 0.5) {
        // NEON: Pink-tinted scanlines
        scanlineColor = vec3<f32>(0.2, 0.05, 0.15);
    } else if (theme < 1.5) {
        // LUMON: Blue-tinted scanlines
        scanlineColor = vec3<f32>(0.05, 0.1, 0.2);
    } else {
        // PICO: Neutral scanlines
        scanlineColor = vec3<f32>(0.1, 0.1, 0.1);
    }
    
    return mix(color, color * 0.3 + scanlineColor, adjustedScanline);
}

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let theme = uniforms.theme;
    
    // Apply Chromatic Aberration with theme-specific intensity
    let aberrationStrength = select(ABBERATION_FACTOR, select(ABBERATION_FACTOR * 0.8, ABBERATION_FACTOR * 1.2, theme < 1.5), theme < 0.5);
    let amount = sin(uniforms.time * 2.0) * 0.5 + 1.0;
    
    let colR = textureSample(inputTexture, inputSampler, vec2<f32>(uv.x - aberrationStrength * amount / uniforms.resolution.x, uv.y));
    let colG = textureSample(inputTexture, inputSampler, uv);
    let colB = textureSample(inputTexture, inputSampler, vec2<f32>(uv.x + aberrationStrength * amount / uniforms.resolution.x, uv.y));

    // Combine colors while preserving alpha
    var col = vec4<f32>(colR.r, colG.g, colB.b, colG.a);

    // Apply Enhanced Phosphor Glow with theme support
    col.rgb = applyPhosphorGlow(col.rgb, uv, theme);

    // Apply theme-specific scanlines
    let fragCoord = uv * uniforms.resolution;
    col.rgb = applyThemeScanlines(col.rgb, fragCoord, theme);

    // Apply Dot Matrix with theme-aware intensity
    let mask_pos = fragCoord * MASK_SIZE;
    let maskIntensity = select(MASK_INTENSITY, select(MASK_INTENSITY * 0.7, MASK_INTENSITY * 0.9, theme < 1.5), theme < 0.5);
    let mask = 1.0 - (maskIntensity * (
        0.5 + 0.5 * sin(mask_pos.x * 3.14159) *
        sin(mask_pos.y * 3.14159)
    ));

    // Final color with mask
    col.rgb *= mask;

    // Apply global opacity
    col.a *= GLOBAL_OPACITY;

    return col;
}
`;
