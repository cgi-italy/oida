// cesium doesn't define the following types. we declare them
// here in order to be able to import them
declare module 'cesium' {
    declare const Texture;
    type Texture = any;
    declare const VertexArray;
    type VertexArray = any;
    declare const DrawCommand;
    type DrawCommand = any;
    declare const ShaderProgram;
    type ShaderProgram = any;
    declare const ShaderSource;
    type ShaderSource = any;
    declare const BufferUsage;
    type BufferUsage = any;
    declare const RenderState;
    type RenderState = any;
    declare const Pass;
    type Pass = any;
}
