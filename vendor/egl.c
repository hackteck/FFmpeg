#include <EGL/egl.h>
#include <GLES3/gl3.h>
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>

// EGL context and display variables
EGLDisplay display;
EGLSurface surface;
EGLContext context;

// Shader sources
const char *vertexSource = R"(
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
)";

const char *fragmentSource = R"(
    precision mediump float;
    uniform vec3 color;
    void main() {
        gl_FragColor = vec4(color, 1.0);
    }
)";

// Main loop
void main_loop()
{
    // Clear the screen
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glClear(GL_COLOR_BUFFER_BIT);

    // Use the program
    glUseProgram(program);

    // Draw the triangle
    glDrawArrays(GL_TRIANGLES, 0, 3);

    // Swap buffers
    eglSwapBuffers(display, surface);
}

int main()
{
    // Initialize EGL
    display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    eglInitialize(display, NULL, NULL);

    EGLConfig config;
    EGLint numConfigs;
    EGLint contextAttribs[] = {EGL_CONTEXT_CLIENT_VERSION, 3, EGL_NONE};

    // Choose an appropriate EGL configuration
    eglChooseConfig(display, NULL, &config, 1, &numConfigs);

    // Create EGL context and surface
    surface = eglCreateWindowSurface(display, config, EM_ASM_INT(return document.getElementById('canvas')), NULL);
    context = eglCreateContext(display, config, EGL_NO_CONTEXT, contextAttribs);
    eglMakeCurrent(display, surface, surface, context);

    // Compile and link shaders
    GLuint vertexShader = compileShader(vertexSource, GL_VERTEX_SHADER);
    GLuint fragmentShader = compileShader(fragmentSource, GL_FRAGMENT_SHADER);

    GLuint program = glCreateProgram();
    glAttachShader(program, vertexShader);
    glAttachShader(program, fragmentShader);
    glLinkProgram(program);

    // Start the main loop
    emscripten_set_main_loop(main_loop, 0, 1);

    return 0;
}
