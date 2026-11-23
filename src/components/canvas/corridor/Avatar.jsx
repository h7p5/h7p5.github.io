import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Avatar Component - Hand-drawn sketch style character
 *
 * - Parallax depth effect on scroll
 * - Dodges when camera approaches
 * - Waves: a looping video (generated on a green background). The green is
 *   removed in the shader, so the character is drawn with transparency.
 *   drei caches the video texture by URL, so every corridor segment shares one video.
 */

const VIDEO_URL = '/videos/avatar-wave.mp4';
const SIZE = 2.3; // plane width and height (square video)

const Avatar = ({ position = [10, -20, 30] }) => {
    const groupRef = useRef();
    const { camera } = useThree();

    // Dodge state
    const dodgeX = useRef(0);
    const targetDodgeX = useRef(0);
    const worldPosVec = useRef(new THREE.Vector3());

    const videoTex = useVideoTexture(VIDEO_URL, {
        muted: true,
        loop: true,
        start: true,
        playsInline: true,
        crossOrigin: 'Anonymous',
    });

    useEffect(() => {
        videoTex.colorSpace = THREE.SRGBColorSpace;
    }, [videoTex]);

    // Chroma key: pixels where green clearly dominates become transparent.
    // The drawing is black/grey/white, so its colour is rebuilt from red/blue,
    // which also removes the green fringe around the lines.
    const keyGreen = useCallback((shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#include <map_fragment>
            float greenness = diffuseColor.g - max(diffuseColor.r, diffuseColor.b);
            diffuseColor.a *= 1.0 - smoothstep(0.08, 0.30, greenness);
            diffuseColor.rgb = vec3(max(diffuseColor.r, diffuseColor.b));`
        );
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;

        // === DODGE LOGIC ===
        groupRef.current.getWorldPosition(worldPosVec.current);
        const distance = camera.position.z - worldPosVec.current.z;

        const DODGE_START = 3;
        const DODGE_PEAK = 0;
        const DODGE_END = -2;
        const DODGE_AMOUNT = -1.5;

        if (distance > DODGE_PEAK && distance < DODGE_START) {
            const t = (DODGE_START - distance) / (DODGE_START - DODGE_PEAK);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else if (distance <= DODGE_PEAK && distance > DODGE_END) {
            const t = (distance - DODGE_END) / (DODGE_PEAK - DODGE_END);
            targetDodgeX.current = DODGE_AMOUNT * easeOutQuad(t);
        } else {
            targetDodgeX.current = 0;
        }

        dodgeX.current = THREE.MathUtils.lerp(dodgeX.current, targetDodgeX.current, 0.08);

        groupRef.current.position.x = position[0] + dodgeX.current;
        groupRef.current.position.y = position[1];
    });

    return (
        <group ref={groupRef} position={position}>
            <mesh>
                <planeGeometry args={[SIZE, SIZE]} />
                <meshBasicMaterial
                    map={videoTex}
                    color="#ffffff"
                    transparent={true}
                    alphaTest={0.02}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                    onBeforeCompile={keyGreen}
                />
            </mesh>
        </group>
    );
};

// Easing function
const easeOutQuad = (t) => t * (2 - t);

export default Avatar;
