// WebGPU type declarations
declare global {
  interface Navigator {
    gpu?: GPU;
  }

  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
    getPreferredCanvasFormat(): GPUTextureFormat;
  }

  interface GPUAdapter {
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  }

  interface GPUDevice {
    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
    createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
    createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
    createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
    createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
    createCommandEncoder(): GPUCommandEncoder;
    queue: GPUQueue;
  }

  interface GPUCanvasContext {
    configure(configuration: GPUCanvasConfiguration): void;
    getCurrentTexture(): GPUTexture;
  }

  interface HTMLCanvasElement {
    getContext(contextId: 'webgpu'): GPUCanvasContext | null;
  }

  // Additional WebGPU types
  type GPUTextureFormat = string;
  type GPUBufferUsageFlags = number;
  type GPUShaderStageFlags = number;

  const GPUBufferUsage: {
    UNIFORM: GPUBufferUsageFlags;
    COPY_DST: GPUBufferUsageFlags;
  };

  const GPUShaderStage: {
    FRAGMENT: GPUShaderStageFlags;
  };

  interface GPUShaderModuleDescriptor {
    code: string;
  }

  interface GPUBufferDescriptor {
    size: number;
    usage: GPUBufferUsageFlags;
  }

  interface GPUBindGroupLayoutDescriptor {
    entries: GPUBindGroupLayoutEntry[];
  }

  interface GPUBindGroupLayoutEntry {
    binding: number;
    visibility: GPUShaderStageFlags;
    buffer?: { type: string };
  }

  interface GPUPipelineLayoutDescriptor {
    bindGroupLayouts: GPUBindGroupLayout[];
  }

  interface GPURenderPipelineDescriptor {
    layout: GPUPipelineLayout;
    vertex: {
      module: GPUShaderModule;
      entryPoint: string;
    };
    fragment?: {
      module: GPUShaderModule;
      entryPoint: string;
      targets: GPUColorTargetState[];
    };
    primitive?: {
      topology: string;
    };
  }

  interface GPUColorTargetState {
    format: GPUTextureFormat;
    blend?: {
      color: {
        srcFactor: string;
        dstFactor: string;
      };
      alpha: {
        srcFactor: string;
        dstFactor: string;
      };
    };
  }

  interface GPUBindGroupDescriptor {
    layout: GPUBindGroupLayout;
    entries: GPUBindGroupEntry[];
  }

  interface GPUBindGroupEntry {
    binding: number;
    resource: {
      buffer: GPUBuffer;
    };
  }

  interface GPUCanvasConfiguration {
    device: GPUDevice;
    format: GPUTextureFormat;
    alphaMode: string;
  }

  interface GPUQueue {
    writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: ArrayBuffer): void;
    submit(commandBuffers: GPUCommandBuffer[]): void;
  }

  interface GPUCommandEncoder {
    beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
    finish(): GPUCommandBuffer;
  }

  interface GPURenderPassDescriptor {
    colorAttachments: GPURenderPassColorAttachment[];
  }

  interface GPURenderPassColorAttachment {
    view: GPUTextureView;
    clearValue: { r: number; g: number; b: number; a: number };
    loadOp: string;
    storeOp: string;
  }

  interface GPURenderPassEncoder {
    setPipeline(pipeline: GPURenderPipeline): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup): void;
    draw(vertexCount: number): void;
    end(): void;
  }

  interface GPUTexture {
    createView(): GPUTextureView;
  }

  // Placeholder interfaces
  interface GPUShaderModule {}
  interface GPUBuffer {}
  interface GPUBindGroupLayout {}
  interface GPUPipelineLayout {}
  interface GPURenderPipeline {}
  interface GPUBindGroup {}
  interface GPUCommandBuffer {}
  interface GPUTextureView {}
  interface GPURequestAdapterOptions {}
  interface GPUDeviceDescriptor {}
}

export {};
