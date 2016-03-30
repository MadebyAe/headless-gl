function dumpBuffer (gl, width, height) {
  // Write output
  var pixels = new Uint8Array(width * height * 4)
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
  process.stdout.write(['P3\n# gl.ppm\n', width, ' ', height, '\n255\n'].join(''))
  for (var i = 0; i < pixels.length; i += 4) {
    process.stdout.write(pixels[i] + ' ' + pixels[i + 1] + ' ' + pixels[i + 2] + ' ')
  }
}

function drawTriangle (gl) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-2, -2, -2, 4, 4, -2]), gl.STREAM_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.disableVertexAttribArray(0)
  gl.deleteBuffer(buffer)
}

function loadShader (gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType)
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  // Check the compile status
  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!compiled) {
    // Something went wrong during compilation; get the error
    var lastError = gl.getShaderInfoLog(shader)
    console.log("*** Error compiling shader '" + shader + "':" + lastError)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function createProgram (gl, shaders, opt_attribs, opt_locations) {
  var program = gl.createProgram()
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader)
  })
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib)
    })
  }
  gl.linkProgram(program)

  // Check the link status
  var linked = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (!linked) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog(program)
    console.log('Error in program linking:' + lastError)

    gl.deleteProgram(program)
    return null
  }
  return program
}

function createProgramFromSources (gl, shaderSources, opt_attribs, opt_locations) {
  var defaultShaderType = [
    'VERTEX_SHADER',
    'FRAGMENT_SHADER'
  ]

  var shaders = []
  for (var ii = 0; ii < shaderSources.length; ++ii) {
    shaders.push(loadShader(gl, shaderSources[ii], gl[defaultShaderType[ii]]))
  }
  return createProgram(gl, shaders, opt_attribs, opt_locations)
}

module.exports.dumpBuffer = dumpBuffer
module.exports.drawTriangle = drawTriangle
module.exports.loadShader = loadShader
module.exports.createProgram = createProgram
module.exports.createProgramFromSources = createProgramFromSources
