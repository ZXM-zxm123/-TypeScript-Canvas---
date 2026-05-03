cmake_minimum_required(VERSION 3.10)
project(CollisionWasm)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(${CMAKE_CURRENT_SOURCE_DIR})

add_library(collision SHARED collision.cpp)

set_target_properties(collision PROPERTIES
    PREFIX ""
    SUFFIX ".wasm")

if(EMSCRIPTEN)
    set(CMAKE_EXECUTABLE_SUFFIX ".wasm")
endif()
