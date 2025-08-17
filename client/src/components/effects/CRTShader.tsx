import React, { useRef, useEffect, useState } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '@/lib/shaderLoader';
import { useTheme } from '@/hooks/use-theme';

interface CRTShaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CRTShader({ children, className = '' }: CRTShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isWebGPUSupported, setIsWebGPUSupported] = useState(false);
  const { theme } = useTheme();

  // Convert theme to shader value
  const getThemeValue = (themeName: string): number => {
    switch (themeName) {
      case 'neon': return 0.0;
      case 'lumon': return 1.0;
      case 'pico': return 2.0;
      default: return 0.0;
    }
  };

  useEffect(() => {
    let animationId: number;
    let device: GPUDevice | null = null;
    let context: GPUCanvasContext | null = null;

    const initWebGPU = async () => {
      if (!navigator.gpu) {
        console.warn('WebGPU not supported, falling back to CSS effects');
        return;
      }

      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) throw new Error('No adapter found');

        device = await adapter.requestDevice();
        const canvas = canvasRef.current;
        if (!canvas) return;

        context = canvas.getContext('webgpu');
        if (!context) throw new Error('WebGPU context not available');

        const format = navigator.gpu.getPreferredCanvasFormat();
        context.configure({
          device,
          format,
          alphaMode: 'premultiplied',
        });

        setIsWebGPUSupported(true);

        // Create shader modules using inline shaders
        const vertexShader = device.createShaderModule({
          code: VERTEX_SHADER,
        });

        const fragmentShader = device.createShaderModule({
          code: FRAGMENT_SHADER,
        });

        // Create uniform buffer
        const uniformBuffer = device.createBuffer({
          size: 16, // vec2 + f32 + f32 (resolution, time, theme)
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // Create bind group layout
        const bindGroupLayout = device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.FRAGMENT,
              buffer: { type: 'uniform' },
            },
          ],
        });

        // Create render pipeline
        const pipeline = device.createRenderPipeline({
          layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
          }),
          vertex: {
            module: vertexShader,
            entryPoint: 'main',
          },
          fragment: {
            module: fragmentShader,
            entryPoint: 'main',
            targets: [{ 
              format,
              blend: {
                color: {
                  srcFactor: 'src-alpha',
                  dstFactor: 'one-minus-src-alpha',
                },
                alpha: {
                  srcFactor: 'one',
                  dstFactor: 'one-minus-src-alpha',
                },
              },
            }],
          },
          primitive: {
            topology: 'triangle-list',
          },
        });

        // Create bind group
        const bindGroup = device.createBindGroup({
          layout: bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: {
                buffer: uniformBuffer,
              },
            },
          ],
        });

        // Animation loop
        const render = (time: number) => {
          if (!device || !context || !canvas) return;

          // Update canvas size
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * devicePixelRatio;
          canvas.height = rect.height * devicePixelRatio;

          // Update uniforms
          const uniformData = new Float32Array([
            canvas.width,
            canvas.height,
            time * 0.001, // Convert to seconds
            getThemeValue(theme), // Current theme
          ]);

          device.queue.writeBuffer(uniformBuffer, 0, uniformData.buffer);

          // Render
          const commandEncoder = device.createCommandEncoder();
          const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
              {
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
          });

          renderPass.setPipeline(pipeline);
          renderPass.setBindGroup(0, bindGroup);
          renderPass.draw(6);
          renderPass.end();

          device.queue.submit([commandEncoder.finish()]);
          animationId = requestAnimationFrame(render);
        };

        animationId = requestAnimationFrame(render);
      } catch (error) {
        console.error('WebGPU initialization failed:', error);
        setIsWebGPUSupported(false);
      }
    };

    initWebGPU();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [theme]); // Re-initialize when theme changes

  return (
    <div className={`relative ${className}`}>
      {/* Content */}
      <div ref={contentRef} className="relative z-10">
        {children}
      </div>
      
      {/* WebGPU Canvas Overlay */}
      {isWebGPUSupported && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-20"
          style={{ mixBlendMode: 'overlay', opacity: 0.3 }}
        />
      )}
      
      {/* CSS Fallback with Enhanced Glow */}
      {!isWebGPUSupported && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="crt-screen crt-glow" />
          <div className="absolute inset-0 phosphor-glow-enhanced opacity-30" />
        </div>
      )}
    </div>
  );
}
